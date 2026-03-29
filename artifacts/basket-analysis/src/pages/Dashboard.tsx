import { motion } from "framer-motion";
import { Loader2, AlertCircle, ShoppingBag, Hash, Layers } from "lucide-react";
import { useAnalysisContext } from "@/hooks/use-analysis";
import { StatCard } from "@/components/StatCard";
import { RuleCard } from "@/components/RuleCard";
import { Controls } from "@/components/Controls";
import { RulesScatterPlot, ItemFreqBarChart } from "@/components/Visualizations";
import { RulesDataTable } from "@/components/RulesDataTable";
import { ProductRecommender } from "@/components/ProductRecommender";

export default function Dashboard() {
  const { 
    minSupport, setMinSupport, 
    minConfidence, setMinConfidence, 
    rulesQuery, statsQuery 
  } = useAnalysisContext();

  const isRulesLoading = rulesQuery.isLoading;
  const isStatsLoading = statsQuery.isLoading;
  const isError = rulesQuery.isError || statsQuery.isError;

  return (
    <div className="min-h-screen relative pb-24">
      {/* Background Image Setup */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/dashboard-bg.png)` }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-primary/80 mb-3">
            Market Basket Intelligence
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover hidden purchasing patterns and associations across millions of transactions to optimize product placement and cross-selling.
          </p>
        </motion.div>

        {isError && (
          <div className="glass-panel border-destructive/50 bg-destructive/10 p-6 rounded-2xl flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Failed to load analysis data</h3>
              <p className="text-sm text-destructive/80">Make sure the backend server is running and the database is seeded.</p>
            </div>
          </div>
        )}

        {/* Global Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Transactions" 
            value={isStatsLoading ? "..." : (statsQuery.data?.totalTransactions.toLocaleString() || "0")} 
            icon={ShoppingBag}
            delay={0.1}
            accentColor="primary"
          />
          <StatCard 
            title="Unique Items" 
            value={isStatsLoading ? "..." : (statsQuery.data?.totalItems.toLocaleString() || "0")} 
            icon={Hash}
            delay={0.2}
            accentColor="accent"
          />
          <StatCard 
            title="Avg Items / Basket" 
            value={isStatsLoading ? "..." : (statsQuery.data?.avgItemsPerTransaction.toFixed(1) || "0")} 
            icon={Layers}
            delay={0.3}
            accentColor="green"
          />
        </div>

        {/* Controls */}
        <Controls 
          minSupport={minSupport} 
          setMinSupport={setMinSupport}
          minConfidence={minConfidence}
          setMinConfidence={setMinConfidence}
        />

        {/* Product Recommender */}
        <ProductRecommender minSupport={minSupport} minConfidence={minConfidence} />

        {/* Loading Overlay for Rules */}
        {isRulesLoading ? (
          <div className="h-96 flex flex-col items-center justify-center glass-panel rounded-3xl">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-display tracking-wide animate-pulse">Mining Association Rules...</p>
          </div>
        ) : rulesQuery.data ? (
          <>
            {/* Top 3 Rules Showcase */}
            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3 text-foreground">
                <span className="w-2 h-8 rounded-full bg-primary inline-block shadow-[0_0_15px_rgba(139,92,246,0.6)]"></span>
                Top Business Rules
                <span className="text-sm font-normal text-muted-foreground ml-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">Ranked by Lift</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {rulesQuery.data.top3.length > 0 ? (
                  rulesQuery.data.top3.map((rule, idx) => (
                    <RuleCard key={`top-${idx}`} rule={rule} rank={idx + 1} />
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-2xl bg-card/20">
                    No rules found meeting the current minimum support and confidence thresholds.
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="glass-panel p-6 rounded-3xl">
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold text-foreground">Rule Distribution</h3>
                  <p className="text-xs text-muted-foreground">Support vs Confidence (Bubble Size = Lift)</p>
                </div>
                <RulesScatterPlot data={rulesQuery.data.rules} />
              </div>
              
              <div className="glass-panel p-6 rounded-3xl">
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold text-foreground">Top Purchased Items</h3>
                  <p className="text-xs text-muted-foreground">Highest frequency products across all baskets</p>
                </div>
                <ItemFreqBarChart data={statsQuery.data?.itemFrequencies || []} />
              </div>
            </div>

            {/* Full Data Table */}
            <div>
              <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3 text-foreground">
                <span className="w-2 h-8 rounded-full bg-accent inline-block shadow-[0_0_15px_rgba(6,182,212,0.6)]"></span>
                All Discovered Associations
                <span className="text-sm font-normal text-muted-foreground ml-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  {rulesQuery.data.totalRules} rules found
                </span>
              </h2>
              <RulesDataTable data={rulesQuery.data.rules} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
