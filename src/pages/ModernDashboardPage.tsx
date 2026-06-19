import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  Recycle, 
  Leaf, 
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  ArrowRight,
  ListChecks,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernLayout } from "@/components/ModernLayout";
import { ModernMetricCard } from "@/components/ModernMetricCard";

interface AnalysisData {
  components: ComponentData[];
  summary: {
    total: number;
    reusable: number;
    recyclable: number;
    waste: number;
    salvageValue: number;
    co2Savings: number;
  };
}

interface ComponentData {
  id: string;
  name: string;
  material: string;
  quantity: number;
  condition: string;
  category: string;
  reuseScore: number;
  location: string;
}

const materialColors = {
  'Steel': '#10B981',
  'Wood': '#8B4513',
  'Glass': '#3B82F6',
  'Metal': '#6B7280',
  'Concrete': '#9CA3AF',
  'Aluminum': '#94A3B8'
};

export default function ModernDashboardPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const data = JSON.parse(savedResults);
        setAnalysisData(data);
      } catch (error) {
        console.error('Error loading analysis data:', error);
      }
    }
  }, []);

  if (!analysisData) {
    return (
      <ModernLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Data</h2>
            <p className="text-gray-600 mb-6">Upload and analyze building components to see your dashboard</p>
            <Button onClick={() => navigate('/upload')} className="bg-emerald-600 hover:bg-emerald-700">
              Upload Data
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  const filteredComponents = analysisData.components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || component.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pieChartData = [
    { name: 'Reusable', value: analysisData.summary.reusable, color: '#10B981' },
    { name: 'Recyclable', value: analysisData.summary.recyclable, color: '#3B82F6' },
    { name: 'Waste', value: analysisData.summary.waste, color: '#EF4444' }
  ];

  const barChartData = Object.entries(
    analysisData.components.reduce((acc, component) => {
      acc[component.material] = (acc[component.material] || 0) + component.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([material, quantity]) => ({
    material,
    quantity,
    color: materialColors[material as keyof typeof materialColors] || '#6B7280'
  }));

  return (
    <ModernLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">AI-powered material analysis and sustainability metrics</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => navigate('/upload')} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Package className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <ModernMetricCard
            title="Total Components"
            value={analysisData.summary.total}
            icon={Package}
            color="emerald"
            change="from last analysis"
            trend="up"
          />
          <ModernMetricCard
            title="Reusable Materials"
            value={analysisData.summary.reusable}
            icon={Recycle}
            color="blue"
            change={`${Math.round((analysisData.summary.reusable / analysisData.summary.total) * 100)}% recovery rate`}
            trend="up"
          />
          <ModernMetricCard
            title="CO₂ Saved"
            value={`${analysisData.summary.co2Savings} tons`}
            icon={Leaf}
            color="emerald"
            change="environmental impact"
            trend="up"
          />
          <ModernMetricCard
            title="Salvage Value"
            value={`$${analysisData.summary.salvageValue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
            change="estimated market value"
            trend="up"
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  Material Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of materials by reuse category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="relative">
                    {/* Simple pie chart visualization */}
                    <div className="w-48 h-48 rounded-full relative overflow-hidden">
                      {pieChartData.map((segment, index) => {
                        const percentage = (segment.value / analysisData.summary.total) * 100;
                        const previousPercentages = pieChartData.slice(0, index).reduce((sum, s) => sum + (s.value / analysisData.summary.total) * 100, 0);
                        
                        return (
                          <div
                            key={segment.name}
                            className="absolute inset-0"
                            style={{
                              background: `conic-gradient(${segment.color} ${previousPercentages}% ${previousPercentages + percentage}%, transparent ${previousPercentages + percentage}% 100%)`
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <p className="text-2xl font-bold text-gray-900">{analysisData.summary.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {pieChartData.map((segment) => (
                    <div key={segment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm font-medium">{segment.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{segment.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Material Types
                </CardTitle>
                <CardDescription>
                  Quantity breakdown by material type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {barChartData.map((item, index) => (
                    <motion.div
                      key={item.material}
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.quantity / Math.max(...barChartData.map(d => d.quantity))) * 100}%` }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div 
                        className="w-full rounded-t-md"
                        style={{ 
                          backgroundColor: item.color,
                          height: '100%',
                          minHeight: '20px'
                        }}
                      />
                      <span className="text-xs text-gray-600 text-center">{item.material}</span>
                      <span className="text-xs font-semibold">{item.quantity}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Components Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Component Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of all analyzed components
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search components..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Reusable">Reusable</SelectItem>
                      <SelectItem value="Recyclable">Recyclable</SelectItem>
                      <SelectItem value="Waste">Waste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Component</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Material</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComponents.map((component, index) => (
                      <motion.tr
                        key={component.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.02 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{component.name}</p>
                            <p className="text-sm text-gray-500">{component.location}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{component.material}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{component.quantity}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={
                              component.condition === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                              component.condition === 'Fair' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }
                          >
                            {component.condition}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Progress 
                                value={component.reuseScore} 
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {component.reuseScore}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={
                              component.category === 'Reusable' ? 'bg-emerald-100 text-emerald-800' :
                              component.category === 'Recyclable' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {component.category}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Upload More Data
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/plan')}
              variant="outline"
              className="gap-2"
            >
              <ListChecks className="h-4 w-4" />
              View Deconstruction Plan
            </Button>
            <Button 
              onClick={() => navigate('/reuse')}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <Recycle className="h-4 w-4" />
              Explore Reuse Opportunities
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
