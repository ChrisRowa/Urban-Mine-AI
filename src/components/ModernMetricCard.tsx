import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  description?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
    trend: 'text-emerald-600'
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    trend: 'text-blue-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    trend: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    trend: 'text-orange-600'
  }
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function ModernMetricCard({
  title,
  value,
  icon: Icon,
  trend,
  change,
  description,
  color = 'emerald',
  size = 'md'
}: ModernMetricCardProps) {
  const colors = colorClasses[color];
  const sizeClass = sizeClasses[size];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`
        ${sizeClass} border-2 ${colors.border} ${colors.bg} 
        hover:shadow-lg transition-all duration-200 hover:-translate-y-1
      `}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className={`text-2xl font-bold text-gray-900 ${size === 'lg' ? 'text-3xl' : ''}`}>
                  {value}
                </h3>
                {trend && change && (
                  <div className={`flex items-center gap-1 text-xs ${colors.trend}`}>
                    {getTrendIcon()}
                    {change}
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
            <div className={`
              p-3 rounded-xl ${colors.bg}
              ${size === 'lg' ? 'p-4' : ''}
            `}>
              <Icon className={`h-5 w-5 ${colors.icon} ${size === 'lg' ? 'h-6 w-6' : ''}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
