# RazorShield AI - Tier 1 Fast-Path Deterministic Risk Engine (<25ms synchronous)
import time
import math
from collections import defaultdict, deque
from typing import List, Tuple, Dict, Optional, Any
from app.models import Transaction, RiskEvaluationResponse, RiskDecision, RiskFlag, RuleStatus, RuleAction

# Haversine distance calculator in kilometers
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class SlidingWindowVelocityTracker:
    def __init__(self):
        # Maps entity_key -> deque of (timestamp, amount, tx_id, metadata)
        self.ip_window = defaultdict(lambda: deque())
        self.user_window = defaultdict(lambda: deque())
        self.card_window = defaultdict(lambda: deque())
        self.vpa_window = defaultdict(lambda: deque())
        self.device_window = defaultdict(lambda: deque())
        
        # Keep last known location for users/cards: entity -> (timestamp, lat, lon, city)
        self.last_location = {}

    def _clean_old(self, q: deque, max_age_sec: float = 300.0, current_time: float = None):
        if current_time is None:
            current_time = time.time()
        while q and (current_time - q[0][0]) > max_age_sec:
            q.popleft()

    def record_and_get_metrics(self, tx: Transaction) -> Dict[str, Any]:
        now = tx.timestamp or time.time()
        
        # Clean expired
        for q in [self.ip_window[tx.ip_address], self.user_window[tx.user_id], self.device_window[tx.device_fingerprint]]:
            self._clean_old(q, 300.0, now)
        if tx.card_hash:
            self._clean_old(self.card_window[tx.card_hash], 300.0, now)
        if tx.upi_vpa:
            self._clean_old(self.vpa_window[tx.upi_vpa], 300.0, now)

        # Count in 60s and 300s
        def count_since(q: deque, window_sec: float) -> int:
            return sum(1 for item in q if (now - item[0]) <= window_sec)

        def sum_since(q: deque, window_sec: float) -> float:
            return sum(item[1] for item in q if (now - item[0]) <= window_sec)

        ip_60s = count_since(self.ip_window[tx.ip_address], 60.0)
        ip_300s = count_since(self.ip_window[tx.ip_address], 300.0)
        user_60s = count_since(self.user_window[tx.user_id], 60.0)
        user_300s = count_since(self.user_window[tx.user_id], 300.0)
        device_60s = count_since(self.device_window[tx.device_fingerprint], 60.0)
        
        card_60s = count_since(self.card_window[tx.card_hash], 60.0) if tx.card_hash else 0
        vpa_60s = count_since(self.vpa_window[tx.upi_vpa], 60.0) if tx.upi_vpa else 0

        # Unique cards tested on this IP in last 60s
        unique_cards_on_ip = len(set(item[3].get('card_hash') for item in self.ip_window[tx.ip_address] if item[3].get('card_hash')))
        # Unique users tested on this device in last 300s
        unique_users_on_device = len(set(item[3].get('user_id') for item in self.device_window[tx.device_fingerprint] if item[3].get('user_id')))

        # Geo-velocity check against last location
        geo_hop_speed_kmh = 0.0
        geo_hop_city = None
        user_loc_key = f"user:{tx.user_id}"
        if user_loc_key in self.last_location and tx.location:
            prev_time, prev_lat, prev_lon, prev_city = self.last_location[user_loc_key]
            time_diff_hours = max((now - prev_time) / 3600.0, 0.0001)
            dist_km = haversine_km(prev_lat, prev_lon, tx.location.lat, tx.location.lon)
            if dist_km > 50.0:  # Noticeable distance
                geo_hop_speed_kmh = dist_km / time_diff_hours
                geo_hop_city = prev_city

        # Update last location
        if tx.location:
            self.last_location[user_loc_key] = (now, tx.location.lat, tx.location.lon, tx.location.city)
            if tx.card_hash:
                self.last_location[f"card:{tx.card_hash}"] = (now, tx.location.lat, tx.location.lon, tx.location.city)

        # Record this transaction
        meta = {"user_id": tx.user_id, "card_hash": tx.card_hash, "upi_vpa": tx.upi_vpa, "amount": tx.amount}
        self.ip_window[tx.ip_address].append((now, tx.amount, tx.id, meta))
        self.user_window[tx.user_id].append((now, tx.amount, tx.id, meta))
        self.device_window[tx.device_fingerprint].append((now, tx.amount, tx.id, meta))
        if tx.card_hash:
            self.card_window[tx.card_hash].append((now, tx.amount, tx.id, meta))
        if tx.upi_vpa:
            self.vpa_window[tx.upi_vpa].append((now, tx.amount, tx.id, meta))

        return {
            "ip_60s": ip_60s,
            "ip_300s": ip_300s,
            "user_60s": user_60s,
            "user_300s": user_300s,
            "device_60s": device_60s,
            "card_60s": card_60s,
            "vpa_60s": vpa_60s,
            "unique_cards_on_ip": unique_cards_on_ip,
            "unique_users_on_device": unique_users_on_device,
            "geo_hop_speed_kmh": geo_hop_speed_kmh,
            "prev_city": geo_hop_city
        }


class FastPathRiskEngine:
    """
    Sub-25ms deterministic risk scorer combining:
    - Velocity anomaly detection
    - Impossible geo-velocity calculation
    - Rapid micro-card testing heuristic
    - Device multi-accounting flags
    - Active dynamic firewall rule enforcement
    """
    def __init__(self, firewall_manager=None):
        self.velocity_tracker = SlidingWindowVelocityTracker()
        self.firewall_manager = firewall_manager

    def evaluate(self, tx: Transaction) -> RiskEvaluationResponse:
        start_time = time.perf_counter()
        
        flags: List[RiskFlag] = []
        triggered_rules: List[str] = []
        total_risk_score = 0
        hard_block_triggered = False

        # 1. Check Active & Shadow Firewall Rules
        if self.firewall_manager:
            fw_flags, fw_triggered, is_blocked = self.firewall_manager.evaluate_transaction(tx)
            flags.extend(fw_flags)
            triggered_rules.extend(fw_triggered)
            if is_blocked:
                hard_block_triggered = True

        # 2. Extract Velocity Metrics
        metrics = self.velocity_tracker.record_and_get_metrics(tx)

        # Rule A: Rapid Card Testing Detection (BIN/Micro-amount attack)
        # 5+ transactions on same IP in 60s or testing multiple cards with small amounts (<= ₹20)
        if tx.amount <= 25.0 and metrics["ip_60s"] >= 4:
            flags.append(RiskFlag(
                code="CARD_TESTING_BURST",
                description=f"High frequency micro-transaction burst ({metrics['ip_60s']} tx/min, amount ₹{tx.amount}) on IP {tx.ip_address}",
                severity="CRITICAL",
                weight=45
            ))
            triggered_rules.append("RULE_CARD_TESTING_BURST_IP")
            total_risk_score += 45

        if metrics["unique_cards_on_ip"] >= 3:
            flags.append(RiskFlag(
                code="DISTRIBUTED_CARD_SWEEP",
                description=f"Multiple distinct cards ({metrics['unique_cards_on_ip']} unique cards) routed through single IP in 60s",
                severity="CRITICAL",
                weight=50
            ))
            triggered_rules.append("RULE_MULTI_CARD_IP_SWEEP")
            total_risk_score += 50

        # Rule B: Impossible Geo-Velocity Hop
        # Greater than 800 km/h indicates commercial flight violation / credential stuffing across VPN
        if metrics["geo_hop_speed_kmh"] > 800.0:
            flags.append(RiskFlag(
                code="IMPOSSIBLE_GEO_VELOCITY",
                description=f"Physical impossible velocity ({metrics['geo_hop_speed_kmh']:.0f} km/h) from {metrics['prev_city']} to {tx.location.city}",
                severity="CRITICAL",
                weight=60
            ))
            triggered_rules.append("RULE_IMPOSSIBLE_GEO_HOP")
            total_risk_score += 60
        elif metrics["geo_hop_speed_kmh"] > 300.0:
            flags.append(RiskFlag(
                code="HIGH_SPEED_GEO_CHANGE",
                description=f"High speed geo shift ({metrics['geo_hop_speed_kmh']:.0f} km/h) from {metrics['prev_city']} to {tx.location.city}",
                severity="HIGH",
                weight=35
            ))
            triggered_rules.append("RULE_SUSPICIOUS_GEO_VELOCITY")
            total_risk_score += 35

        # Rule C: Device Multi-Accounting / Syndicate Device
        if metrics["unique_users_on_device"] >= 3:
            flags.append(RiskFlag(
                code="DEVICE_FARM_SIGNATURE",
                description=f"Hardware fingerprint shared across {metrics['unique_users_on_device']} distinct user accounts in 5 minutes",
                severity="HIGH",
                weight=40
            ))
            triggered_rules.append("RULE_DEVICE_FARM_DETECTED")
            total_risk_score += 40

        # Rule D: High Frequency Burst on Single User/VPA
        if metrics["user_60s"] >= 5:
            flags.append(RiskFlag(
                code="USER_BURST_VELOCITY",
                description=f"Rapid fire transactions ({metrics['user_60s']} in 60s) for user {tx.user_id}",
                severity="MEDIUM",
                weight=25
            ))
            triggered_rules.append("RULE_USER_VELOCITY_SPIKE")
            total_risk_score += 25

        if metrics["vpa_60s"] >= 4:
            flags.append(RiskFlag(
                code="VPA_BURST_VELOCITY",
                description=f"Rapid payout requests ({metrics['vpa_60s']} in 60s) to VPA {tx.upi_vpa}",
                severity="HIGH",
                weight=30
            ))
            triggered_rules.append("RULE_VPA_HIGH_FREQUENCY")
            total_risk_score += 30

        # Rule E: High Value Outlier Transaction
        if tx.amount > 200000.0:
            flags.append(RiskFlag(
                code="HIGH_VALUE_THRESHOLD",
                description=f"Transaction volume ₹{tx.amount:,.2f} exceeds standard risk threshold",
                severity="MEDIUM",
                weight=20
            ))
            triggered_rules.append("RULE_HIGH_VALUE_VOLUME")
            total_risk_score += 20

        # Cap risk score between 0 and 100
        final_risk_score = min(max(total_risk_score, 0), 100)

        # Determine Decision
        if hard_block_triggered or final_risk_score >= 70:
            decision = RiskDecision.HARD_BLOCK
            recommended_action = "Reject transaction immediately (HTTP 403 / Razorpay code 'BAD_REQUEST_ERROR')"
        elif final_risk_score >= 35:
            decision = RiskDecision.STEP_UP_AUTH
            recommended_action = "Challenge user with mandatory 3DS 2.0 biometric or SMS OTP step-up verification"
        else:
            decision = RiskDecision.ALLOW
            recommended_action = "Proceed with frictionless 1-click checkout"

        latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        return RiskEvaluationResponse(
            transaction_id=tx.id,
            decision=decision,
            risk_score=final_risk_score,
            latency_ms=latency_ms,
            triggered_rules=triggered_rules,
            flags=flags,
            recommended_action=recommended_action
        )
