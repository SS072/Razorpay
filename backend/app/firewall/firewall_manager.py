# RazorShield AI - Adaptive Dynamic Firewall Manager
import time
import re
from typing import List, Dict, Tuple, Optional
from app.models import FirewallRule, RuleStatus, RuleAction, Transaction, RiskFlag

class FirewallManager:
    """
    Manages Tier-1 Dynamic Firewall Rules with state support:
    - ACTIVE: Blocked or Challenged in real-time (<1ms evaluation)
    - SHADOW: Logs matches and computes blast radius without disrupting live checkouts
    - ROLLED_BACK: Inactive / audit only
    """
    def __init__(self):
        self.rules: Dict[str, FirewallRule] = {}
        self._seed_default_rules()

    def _seed_default_rules(self):
        rule1 = FirewallRule(
            rule_id="RULE-FW-BIN-001",
            name="Block High Chargeback Test BIN",
            description="Auto-blocks testing card sequences from known compromised BIN 411111 on suspicious IPs",
            condition_dsl="card_bin == '411111' and amount < 50",
            action=RuleAction.BLOCK,
            status=RuleStatus.ACTIVE,
            blocked_count=142,
            shadow_matched_count=0,
            estimated_fp_rate=0.005
        )
        rule2 = FirewallRule(
            rule_id="RULE-FW-MULE-002",
            name="Mule VPA Syndicate Quarantine",
            description="Blocks all incoming merchant settlements to identified mule VPA mule_aggregate@okhdfcbank",
            condition_dsl="upi_vpa == 'mule_aggregate@okhdfcbank'",
            action=RuleAction.BLOCK,
            status=RuleStatus.ACTIVE,
            blocked_count=28,
            shadow_matched_count=0,
            estimated_fp_rate=0.001
        )
        rule3 = FirewallRule(
            rule_id="RULE-FW-SHADOW-003",
            name="Shadow Monitor Geo-Hop Velocity",
            description="Shadow audit for rapid intercontinental IP shifts without hard blocking",
            condition_dsl="geo_speed > 600",
            action=RuleAction.CHALLENGE,
            status=RuleStatus.SHADOW,
            blocked_count=0,
            shadow_matched_count=19,
            estimated_fp_rate=0.02
        )
        self.rules[rule1.rule_id] = rule1
        self.rules[rule2.rule_id] = rule2
        self.rules[rule3.rule_id] = rule3

    def get_all_rules(self) -> List[FirewallRule]:
        return list(self.rules.values())

    def add_or_update_rule(self, rule: FirewallRule):
        self.rules[rule.rule_id] = rule

    def update_rule_status(self, rule_id: str, new_status: RuleStatus) -> Optional[FirewallRule]:
        if rule_id in self.rules:
            self.rules[rule_id].status = new_status
            return self.rules[rule_id]
        return None

    def evaluate_transaction(self, tx: Transaction) -> Tuple[List[RiskFlag], List[str], bool]:
        """
        Evaluates transaction against active and shadow firewall rules in <1ms.
        Returns: (flags, triggered_rule_ids, is_hard_blocked)
        """
        flags: List[RiskFlag] = []
        triggered: List[str] = []
        is_blocked = False

        for rule in self.rules.values():
            if rule.status == RuleStatus.ROLLED_BACK:
                continue

            matches = self._match_dsl(rule.condition_dsl, tx)
            if matches:
                if rule.status == RuleStatus.ACTIVE:
                    rule.blocked_count += 1
                    triggered.append(rule.rule_id)
                    flags.append(RiskFlag(
                        code=f"FIREWALL_{rule.rule_id}",
                        description=f"Triggered Active Firewall Rule [{rule.name}]: {rule.description}",
                        severity="CRITICAL" if rule.action == RuleAction.BLOCK else "HIGH",
                        weight=85 if rule.action == RuleAction.BLOCK else 45
                    ))
                    if rule.action == RuleAction.BLOCK:
                        is_blocked = True
                elif rule.status == RuleStatus.SHADOW:
                    rule.shadow_matched_count += 1
                    triggered.append(f"{rule.rule_id} (SHADOW)")
                    flags.append(RiskFlag(
                        code=f"SHADOW_MATCH_{rule.rule_id}",
                        description=f"Shadow Rule [{rule.name}] Matched: non-blocking audit recorded",
                        severity="LOW",
                        weight=5
                    ))

        return flags, triggered, is_blocked

    def _match_dsl(self, dsl: str, tx: Transaction) -> bool:
        """
        Safe deterministic evaluator for DSL conditions:
        Supported variables: card_bin, card_hash, upi_vpa, user_id, ip_address, device_fingerprint, merchant_id, amount
        """
        if not dsl:
            return False
        try:
            # Prepare safe evaluation context
            context = {
                "card_bin": tx.card_bin or "",
                "card_hash": tx.card_hash or "",
                "upi_vpa": tx.upi_vpa or "",
                "user_id": tx.user_id or "",
                "ip_address": tx.ip_address or "",
                "device_fingerprint": tx.device_fingerprint or "",
                "merchant_id": tx.merchant_id or "",
                "amount": float(tx.amount),
                "geo_speed": float(tx.metadata.get("geo_speed", 0.0))
            }
            # Normalize DSL expression for simple Python evaluation
            expr = dsl.strip()
            # Security sanitization: only allow comparison ops and identifiers
            if re.search(r'(__|import|exec|eval|open|sys|os)', expr):
                return False

            return bool(eval(expr, {"__builtins__": {}}, context))
        except Exception:
            return False
