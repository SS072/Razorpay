# RazorShield AI - Tier 2 In-Memory Bipartite Fraud Intelligence Graph (NetworkX)
import networkx as nx
import time
from typing import Dict, List, Any, Optional, Set, Tuple
from app.models import Transaction, GraphNode, GraphLink, GraphDataResponse, MuleCluster

class FraudGraph:
    """
    In-memory Bipartite Multi-Graph mapping financial entities:
    - User (usr_*)
    - Card Hash (crd_*)
    - UPI VPA (vpa_*)
    - IP Subnet/Address (ip_*)
    - Device Fingerprint (dev_*)
    - Merchant ID (mid_*)
    """
    def __init__(self):
        self.graph = nx.MultiGraph()
        self.entity_transactions = {}  # entity_id -> list of transaction objects
        self.node_metadata = {}        # entity_id -> {type, label, total_amount, tx_count, risk_level}
        self.flagged_entities = set()

    def add_transaction(self, tx: Transaction, risk_score: int = 0):
        # Create standard entity IDs
        user_node = f"user:{tx.user_id}"
        ip_node = f"ip:{tx.ip_address}"
        dev_node = f"dev:{tx.device_fingerprint}"
        merch_node = f"merch:{tx.merchant_id}"
        
        # Payment instrument node
        pay_node = None
        pay_type = "card" if tx.payment_method == "CARD" else "vpa"
        if tx.payment_method == "CARD" and tx.card_hash:
            pay_node = f"card:{tx.card_hash}"
        elif tx.upi_vpa:
            pay_node = f"vpa:{tx.upi_vpa}"
        else:
            pay_node = f"pay:{tx.id[-8:]}"

        # Determine risk classification
        risk_level = "normal"
        if risk_score >= 70:
            risk_level = "critical"
            self.flagged_entities.update([user_node, ip_node, dev_node])
            if pay_node:
                self.flagged_entities.add(pay_node)
        elif risk_score >= 35:
            risk_level = "medium"

        # Register nodes with metadata
        def ensure_node(nid: str, ntype: str, label: str):
            if not self.graph.has_node(nid):
                self.graph.add_node(nid, type=ntype, label=label, created_at=tx.timestamp)
                self.node_metadata[nid] = {
                    "type": ntype,
                    "label": label,
                    "total_amount": 0.0,
                    "tx_count": 0,
                    "risk_level": risk_level
                }
            self.node_metadata[nid]["total_amount"] += tx.amount
            self.node_metadata[nid]["tx_count"] += 1
            if risk_score >= 70:
                self.node_metadata[nid]["risk_level"] = "critical"
            elif risk_score >= 35 and self.node_metadata[nid]["risk_level"] == "normal":
                self.node_metadata[nid]["risk_level"] = "medium"

        ensure_node(user_node, "user", tx.user_id)
        ensure_node(ip_node, "ip", tx.ip_address)
        ensure_node(dev_node, "device", tx.device_fingerprint[:10] + "...")
        ensure_node(merch_node, "merchant", tx.merchant_id)
        if pay_node:
            ensure_node(pay_node, pay_type, tx.card_bin or tx.upi_vpa or pay_node)

        # Helper to add edge with weight & transaction tracking
        def add_rel(src: str, tgt: str, rel: str, is_suspicious: bool):
            self.graph.add_edge(
                src, 
                tgt, 
                relation=rel, 
                weight=1, 
                amount=tx.amount, 
                timestamp=tx.timestamp,
                is_suspicious=is_suspicious
            )

        is_susp = (risk_score >= 50)
        # Connect user to payment instrument
        if pay_node:
            add_rel(user_node, pay_node, "PAID_FROM", is_susp)
        # Connect user to device
        add_rel(user_node, dev_node, "OPERATES_ON", is_susp)
        # Connect device to IP
        add_rel(dev_node, ip_node, "ORIGINATES_FROM", is_susp)
        # Connect payment to merchant
        if pay_node:
            add_rel(pay_node, merch_node, "TRANSFERS_TO", is_susp)
        else:
            add_rel(user_node, merch_node, "PAYS_MERCHANT", is_susp)

        # Save tx index for query tools
        for entity in [user_node, ip_node, dev_node, merch_node, pay_node]:
            if entity:
                if entity not in self.entity_transactions:
                    self.entity_transactions[entity] = []
                self.entity_transactions[entity].append(tx)

    def find_connected_syndicate(self, raw_entity_id: str, max_depth: int = 2) -> Dict[str, Any]:
        """
        BFS traversal to isolate multi-hop fraud syndicate connected to an entity.
        """
        # Resolve entity id if prefix is omitted
        entity_id = raw_entity_id
        if not self.graph.has_node(entity_id):
            # Try to match prefix
            matching = [n for n in self.graph.nodes if raw_entity_id in n]
            if matching:
                entity_id = matching[0]
            else:
                return {"entity_id": raw_entity_id, "found": False, "connected_entities": [], "subgraph_stats": {}}

        visited: Set[str] = {entity_id}
        queue: List[Tuple[str, int]] = [(entity_id, 0)]
        connected_by_type = {"user": [], "card": [], "vpa": [], "ip": [], "device": [], "merchant": []}
        all_connected_nodes = []
        all_edges = []
        total_syndicate_volume = 0.0

        while queue:
            curr_node, depth = queue.pop(0)
            node_meta = self.node_metadata.get(curr_node, {})
            ntype = node_meta.get("type", "unknown")
            if ntype in connected_by_type:
                connected_by_type[ntype].append({
                    "id": curr_node,
                    "label": node_meta.get("label", curr_node),
                    "tx_count": node_meta.get("tx_count", 0),
                    "total_amount": node_meta.get("total_amount", 0.0),
                    "risk_level": node_meta.get("risk_level", "normal")
                })
            all_connected_nodes.append(curr_node)
            total_syndicate_volume += node_meta.get("total_amount", 0.0)

            if depth < max_depth:
                for neighbor in self.graph.neighbors(curr_node):
                    edge_data = self.graph.get_edge_data(curr_node, neighbor)
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, depth + 1))
                        all_edges.append({
                            "source": curr_node,
                            "target": neighbor,
                            "relation": list(edge_data.values())[0].get("relation", "LINKED") if edge_data else "LINKED"
                        })

        # Calculate high-risk density
        high_risk_count = sum(
            1 for n in all_connected_nodes 
            if self.node_metadata.get(n, {}).get("risk_level") in ["high", "critical"] or n in self.flagged_entities
        )
        suspicion_index = round((high_risk_count / max(len(all_connected_nodes), 1)) * 100)

        return {
            "entity_id": entity_id,
            "found": True,
            "depth": max_depth,
            "total_nodes": len(all_connected_nodes),
            "connected_by_type": connected_by_type,
            "total_syndicate_volume_inr": total_syndicate_volume,
            "high_risk_entity_count": high_risk_count,
            "suspicion_index": suspicion_index,
            "edges": all_edges
        }

    def detect_mule_clusters(self, min_shared_entities: int = 2) -> List[MuleCluster]:
        """
        Identifies mule networks where distinct merchant accounts or user accounts
        funnel funds to identical destination VPAs or share device fingerprints.
        """
        clusters: List[MuleCluster] = []
        cluster_idx = 1

        # Check VPAs receiving payments from >= 2 distinct users/merchants
        for node, meta in self.node_metadata.items():
            if meta.get("type") in ["vpa", "device"]:
                neighbors = list(self.graph.neighbors(node))
                user_neighbors = [n for n in neighbors if n.startswith("user:")]
                merch_neighbors = [n for n in neighbors if n.startswith("merch:")]
                
                # Check for shared mule condition
                if len(user_neighbors) >= min_shared_entities or (len(merch_neighbors) >= 2 and len(user_neighbors) >= 1):
                    connected_nodes = set(neighbors + [node])
                    for n in list(neighbors):
                        connected_nodes.update(self.graph.neighbors(n))
                    
                    shared_vpas = [n.replace("vpa:", "") for n in connected_nodes if n.startswith("vpa:")]
                    shared_devs = [n.replace("dev:", "") for n in connected_nodes if n.startswith("dev:")]
                    total_vol = sum(self.node_metadata.get(n, {}).get("total_amount", 0.0) for n in connected_nodes)
                    
                    clusters.append(MuleCluster(
                        cluster_id=f"MULE-RING-00{cluster_idx}",
                        risk_score=92,
                        entity_count=len(connected_nodes),
                        entities=list(connected_nodes)[:15],
                        shared_vpas=shared_vpas,
                        shared_devices=shared_devs,
                        total_volume_inr=total_vol,
                        pattern_type="HIGH_DISPERSION_MULE_AGGREGATION" if meta.get("type") == "vpa" else "HARDWARE_DEVICE_FARM"
                    ))
                    cluster_idx += 1

        return clusters

    def get_graph_d3_data(self) -> GraphDataResponse:
        """
        Produces formatted node and edge datasets for D3 / HTML5 Canvas Force Directed visualization.
        """
        nodes_out: List[GraphNode] = []
        links_out: List[GraphLink] = []
        
        # Format Nodes
        for node_id in self.graph.nodes:
            meta = self.node_metadata.get(node_id, {})
            ntype = meta.get("type", "unknown")
            label = meta.get("label", node_id.split(":")[-1])
            risk_level = meta.get("risk_level", "normal")
            
            nodes_out.append(GraphNode(
                id=node_id,
                label=label,
                type=ntype,
                risk_level=risk_level,
                tx_count=meta.get("tx_count", 1),
                total_amount=round(meta.get("total_amount", 0.0), 2),
                is_seed=node_id in self.flagged_entities
            ))

        # Format Links
        for u, v, key, data in self.graph.edges(keys=True, data=True):
            links_out.append(GraphLink(
                source=u,
                target=v,
                relation=data.get("relation", "LINKED"),
                weight=data.get("weight", 1),
                is_suspicious=data.get("is_suspicious", False)
            ))

        stats = {
            "total_nodes": len(nodes_out),
            "total_links": len(links_out),
            "flagged_nodes": sum(1 for n in nodes_out if n.risk_level in ["high", "critical"]),
            "user_count": sum(1 for n in nodes_out if n.type == "user"),
            "card_count": sum(1 for n in nodes_out if n.type == "card"),
            "vpa_count": sum(1 for n in nodes_out if n.type == "vpa"),
            "ip_count": sum(1 for n in nodes_out if n.type == "ip"),
            "device_count": sum(1 for n in nodes_out if n.type == "device"),
            "merchant_count": sum(1 for n in nodes_out if n.type == "merchant"),
        }

        return GraphDataResponse(
            nodes=nodes_out,
            links=links_out,
            stats=stats
        )
