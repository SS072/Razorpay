# RazorShield AI - Traffic Generator & Attack Simulation Suite
import random
import time
import uuid
from typing import List, Dict, Any, Generator
from app.models import Transaction, PaymentMethod, LocationInfo

# Realistic FinTech Data Seeds
INDIAN_CITIES = [
    {"city": "Mumbai", "country": "IN", "lat": 19.0760, "lon": 72.8777},
    {"city": "Bengaluru", "country": "IN", "lat": 12.9716, "lon": 77.5946},
    {"city": "Delhi", "country": "IN", "lat": 28.6139, "lon": 77.2090},
    {"city": "Hyderabad", "country": "IN", "lat": 17.3850, "lon": 78.4867},
    {"city": "Pune", "country": "IN", "lat": 18.5204, "lon": 73.8567},
    {"city": "Chennai", "country": "IN", "lat": 13.0827, "lon": 80.2707}
]

FOREIGN_CITIES = [
    {"city": "London", "country": "GB", "lat": 51.5074, "lon": -0.1278},
    {"city": "Frankfurt", "country": "DE", "lat": 50.1109, "lon": 8.6821},
    {"city": "Singapore", "country": "SG", "lat": 1.3521, "lon": 103.8198}
]

VPA_HANDLES = ["@okhdfcbank", "@okaxis", "@paytm", "@ibl", "@ybl", "@sbi"]
MERCHANT_IDS = [
    "mid_razorpay_ecom", "mid_swiggy_demo", "mid_zomato_ops", 
    "mid_flipkart_pay", "mid_cred_settle", "mid_blinkit_quick"
]
CARD_BINS = ["411111", "524128", "402400", "607152", "453201"]

class TrafficGenerator:
    def __init__(self):
        self.user_pool = [f"usr_{uuid.uuid4().hex[:6]}" for _ in range(30)]
        self.device_pool = [f"dev_fp_{uuid.uuid4().hex[:8]}" for _ in range(25)]
        self.ip_pool = [f"103.21.{random.randint(10, 250)}.{random.randint(1, 254)}" for _ in range(20)]
        self.vpa_pool = [f"fintech_user_{i}{random.choice(VPA_HANDLES)}" for i in range(20)]

    def generate_benign_transaction(self, custom_user: str = None) -> Transaction:
        user_id = custom_user or random.choice(self.user_pool)
        method = random.choice([PaymentMethod.UPI, PaymentMethod.CARD, PaymentMethod.UPI])
        loc = random.choice(INDIAN_CITIES)
        
        card_bin = None
        card_hash = None
        vpa = None
        
        if method == PaymentMethod.CARD:
            card_bin = random.choice(CARD_BINS[1:])
            card_hash = f"crd_hash_{card_bin}_{random.randint(1000, 9999)}"
        else:
            vpa = f"{user_id.replace('usr_', 'user_')}{random.choice(VPA_HANDLES)}"

        return Transaction(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            timestamp=time.time(),
            amount=round(random.uniform(150.0, 8500.0), 2),
            currency="INR",
            payment_method=method,
            card_bin=card_bin,
            card_hash=card_hash,
            upi_vpa=vpa,
            user_id=user_id,
            ip_address=random.choice(self.ip_pool),
            device_fingerprint=random.choice(self.device_pool),
            merchant_id=random.choice(MERCHANT_IDS),
            location=LocationInfo(**loc),
            razorpay_order_id=f"order_{uuid.uuid4().hex[:10]}"
        )

    def generate_bootstrap_dataset(self, count: int = 50) -> List[Transaction]:
        """
        Creates 50 pre-seeded authentic Indian FinTech transactions including
        benign traffic, a subtle card testing cluster, and an emerging mule syndicate.
        """
        transactions = []
        base_time = time.time() - (count * 4)

        # 1. 35 Benign Baseline Transactions
        for i in range(35):
            tx = self.generate_benign_transaction()
            tx.timestamp = base_time + (i * 3)
            transactions.append(tx)

        # 2. 8 Transactions representing a Card Testing attack cluster
        attacker_ip = "103.21.244.15"
        attacker_dev = "dev_fp_badactor_99"
        for i in range(8):
            test_bin = "411111"
            tx = Transaction(
                id=f"pay_test_{uuid.uuid4().hex[:8]}",
                timestamp=base_time + 105 + (i * 0.8),
                amount=round(random.uniform(1.0, 5.0), 2),
                currency="INR",
                payment_method=PaymentMethod.CARD,
                card_bin=test_bin,
                card_hash=f"crd_hash_{test_bin}_{1000 + i}",
                upi_vpa=None,
                user_id=f"usr_bot_{i % 3}",
                ip_address=attacker_ip,
                device_fingerprint=attacker_dev,
                merchant_id="mid_razorpay_ecom",
                location=LocationInfo(city="Delhi", country="IN", lat=28.6139, lon=77.2090),
                razorpay_order_id=f"order_test_{i}"
            )
            transactions.append(tx)

        # 3. 7 Transactions representing a Mule Aggregation Ring
        mule_vpa = "mule_aggregate@okhdfcbank"
        shared_mule_dev = "dev_mule_cluster_77"
        for i in range(7):
            merch = MERCHANT_IDS[i % len(MERCHANT_IDS)]
            tx = Transaction(
                id=f"pay_mule_{uuid.uuid4().hex[:8]}",
                timestamp=base_time + 120 + (i * 2),
                amount=round(random.uniform(45000.0, 98000.0), 2),
                currency="INR",
                payment_method=PaymentMethod.UPI,
                card_bin=None,
                card_hash=None,
                upi_vpa=mule_vpa,
                user_id=f"usr_mule_{i}",
                ip_address=f"103.21.188.{10 + i}",
                device_fingerprint=shared_mule_dev,
                merchant_id=merch,
                location=LocationInfo(city="Mumbai", country="IN", lat=19.0760, lon=72.8777),
                razorpay_order_id=f"order_mule_{i}"
            )
            transactions.append(tx)

        return transactions

    # ==================== ATTACK SIMULATION SCENARIOS ====================
    def generate_scenario_card_testing(self, count: int = 40) -> List[Transaction]:
        """
        Rapid micro-transactions (₹1 - ₹5) testing card numbers on high-velocity botnet IPs.
        """
        txs = []
        bot_ips = [f"194.168.10.{i}" for i in range(1, 6)]
        bot_dev = f"dev_botnet_{uuid.uuid4().hex[:6]}"
        now = time.time()
        
        for i in range(count):
            bin_no = "411111"
            tx = Transaction(
                id=f"pay_attack_cardtest_{uuid.uuid4().hex[:8]}",
                timestamp=now + (i * 0.15),
                amount=round(random.uniform(1.0, 8.0), 2),
                currency="INR",
                payment_method=PaymentMethod.CARD,
                card_bin=bin_no,
                card_hash=f"crd_stolen_{bin_no}_{random.randint(10000, 99999)}",
                upi_vpa=None,
                user_id=f"usr_bot_{random.randint(1, 5)}",
                ip_address=random.choice(bot_ips),
                device_fingerprint=bot_dev,
                merchant_id="mid_razorpay_ecom",
                location=LocationInfo(city="Noida", country="IN", lat=28.5355, lon=77.3910),
                razorpay_order_id=f"order_attack_{i}"
            )
            txs.append(tx)
        return txs

    def generate_scenario_mule_ring(self, count: int = 12) -> List[Transaction]:
        """
        8+ distinct merchants processing high-value payouts (₹60k - ₹1.8L) to the same 2 VPAs.
        """
        txs = []
        target_vpas = ["mule_boss_payout@paytm", "syndicate_escrow@okhdfcbank"]
        shared_dev = f"dev_mule_farm_{uuid.uuid4().hex[:6]}"
        now = time.time()

        for i in range(count):
            merch = MERCHANT_IDS[i % len(MERCHANT_IDS)]
            vpa = target_vpas[i % len(target_vpas)]
            tx = Transaction(
                id=f"pay_attack_mule_{uuid.uuid4().hex[:8]}",
                timestamp=now + (i * 0.4),
                amount=round(random.uniform(55000.0, 195000.0), 2),
                currency="INR",
                payment_method=PaymentMethod.UPI,
                card_bin=None,
                card_hash=None,
                upi_vpa=vpa,
                user_id=f"usr_victim_merchant_{i}",
                ip_address=f"185.220.101.{20 + i}",
                device_fingerprint=shared_dev,
                merchant_id=merch,
                location=LocationInfo(city="Hyderabad", country="IN", lat=17.3850, lon=78.4867),
                razorpay_order_id=f"order_mule_payout_{i}"
            )
            txs.append(tx)
        return txs

    def generate_scenario_account_takeover(self) -> List[Transaction]:
        """
        Legitimate user transaction in Mumbai followed 3 minutes later by London foreign transaction with new device.
        """
        victim_user = "usr_vip_enterprise_88"
        now = time.time()
        
        # Step 1: Legitimate checkout in Mumbai
        tx1 = Transaction(
            id=f"pay_legit_{uuid.uuid4().hex[:8]}",
            timestamp=now - 180,
            amount=4200.0,
            currency="INR",
            payment_method=PaymentMethod.CARD,
            card_bin="524128",
            card_hash="crd_hash_hdfc_plat_8812",
            upi_vpa=None,
            user_id=victim_user,
            ip_address="103.21.244.50",
            device_fingerprint="dev_iphone_15_pro_mumbai",
            merchant_id="mid_swiggy_demo",
            location=LocationInfo(city="Mumbai", country="IN", lat=19.0760, lon=72.8777),
            razorpay_order_id=f"order_legit_mumbai"
        )

        # Step 2: Impossible Geo-Velocity Takeover in London 3 minutes later
        tx2 = Transaction(
            id=f"pay_ato_{uuid.uuid4().hex[:8]}",
            timestamp=now,
            amount=148500.0,
            currency="INR",
            payment_method=PaymentMethod.CARD,
            card_bin="524128",
            card_hash="crd_hash_hdfc_plat_8812",
            upi_vpa=None,
            user_id=victim_user,
            ip_address="185.192.12.8",
            device_fingerprint="dev_unknown_linux_tor",
            merchant_id="mid_flipkart_pay",
            location=LocationInfo(city="London", country="GB", lat=51.5074, lon=-0.1278),
            razorpay_order_id=f"order_ato_london",
            metadata={"geo_speed": 1420.0}
        )

        return [tx1, tx2]
