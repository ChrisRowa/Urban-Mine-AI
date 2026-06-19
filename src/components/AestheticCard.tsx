import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AestheticCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'subtle';
}

export function AestheticCard({ children, className, variant = 'default' }: AestheticCardProps) {
  const variants = {
    default: "bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300",
    premium: "bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl hover:shadow-white/5 transition-all duration-300",
    elevated: "bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 shadow-md hover:shadow-lg transition-all duration-300",
    subtle: "bg-gray-50/50 border border-gray-100/30 hover:bg-white/70 transition-all duration-300"
  };

  return (
    <Card className={cn(variants[variant], className)}>
      {children}
    </Card>
  );
}

interface AestheticBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'default' | 'premium';
  className?: string;
}

export function AestheticBadge({ children, variant = 'default', className }: AestheticBadgeProps) {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    warning: "bg-amber-50 text-amber-700 border-amber-200/50",
    info: "bg-blue-50 text-blue-700 border-blue-200/50",
    premium: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200/50 shadow-sm",
    default: "bg-gray-50 text-gray-700 border-gray-200/50"
  };

  return (
    <Badge className={cn("px-3 py-1 text-xs font-medium border", variants[variant], className)}>
      {children}
    </Badge>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, change, icon, trend = 'neutral', className }: MetricCardProps) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl p-6 hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", 
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</div>
        {icon && <div className={cn("p-2 rounded-lg bg-gray-50/80", trendColors[trend].replace('text', 'bg').replace('600', '100'))}>{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</div>
      {change && (
        <div className={cn("text-xs font-semibold flex items-center gap-1", trendColors[trend])}>
          {trend === 'up' && "↑"}
          {trend === 'down' && "↓"}
          {change}
        </div>
      )}
    </div>
  );
}
