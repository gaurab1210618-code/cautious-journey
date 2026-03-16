import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, ArrowUpRight } from "lucide-react";
import type { AssociationRule } from "@workspace/api-client-react";

interface RuleCardProps {
  rule: AssociationRule;
  rank: number;
}

export function RuleCard({ rule, rank }: RuleCardProps) {
  const isFirst = rank === 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
      className={`
        relative rounded-2xl p-[1px] overflow-hidden group
        ${isFirst ? 'bg-gradient-to-br from-primary via-accent to-primary/20' : 'bg-border hover:bg-white/20'}
        transition-colors duration-500
      `}
    >
      {/* Animated glow background for #1 */}
      {isFirst && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl z-0 animate-pulse" />
      )}

      <div className="bg-card/95 backdrop-blur-xl rounded-[15px] h-full w-full p-6 relative z-10 flex flex-col justify-between">
        
        <div className="flex justify-between items-start mb-6">
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold font-display tracking-wider
            ${isFirst ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}
          `}>
            #{rank} BUSINESS RULE
          </div>
          <div className="flex items-center gap-1 text-accent font-semibold text-sm bg-accent/10 px-2 py-1 rounded-lg">
            <Zap className="w-3.5 h-3.5" />
            {(rule.lift).toFixed(2)}x Lift
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex-1 bg-background/50 rounded-xl p-4 border border-white/5 text-center shadow-inner">
            <span className="text-foreground font-semibold text-lg line-clamp-2">
              {rule.antecedent.join(", ")}
            </span>
          </div>
          
          <div className="flex-shrink-0 text-muted-foreground flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-primary mb-1" />
            <span className="text-[10px] uppercase tracking-widest opacity-50">implies</span>
          </div>
          
          <div className="flex-1 bg-background/50 rounded-xl p-4 border border-white/5 text-center shadow-inner">
            <span className="text-foreground font-semibold text-lg line-clamp-2">
              {rule.consequent.join(", ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="flex flex-col bg-white/5 rounded-lg p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3" /> Confidence
            </span>
            <span className="text-foreground font-display font-bold">
              {(rule.confidence * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Reliability of rule</span>
          </div>
          
          <div className="flex flex-col bg-white/5 rounded-lg p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="w-3 h-3" /> Support
            </span>
            <span className="text-foreground font-display font-bold">
              {(rule.support * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Overall frequency</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
