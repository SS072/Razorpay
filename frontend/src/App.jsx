import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Layout & Shell
import Header from './components/Header';
import DegradedModeBanner from './components/DegradedModeBanner';
import CriticalAlert from './components/CriticalAlert';
import TransactionDetailDrawer from './components/TransactionDetailDrawer';
import FirewallDrawer from './components/FirewallDrawer';
import DossierModal from './components/DossierModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import ModelEvaluationPage from './pages/ModelEvaluationPage';
import SyndicatesPage from './pages/SyndicatesPage';
import AttackSimulatorPage from './pages/AttackSimulatorPage';
import ArchitecturePage from './pages/ArchitecturePage';
import AuditLogPage from './pages/AuditLogPage';

// Services
import {
  fetchSystemStats,
  fetchFirewallRules,
  subscribeToTransactions,
  triggerInvestigation
} from './services/api';

// Route ID → component map
const ROUTE_MAP = {
  'dashboard': DashboardPage,
  'transactions': TransactionsPage,
  'risk-intelligence': RiskIntelligencePage,
  'model-evaluation': ModelEvaluationPage,
  'syndicates': SyndicatesPage,
  'simulator': AttackSimulatorPage,
  'architecture': ArchitecturePage,
  'audit-log': AuditLogPage
};

export default function App() {
  // ─── Routing State ────────────────────────────────────────────
  const [activeRoute, setActiveRoute] = useState('dashboard');

  // ─── Global Data State ────────────────────────────────────────
  const [stats, setStats] = useState({
    total_evaluated: 24891,
    total_blocked_inr: 1930500,
    sub_30ms_latency_ms: 14.2,
    active_firewall_rules: 2,
    graph_node_count: 124
  });
  const [transactions, setTransactions] = useState([]);
  const [firewallRules, setFirewallRules] = useState([]);
  const [latestReport, setLatestReport] = useState(null);

  // ─── Feed Control State ───────────────────────────────────────
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);

  // ─── UI Modal/Drawer State ─────────────────────────────────────
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isFirewallOpen, setIsFirewallOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const [velocityTrigger, setVelocityTrigger] = useState(0);

  // ─── Initial Data Fetch ───────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const [statsRes, rulesRes] = await Promise.all([
        fetchSystemStats(),
        fetchFirewallRules()
      ]);
      if (statsRes) setStats(prev => ({ ...prev, ...statsRes }));
      if (rulesRes) setFirewallRules(rulesRes);

      // Pre-fetch dossier in background
      triggerInvestigation('vpa:mule_aggregate@okhdfcbank')
        .then(setLatestReport)
        .catch(() => {});
    } catch (err) {
      console.error('[RazorShield] Initial data fetch failed — using demo defaults:', err.message);
    }
  }, []);

  // ─── SSE Live Transaction Stream ──────────────────────────────
  useEffect(() => {
    loadInitialData();

    const unsubscribe = subscribeToTransactions(
      // On live transaction event
      (newTxRecord) => {
        if (isPaused) return;
        setTransactions(prev => [newTxRecord, ...prev.slice(0, 400)]);
        setVelocityTrigger(v => v + 1);
        setStats(prev => {
          const evalData = newTxRecord.evaluation || {};
          const tx = newTxRecord.tx || {};
          return {
            ...prev,
            total_evaluated: (prev.total_evaluated || 24891) + 1,
            total_blocked_inr: evalData.decision === 'HARD_BLOCK'
              ? (prev.total_blocked_inr || 1930500) + (tx.amount || 0)
              : prev.total_blocked_inr,
            sub_30ms_latency_ms: evalData.latency_ms || prev.sub_30ms_latency_ms
          };
        });
      },
      // On initial snapshot batch
      (snapshotList) => {
        if (snapshotList?.length > 0) {
          setTransactions(snapshotList);
          setSelectedTx(snapshotList[0]);
        }
      },
      // On investigation report complete
      (report) => { setLatestReport(report); }
    );

    const kpiInterval = setInterval(() => {
      fetchSystemStats().then(d => d && setStats(prev => ({ ...prev, ...d }))).catch(() => {});
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(kpiInterval);
    };
  }, [loadInitialData, isPaused]);

  // ─── Global Keyboard Shortcuts ────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        setIsShortcutsOpen(s => !s);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.key === 'b' || e.key === 'B') {
        setFilter('BLOCKED'); setActiveRoute('dashboard');
      } else if (e.key === 'c' || e.key === 'C') {
        setFilter('CHALLENGED'); setActiveRoute('dashboard');
      } else if (e.key === 'l' || e.key === 'L') {
        setFilter('ALLOWED'); setActiveRoute('dashboard');
      } else if (e.key === 'a' || e.key === 'A') {
        setFilter('ALL'); setActiveRoute('dashboard');
      } else if (e.key === 'Escape') {
        setIsDetailDrawerOpen(false);
        setIsFirewallOpen(false);
        setIsDossierOpen(false);
        setIsShortcutsOpen(false);
      } else if (e.key === 'Enter' && selectedTx) {
        setIsDetailDrawerOpen(true);
      } else if (e.key === '1') { setActiveRoute('dashboard'); }
      else if (e.key === '2') { setActiveRoute('transactions'); }
      else if (e.key === '3') { setActiveRoute('risk-intelligence'); }
      else if (e.key === '4') { setActiveRoute('model-evaluation'); }
      else if (e.key === '5') { setActiveRoute('syndicates'); }
      else if (e.key === '6') { setActiveRoute('simulator'); }
      else if (e.key === '7') { setActiveRoute('architecture'); }
      else if (e.key === '8') { setActiveRoute('audit-log'); }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedTx]);

  // ─── Filtered Transactions (memoized) ────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const tx = item.tx || {};
      const ev = item.evaluation || {};

      if (filter === 'BLOCKED' && ev.decision !== 'HARD_BLOCK') return false;
      if (filter === 'CHALLENGED' && ev.decision !== 'STEP_UP_AUTH') return false;
      if (filter === 'ALLOWED' && ev.decision !== 'ALLOW') return false;

      const score = ev.risk_score || 0;
      if (riskFilter === 'CRITICAL' && score < 80) return false;
      if (riskFilter === 'HIGH' && score < 60) return false;
      if (riskFilter === 'MEDIUM' && (score < 30 || score >= 60)) return false;
      if (riskFilter === 'LOW' && score >= 30) return false;

      if (locationFilter !== 'ALL' && tx.location?.city !== locationFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          tx.id?.toLowerCase().includes(q) ||
          tx.upi_vpa?.toLowerCase().includes(q) ||
          tx.user_id?.toLowerCase().includes(q) ||
          tx.ip_address?.toLowerCase().includes(q) ||
          tx.card_bin?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filter, riskFilter, locationFilter, searchQuery]);

  // ─── Action Handlers ──────────────────────────────────────────
  const handleSelectTransaction = useCallback((record) => {
    setSelectedTx(record);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleInvestigate = useCallback(async () => {
    try {
      const report = await triggerInvestigation('vpa:mule_aggregate@okhdfcbank');
      setLatestReport(report);
      setIsDossierOpen(true);
    } catch (e) {
      setIsDossierOpen(true);
    }
  }, []);

  // ─── Render Active Page ───────────────────────────────────────
  const renderPage = () => {
    // Shared props for pages that need transaction data
    const txProps = {
      stats,
      transactions,
      filteredTransactions,
      filter, setFilter,
      searchQuery, setSearchQuery,
      riskFilter, setRiskFilter,
      locationFilter, setLocationFilter,
      isPaused, setIsPaused,
      selectedTx,
      onSelectTransaction: handleSelectTransaction,
      velocityTrigger,
      onOpenDossier: handleInvestigate,
      onInvestigateAlert: handleInvestigate,
      onSimulationTriggered: () => {}
    };

    switch (activeRoute) {
      case 'dashboard':       return <DashboardPage {...txProps} />;
      case 'transactions':    return <TransactionsPage {...txProps} />;
      case 'risk-intelligence': return <RiskIntelligencePage stats={stats} onOpenDossier={handleInvestigate} />;
      case 'model-evaluation':  return <ModelEvaluationPage />;
      case 'syndicates':      return <SyndicatesPage />;
      case 'simulator':       return <AttackSimulatorPage onSimulationTriggered={() => {}} />;
      case 'architecture':    return <ArchitecturePage />;
      case 'audit-log':       return <AuditLogPage />;
      default:                return <DashboardPage {...txProps} />;
    }
  };

  // ─── Root Layout ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-soc-mesh text-[#E8EDF7] font-sans antialiased selection:bg-[#4C8DFF] selection:text-white">
      
      {/* Sticky Compound Header with Navigation */}
      <Header
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
        stats={stats}
        onOpenFirewall={() => setIsFirewallOpen(true)}
        onOpenDossier={handleInvestigate}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isDegraded={isDegraded}
        onToggleDegraded={() => setIsDegraded(d => !d)}
      />

      {/* Degraded Mode / Fail-Safe Banner */}
      <DegradedModeBanner
        isDegraded={isDegraded}
        onToggle={() => setIsDegraded(false)}
        onDismiss={() => setIsDegraded(false)}
      />

      {/* Demo Environment Notice */}
      <div className="bg-[#11192B]/60 border-b border-[#1D2940]/50 px-4 py-1 flex items-center justify-center text-[10px] font-mono text-[#7F8AA0]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00C2D9] mr-2"></span>
        DEMO ENVIRONMENT — Synthetic transaction stream — All fraud data is simulated and does not represent real Razorpay traffic
      </div>

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>

      {/* ── Overlays ─────────────────────────────────────────── */}

      {/* Transaction Forensic Detail Drawer */}
      <TransactionDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        transactionRecord={selectedTx}
        onOpenDossier={() => { setIsDetailDrawerOpen(false); handleInvestigate(); }}
        onAddToFirewall={() => { setIsDetailDrawerOpen(false); setIsFirewallOpen(true); }}
      />

      {/* Firewall Rules Manager */}
      <FirewallDrawer
        isOpen={isFirewallOpen}
        onClose={() => setIsFirewallOpen(false)}
        rules={firewallRules}
        onRulesUpdated={() => fetchFirewallRules().then(r => r && setFirewallRules(r)).catch(() => {})}
      />

      {/* RBI Compliance Forensic Dossier */}
      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        report={latestReport}
      />

      {/* Keyboard Shortcuts Reference */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

    </div>
  );
}
