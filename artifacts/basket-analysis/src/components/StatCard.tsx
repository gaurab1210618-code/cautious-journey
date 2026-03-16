import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
  accentColor?: "primary" | "accent" | "green";
}

export function StatCard({ title, value, subtitle, icon: Icon, delay = 0, accentColor = "primary" }: StatCardProps) {
  const colorMap = {
    primary: "text-primary shadow-primary/20",
    accent: "text-accent shadow-accent/20",
    green: "text-emerald-400 shadow-emerald-400/20"
  };

  const bgMap = {
    primary: "bg-primary/10",
    accent: "bg-accent/10",
    green: "bg-emerald-400/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${bgMap[accentColor]}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-muted-foreground font-medium text-sm tracking-wide uppercase">{title}</h3>
        <div className={`p-2 rounded-xl ${bgMap[accentColor]} ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-display font-bold text-foreground mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
