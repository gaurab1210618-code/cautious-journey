import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ShoppingCart, TrendingUp, BarChart2, Loader2, ChevronDown } from "lucide-react";
import { useGetRecommendations, useGetDataStats } from "@workspace/api-client-react";

function MetricBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[color] ?? colorMap.blue}`}>
      {label}: <strong>{value}</strong>
    </span>
  );
}

export function ProductRecommender({
  minSupport,
  minConfidence,
}: {
  minSupport: number;
  minConfidence: number;
}) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [queriedProduct, setQueriedProduct] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const statsQuery = useGetDataStats();
  const allItems = statsQuery.data?.itemFrequencies.map((f) => f.item).sort() ?? [];
  const filteredItems = allItems.filter((item) =>
    item.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const recQuery = useGetRecommendations(
    { product: queriedProduct, minSupport, minConfidence },
    { enabled: !!queriedProduct, staleTime: 30_000 }
  );

  function handleSearch() {
    if (!selectedProduct) return;
    setQueriedProduct(selectedProduct);
  }

  function handleSelect(item: string) {
    setSelectedProduct(item);
    setIsOpen(false);
    setSearchFilter("");
  }

  const recs = recQuery.data?.recommendations ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-3xl p-6 md:p-8 mb-12"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Product Recommender
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select a product to discover what customers frequently buy alongside it — powered by association rules.
          </p>
        </div>
      </div>

      {/* Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Dropdown */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-sm transition-colors text-left"
          >
            <span className={selectedProduct ? "text-foreground" : "text-muted-foreground"}>
              {selectedProduct || "Choose a product…"}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-50 mt-2 w-full rounded-xl bg-card border border-white/10 shadow-2xl overflow-hidden"
              >
                {/* Filter input */}
                <div className="p-2 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search items…"
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No items match</p>
                  ) : (
                    filteredItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${
                          item === selectedProduct ? "text-primary" : "text-foreground"
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        {item}
                        {item === selectedProduct && (
                          <span className="ml-auto text-xs text-primary">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={!selectedProduct || recQuery.isFetching}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm transition-colors shrink-0"
        >
          {recQuery.isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Recommend
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {recQuery.isFetching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16 gap-3 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analysing rules for <strong className="text-foreground">{queriedProduct}</strong>…</span>
          </motion.div>
        )}

        {!recQuery.isFetching && recQuery.data && (
          <motion.div
            key={queriedProduct}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Summary strip */}
            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 rounded-2xl bg-white/3 border border-white/8">
              <ShoppingCart className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="text-sm font-medium text-foreground">
                Customers who buy <strong className="text-violet-300">{queriedProduct}</strong> also buy:
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {recQuery.data.rulesUsed} rule{recQuery.data.rulesUsed !== 1 ? "s" : ""} triggered
              </span>
            </div>

            {recs.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/3">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No recommendations found for <strong>{queriedProduct}</strong> at the current thresholds.
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">Try lowering the minimum support or confidence sliders above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recs.map((rec, idx) => (
                  <motion.div
                    key={rec.product}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative p-4 rounded-2xl bg-white/4 border border-white/10 hover:border-violet-500/30 hover:bg-white/6 transition-all group"
                  >
                    {/* Rank badge */}
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      #{idx + 1}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="font-semibold text-sm text-foreground group-hover:text-violet-300 transition-colors">
                        {rec.product}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <MetricBadge label="Lift" value={`${rec.lift.toFixed(2)}x`} color="purple" />
                      <MetricBadge label="Conf" value={`${(rec.confidence * 100).toFixed(0)}%`} color="blue" />
                      <MetricBadge label="Sup" value={`${(rec.support * 100).toFixed(1)}%`} color="green" />
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <BarChart2 className="w-3 h-3" />
                      From {rec.triggeringRules} rule{rec.triggeringRules !== 1 ? "s" : ""}
                      {idx === 0 && (
                        <span className="ml-auto flex items-center gap-1 text-amber-400 font-medium">
                          <TrendingUp className="w-3 h-3" /> Best match
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!recQuery.isFetching && !recQuery.data && !queriedProduct && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-14 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">Select a product above and click <strong>Recommend</strong> to get started.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
