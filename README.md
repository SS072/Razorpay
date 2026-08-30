# RazorShield AI 🛡️

**Autonomous Risk Command Center** — A full-stack AI-powered FinTech fraud/risk management platform built for the **Razorpay Buildathon (Track 02: AI Risk Manager)**.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend Dashboard | `http://localhost:5173` |
| Backend API Docs | `http://localhost:8000/docs` |

---

## 🧠 What It Does

RazorShield AI implements a **Dual-Tier Autonomous Risk Gating System**:

- **Tier-1 Fast Path (<30ms P99):** Synchronous deterministic engine — sliding-window velocity tracking, device fingerprint blacklists, IP reputation scoring.
- **Tier-2 Deep Analysis (async):** In-memory bipartite graph engine using NetworkX — detects mule account clusters, syndicate rings, and behavioral anomaly patterns.
- **Autonomous Forensic Copilot:** Heuristic evidence synthesizer that generates DSL firewall rules and RBI-compliance dossiers.

---

## 🗂️ Application Routes

| Route | Page |
|---|---|
| `/dashboard` | Live command center — KPIs, velocity chart, attack simulator, real-time transaction feed |
| `/transactions` | Full forensic ledger with sort, filter, search, CSV export |
| `/risk-intelligence` | Business impact — fraud ROI, false positive cost, 7-day prevention chart |
| `/model-evaluation` | Precision/Recall/F1/AUC metrics, confusion matrix, ROC curve, Baseline vs RazorShield |
| `/syndicates` | SVG bipartite network graph — devices → IPs → mule VPAs → payout hubs |
| `/attack-simulator` | 5 defensive scenarios with intensity controls and live injection |
| `/architecture` | End-to-end pipeline diagram, Tier-1/Tier-2 explainer, latency budget |
| `/audit-log` | Immutable decision trail — filterable, exportable CSV |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Python 3.11, FastAPI, Uvicorn, NetworkX |
| Real-time | Server-Sent Events (SSE) |
| Graph Engine | In-memory NetworkX bipartite graph |
| Auth/Webhooks | Razorpay-compatible HMAC-SHA256 webhook verification |

---

## ⚡ Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python run_server.py
```

Backend starts at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard starts at `http://localhost:5173`

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `1`–`8` | Quick-switch between pages |
| `/` | Focus transaction search |
| `Space` | Pause / resume live stream |
| `B` / `C` / `L` / `A` | Filter: Blocked / Challenged / Allowed / All |
| `Enter` | Open transaction detail drawer |
| `Esc` | Close any drawer or modal |
| `?` | Open keyboard shortcut reference |

---

## ⚠️ Demo Disclosure

This is a **demonstration environment**. All transaction data is synthetically generated. No real Razorpay payment data, real RBI compliance reports, or real production ML inference is used. Metrics are clearly labelled as `DEMO DATA` throughout the UI.

---

## 📐 Architecture

```
Transaction
     ↓
FastAPI Gateway (HMAC Webhook)
     ↓
Risk Orchestrator
     ↓
┌────────────────┬────────────────┐
│  Tier-1 Fast   │  Tier-2 Deep   │
│  Path (<30ms)  │  Graph (async) │
└────────────────┴────────────────┘
          ↓
    Decision Engine
          ↓
  ALLOW / STEP_UP_AUTH / HARD_BLOCK
          ↓
     Audit Store → SSE → React Dashboard
```
