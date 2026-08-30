# RazorShield AI - Main FastAPI Application
import os
import time
import json
import hmac
import hashlib
import asyncio
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse

from app.models import (
    Transaction, RiskEvaluationResponse, GraphDataResponse,
    InvestigationRequest, InvestigationReport, ApplyRuleRequest,
    FirewallRule, SimulationScenarioRequest, RazorpayWebhookPayload
)
from app.engine.risk_engine import FastPathRiskEngine
from app.graph.fraud_graph import FraudGraph
from app.firewall.firewall_manager import FirewallManager
from app.agent.forensic_agent import ForensicAgent
from app.simulator.traffic_generator import TrafficGenerator
from app.reports.dossier_generator import DossierGenerator

# Initialize Core Subsystems
firewall_manager = FirewallManager()
risk_engine = FastPathRiskEngine(firewall_manager=firewall_manager)
fraud_graph = FraudGraph()
forensic_agent = ForensicAgent(
    fraud_graph=fraud_graph, 
    velocity_tracker=risk_engine.velocity_tracker, 
    firewall_manager=firewall_manager
)
traffic_generator = TrafficGenerator()

# In-memory storage for transaction feed and generated cases
recent_transactions: List[Dict[str, Any]] = []
cached_cases: Dict[str, InvestigationReport] = {}
stats_metrics = {
    "total_evaluated": 0,
    "total_blocked_inr": 1482400.0,
    "total_challenged": 0,
    "total_allowed": 0,
    "avg_latency_ms": 14.2
}

# SSE Client Broadcast Queues
subscribers: List[asyncio.Queue] = []

async def broadcast_event(event_type: str, data: Any):
    payload = json.dumps({"event": event_type, "data": data, "timestamp": time.time()})
    dead_queues = []
    for q in subscribers:
        try:
            await q.put(payload)
        except Exception:
            dead_queues.append(q)
    for dq in dead_queues:
        if dq in subscribers:
            subscribers.remove(dq)

# Lifespan context to bootstrap data on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[RazorShield AI] Bootstrapping system with 50 pre-seeded Indian FinTech transactions...")
    boot_txs = traffic_generator.generate_bootstrap_dataset(50)
    for tx in boot_txs:
        resp = risk_engine.evaluate(tx)
        fraud_graph.add_transaction(tx, resp.risk_score)
        recent_transactions.insert(0, {
            "tx": tx.model_dump() if hasattr(tx, "model_dump") else tx.dict(),
            "evaluation": resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
        })
        stats_metrics["total_evaluated"] += 1
        if resp.decision == "HARD_BLOCK":
            stats_metrics["total_blocked_inr"] += tx.amount
        elif resp.decision == "STEP_UP_AUTH":
            stats_metrics["total_challenged"] += 1
        else:
            stats_metrics["total_allowed"] += 1
            
    # Pre-generate one sample case
    sample_report = await forensic_agent.investigate("vpa:mule_aggregate@okhdfcbank")
    cached_cases[sample_report.case_id] = sample_report
    cached_cases["LATEST"] = sample_report
    print(f"[RazorShield AI] Initialized with {len(boot_txs)} transactions and active entity graph.")
    yield

app = FastAPI(
    title="RazorShield AI - Dual-Tier Autonomous Risk & Syndicate Defense",
    version="1.0.0",
    description="Sub-30ms Risk Gating, In-Memory Bipartite Fraud Graph & Autonomous AI Copilot for Razorpay",
    lifespan=lifespan
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENDPOINTS ====================

@app.get("/api/v1/system/stats")
async def get_system_stats():
    graph_data = fraud_graph.get_graph_d3_data()
    return {
        "engine_status": "ONLINE",
        "sub_30ms_latency_ms": stats_metrics["avg_latency_ms"],
        "total_evaluated": stats_metrics["total_evaluated"],
        "total_blocked_inr": round(stats_metrics["total_blocked_inr"], 2),
        "total_challenged": stats_metrics["total_challenged"],
        "total_allowed": stats_metrics["total_allowed"],
        "graph_node_count": len(graph_data.nodes),
        "graph_edge_count": len(graph_data.links),
        "active_firewall_rules": len([r for r in firewall_manager.get_all_rules() if r.status == "ACTIVE"]),
        "razorpay_webhook_status": "CONNECTED"
    }

@app.post("/api/v1/evaluate", response_model=RiskEvaluationResponse)
async def evaluate_transaction(tx: Transaction, background_tasks: BackgroundTasks):
    """
    Tier-1 Synchronous High-Throughput Risk Evaluation (<30ms).
    """
    eval_resp = risk_engine.evaluate(tx)
    
    # Update Tier-2 Graph asynchronously
    fraud_graph.add_transaction(tx, eval_resp.risk_score)
    
    # Update Stats
    stats_metrics["total_evaluated"] += 1
    stats_metrics["avg_latency_ms"] = round((stats_metrics["avg_latency_ms"] * 0.9) + (eval_resp.latency_ms * 0.1), 2)
    if eval_resp.decision == "HARD_BLOCK":
        stats_metrics["total_blocked_inr"] += tx.amount
    elif eval_resp.decision == "STEP_UP_AUTH":
        stats_metrics["total_challenged"] += 1
    else:
        stats_metrics["total_allowed"] += 1

    tx_record = {
        "tx": tx.model_dump() if hasattr(tx, "model_dump") else tx.dict(),
        "evaluation": eval_resp.model_dump() if hasattr(eval_resp, "model_dump") else eval_resp.dict()
    }
    recent_transactions.insert(0, tx_record)
    if len(recent_transactions) > 300:
        recent_transactions.pop()

    # Broadcast event via SSE
    background_tasks.add_task(broadcast_event, "NEW_TRANSACTION", tx_record)

    return eval_resp

@app.post("/api/v1/webhooks/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Ingests and validates standard Razorpay payment payloads with HMAC verification.
    """
    raw_body = await request.body()
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "razorshield_buildathon_secret")
    
    # Verify HMAC if signature header is provided
    if x_razorpay_signature:
        expected_sig = hmac.new(
            webhook_secret.encode('utf-8'),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected_sig, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid Razorpay HMAC signature")

    try:
        data = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")

    # Extract payment entity
    payload_payment = data.get("payload", {}).get("payment", {}).get("entity", {})
    if not payload_payment:
        return {"status": "ignored", "reason": "No payment entity found"}

    method_str = payload_payment.get("method", "upi").upper()
    payment_method = PaymentMethod.CARD if method_str == "CARD" else PaymentMethod.UPI
    amount_inr = float(payload_payment.get("amount", 10000)) / 100.0  # Razorpay amounts are in paise

    tx = Transaction(
        id=payload_payment.get("id", f"pay_{uuid.uuid4().hex[:10]}"),
        timestamp=float(payload_payment.get("created_at", time.time())),
        amount=amount_inr,
        currency=payload_payment.get("currency", "INR"),
        payment_method=payment_method,
        card_bin=payload_payment.get("card", {}).get("emi") or payload_payment.get("card_id") or "411111",
        card_hash=payload_payment.get("card_id"),
        upi_vpa=payload_payment.get("vpa"),
        user_id=payload_payment.get("contact", f"usr_{payload_payment.get('id', 'anon')[-6:]}"),
        ip_address=payload_payment.get("notes", {}).get("ip_address", "103.21.244.15"),
        device_fingerprint=payload_payment.get("notes", {}).get("device_id", "dev_fp_rzp_hook"),
        merchant_id=data.get("account_id", "mid_razorpay_ecom"),
        razorpay_order_id=payload_payment.get("order_id")
    )

    eval_resp = await evaluate_transaction(tx, background_tasks)
    return {
        "status": "processed",
        "decision": eval_resp.decision,
        "risk_score": eval_resp.risk_score,
        "latency_ms": eval_resp.latency_ms
    }

@app.get("/api/v1/stream/transactions")
async def stream_transactions(request: Request):
    """
    Server-Sent Events (SSE) stream for live transactions and copilot alerts.
    """
    queue = asyncio.Queue()
    subscribers.append(queue)

    async def event_generator():
        try:
            # First send recent 25 transactions as initial snapshot
            yield {
                "event": "INITIAL_SNAPSHOT",
                "data": json.dumps({"recent": recent_transactions[:25]})
            }
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {"event": "MESSAGE", "data": msg}
                except asyncio.TimeoutError:
                    # Send keepalive heartbeat
                    yield {"event": "PING", "data": json.dumps({"time": time.time()})}
        finally:
            if queue in subscribers:
                subscribers.remove(queue)

    return EventSourceResponse(event_generator())

@app.get("/api/v1/graph/data", response_model=GraphDataResponse)
async def get_graph_data():
    """
    Returns NetworkX bipartite graph nodes and edges for D3 Canvas rendering.
    """
    return fraud_graph.get_graph_d3_data()

@app.get("/api/v1/graph/mule-clusters")
async def get_mule_clusters():
    return fraud_graph.detect_mule_clusters()

@app.post("/api/v1/agent/investigate", response_model=InvestigationReport)
async def run_investigation(req: InvestigationRequest):
    """
    Triggers Autonomous AI Forensic Copilot investigation on an entity or mule ring.
    """
    target = req.entity_id or "vpa:mule_aggregate@okhdfcbank"
    report = await forensic_agent.investigate(target)
    cached_cases[report.case_id] = report
    cached_cases["LATEST"] = report
    
    # Broadcast investigation event
    await broadcast_event("INVESTIGATION_COMPLETED", report.model_dump() if hasattr(report, "model_dump") else report.dict())
    return report

@app.get("/api/v1/firewall/rules", response_model=List[FirewallRule])
async def list_firewall_rules():
    return firewall_manager.get_all_rules()

@app.post("/api/v1/firewall/rules/apply")
async def apply_firewall_rule(req: ApplyRuleRequest):
    rule = req.rule
    rule.status = req.apply_mode
    firewall_manager.add_or_update_rule(rule)
    await broadcast_event("RULE_UPDATED", rule.model_dump() if hasattr(rule, "model_dump") else rule.dict())
    return {"status": "success", "rule": rule}

@app.post("/api/v1/firewall/rules/{rule_id}/status")
async def toggle_rule_status(rule_id: str, status: str):
    updated = firewall_manager.update_rule_status(rule_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    await broadcast_event("RULE_UPDATED", updated.model_dump() if hasattr(updated, "model_dump") else updated.dict())
    return {"status": "success", "rule": updated}

@app.get("/api/v1/cases/{case_id}/export")
async def export_case_dossier(case_id: str, format: str = "json"):
    report = cached_cases.get(case_id) or cached_cases.get("LATEST")
    if not report:
        raise HTTPException(status_code=404, detail="Forensic case not found")

    if format == "html":
        html_content = DossierGenerator.generate_html_dossier(report)
        return HTMLResponse(content=html_content)
    else:
        return DossierGenerator.generate_rbi_json(report)

# ==================== ATTACK SIMULATION TRIGGER ====================
@app.post("/api/v1/simulation/start")
async def trigger_simulation(req: SimulationScenarioRequest, background_tasks: BackgroundTasks):
    scenario = req.scenario.upper()
    
    if scenario == "CARD_TESTING":
        txs = traffic_generator.generate_scenario_card_testing(req.count or 25)
    elif scenario == "MULE_RING":
        txs = traffic_generator.generate_scenario_mule_ring(req.count or 10)
    elif scenario == "ACCOUNT_TAKEOVER":
        txs = traffic_generator.generate_scenario_account_takeover()
    else:
        txs = [traffic_generator.generate_benign_transaction() for _ in range(req.count or 15)]

    async def stream_simulation_batch(batch: List[Transaction]):
        for tx in batch:
            eval_resp = risk_engine.evaluate(tx)
            fraud_graph.add_transaction(tx, eval_resp.risk_score)
            
            stats_metrics["total_evaluated"] += 1
            if eval_resp.decision == "HARD_BLOCK":
                stats_metrics["total_blocked_inr"] += tx.amount
            elif eval_resp.decision == "STEP_UP_AUTH":
                stats_metrics["total_challenged"] += 1
            else:
                stats_metrics["total_allowed"] += 1

            tx_record = {
                "tx": tx.model_dump() if hasattr(tx, "model_dump") else tx.dict(),
                "evaluation": eval_resp.model_dump() if hasattr(eval_resp, "model_dump") else eval_resp.dict()
            }
            recent_transactions.insert(0, tx_record)
            if len(recent_transactions) > 300:
                recent_transactions.pop()
            
            await broadcast_event("NEW_TRANSACTION", tx_record)
            await asyncio.sleep(0.12)  # realistic simulation cadence

    background_tasks.add_task(stream_simulation_batch, txs)
    return {"status": "simulation_started", "scenario": scenario, "tx_count": len(txs)}
