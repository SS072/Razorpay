# RazorShield AI - Core Domain Models & Schemas
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
import time

class PaymentMethod(str, Enum):
    UPI = "UPI"
    CARD = "CARD"
    NETBANKING = "NETBANKING"
    WALLET = "WALLET"

class RiskDecision(str, Enum):
    ALLOW = "ALLOW"
    STEP_UP_AUTH = "STEP_UP_AUTH"
    HARD_BLOCK = "HARD_BLOCK"

class RuleStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SHADOW = "SHADOW"
    ROLLED_BACK = "ROLLED_BACK"

class RuleAction(str, Enum):
    BLOCK = "BLOCK"
    CHALLENGE = "CHALLENGE"
    FLAG = "FLAG"

class LocationInfo(BaseModel):
    city: str = "Mumbai"
    country: str = "IN"
    lat: float = 19.0760
    lon: float = 72.8777

class Transaction(BaseModel):
    id: str = Field(..., description="Unique transaction ID (e.g. txn_... or pay_...)")
    timestamp: float = Field(default_factory=time.time, description="Epoch timestamp in seconds")
    amount: float = Field(..., description="Transaction amount in INR")
    currency: str = Field(default="INR")
    payment_method: PaymentMethod = PaymentMethod.UPI
    card_bin: Optional[str] = Field(None, description="First 6 digits of card, e.g. '411111'")
    card_hash: Optional[str] = Field(None, description="Salted hash of full card number")
    upi_vpa: Optional[str] = Field(None, description="UPI Virtual Payment Address, e.g. 'user@okhdfcbank'")
    user_id: str = Field(..., description="Customer / Account ID")
    ip_address: str = Field(..., description="Client IP address")
    device_fingerprint: str = Field(..., description="Hardware / Browser canvas fingerprint")
    merchant_id: str = Field(..., description="Razorpay Merchant ID (e.g. mid_...)")
    location: LocationInfo = Field(default_factory=LocationInfo)
    razorpay_order_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RiskFlag(BaseModel):
    code: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    weight: int

class RiskEvaluationResponse(BaseModel):
    transaction_id: str
    decision: RiskDecision
    risk_score: int = Field(..., ge=0, le=100, description="Risk Score from 0 (benign) to 100 (critical fraud)")
    latency_ms: float
    triggered_rules: List[str]
    flags: List[RiskFlag]
    syndicate_cluster_id: Optional[str] = None
    recommended_action: str

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # user, card, vpa, ip, device, merchant
    risk_level: str  # normal, medium, high, critical
    tx_count: int = 1
    total_amount: float = 0.0
    is_seed: bool = False

class GraphLink(BaseModel):
    source: str
    target: str
    relation: str  # USED_BY, LINKED_TO, PAID_FROM, ASSOCIATED_IP, TRANSFERRED_TO
    weight: int = 1
    is_suspicious: bool = False

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]
    stats: Dict[str, Any]

class MuleCluster(BaseModel):
    cluster_id: str
    risk_score: int
    entity_count: int
    entities: List[str]
    shared_vpas: List[str]
    shared_devices: List[str]
    total_volume_inr: float
    pattern_type: str

class EvidenceItem(BaseModel):
    timestamp: str
    source: str
    detail: str
    severity: str

class BlastRadiusStats(BaseModel):
    fraud_volume_prevented_inr: float
    affected_entities_count: int
    false_positive_rate_pct: float
    historical_match_count: int

class FirewallRule(BaseModel):
    rule_id: str
    name: str
    description: str
    condition_dsl: str
    action: RuleAction
    status: RuleStatus = RuleStatus.ACTIVE
    created_at: float = Field(default_factory=time.time)
    created_by: str = "RazorShield AI Autonomous Copilot"
    blocked_count: int = 0
    shadow_matched_count: int = 0
    estimated_fp_rate: float = 0.01

class ApplyRuleRequest(BaseModel):
    rule: FirewallRule
    apply_mode: RuleStatus = RuleStatus.ACTIVE

class InvestigationRequest(BaseModel):
    entity_id: Optional[str] = None
    cluster_id: Optional[str] = None
    transaction_id: Optional[str] = None
    investigation_depth: int = 2

class InvestigationReport(BaseModel):
    case_id: str
    target_entity: str
    title: str
    summary: str
    confidence_score: int = Field(..., ge=0, le=100)
    syndicate_members: List[Dict[str, str]]
    evidence_trail: List[EvidenceItem]
    recommended_firewall_rule: FirewallRule
    blast_radius: BlastRadiusStats
    rbi_compliance_tags: List[str]
    generated_at: str
    raw_reasoning_log: Optional[str] = None

class SimulationScenarioRequest(BaseModel):
    scenario: str  # NORMAL_STREAM, CARD_TESTING, MULE_RING, ACCOUNT_TAKEOVER
    count: int = 50
    interval_ms: int = 200

class RazorpayWebhookPayload(BaseModel):
    entity: str = "event"
    account_id: str
    event: str
    contains: List[str] = ["payment"]
    payload: Dict[str, Any]
    created_at: int
