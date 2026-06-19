import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  index?: number;
}

export function MetricCard({ label, value, change, icon: Icon, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="metric-card"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="text-2xl font-semibold font-mono">{value}</h3>
      {change && (
        <p className="mt-2 text-sm font-medium text-primary">{change}</p>
      )}
    </motion.div>
  );
}
