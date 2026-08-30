import React from 'react';
import KpiCard from '../components/KpiCard';
import CriticalAlert from '../components/CriticalAlert';
import AttackSimulator from '../components/AttackSimulator';
import TransactionVelocityChart from '../components/TransactionVelocityChart';
import FilterBar from '../components/FilterBar';
import TransactionFeed from '../components/TransactionFeed';
import RiskDistribution from '../components/RiskDistribution';
import AttackActivity from '../components/AttackActivity';
import TopRules from '../components/TopRules';
import SyndicateIntelWidget from '../components/SyndicateIntelWidget';

export default function DashboardPage({
  stats,
  transactions,
  filteredTransactions,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  riskFilter,
  setRiskFilter,
  locationFilter,
  setLocationFilter,
  isPaused,
  setIsPaused,
  selectedTx,
  onSelectTransaction,
  velocityTrigger,
  onOpenDossier,
  onInvestigateAlert,
  onSimulationTriggered
}) {
  return (
    <div className="space-y-0">
      
      {/* 1. Four High-Value KPI Metrics Bar */}
      <KpiCard stats={stats} />

      {/* 2. Critical Threat Alert Banner */}
      <CriticalAlert onInvestigate={onInvestigateAlert} />

      {/* 3. Attack Simulator Control Bar */}
      <AttackSimulator onSimulationTriggered={onSimulationTriggered} />

      {/* 4. Real-Time Transaction Velocity 1H Chart */}
      <TransactionVelocityChart liveActivityTrigger={velocityTrigger} />

      {/* 5. Main Two-Column Layout (70% Left, 30% Right) */}
      <div className="grid grid-cols-12 gap-4 p-4 max-w-[1920px] mx-auto w-full">
        
        {/* Left Column: Live Transaction Feed Table */}
        <section className="col-span-12 lg:col-span-8 xl:col-span-9 soc-card rounded-xl flex flex-col overflow-hidden shadow-md h-[640px]">
          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            totalCount={filteredTransactions.length}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
          />

          <TransactionFeed
            transactions={filteredTransactions}
            onSelectTransaction={onSelectTransaction}
            selectedTxId={selectedTx?.tx?.id}
          />
        </section>

        {/* Right Column: Risk Intelligence Sidebar */}
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-3.5">
          <RiskDistribution stats={stats} />
          <AttackActivity />
          <TopRules />
          <SyndicateIntelWidget onOpenDossier={onOpenDossier} stats={stats} />
        </aside>

      </div>

    </div>
  );
}
