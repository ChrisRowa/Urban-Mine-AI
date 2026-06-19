import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  Plus, 
  X,
  CheckCircle,
  AlertCircle,
  Package,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ModernLayout } from "@/components/ModernLayout";
import { ModernMetricCard } from "@/components/ModernMetricCard";

interface BuildingComponent {
  id: string;
  name: string;
  material: string;
  connectionType: string;
  condition: string;
  quantity: number;
  location: string;
}

const materials = [
  "Steel", "Aluminum", "Wood", "Glass", "Metal", "Gypsum", "PVC", "Ceramic", "Concrete"
];

const connectionTypes = [
  "Bolted", "Welded", "Glued", "Nailed", "Screwed", "Clamped"
];

const conditions = [
  "Good", "Fair", "Poor"
];

const locations = [
  "Foundation", "Structure", "Roof", "Walls", "Floors", "Interior", "Exterior", "Mechanical"
];

export default function ModernUploadPage() {
  const [components, setComponents] = useState<BuildingComponent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BuildingComponent>({
    id: '',
    name: '',
    material: '',
    connectionType: '',
    condition: '',
    quantity: 1,
    location: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const addComponent = () => {
    if (!formData.name || !formData.material || !formData.condition || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newComponent = {
      ...formData,
      id: Date.now().toString(),
    };
    setComponents([...components, newComponent]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      material: '',
      connectionType: '',
      condition: '',
      quantity: 1,
      location: ''
    });
    setShowForm(false);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const analyzeComponents = async () => {
    if (components.length === 0) {
      toast({
        title: "No Components",
        description: "Please add at least one component to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const processedComponents = components.map(comp => {
        let reuseScore = 50;
        let category = 'Reusable';
        let reason = '';

        const highValueMaterials = ['Steel', 'Aluminum', 'Wood', 'Glass'];
        if (highValueMaterials.includes(comp.material)) {
          reuseScore += 25;
        }

        if (comp.condition === 'Good') {
          reuseScore += 20;
          category = 'Reusable';
          reason = 'Excellent condition for direct reuse';
        } else if (comp.condition === 'Fair') {
          reuseScore += 5;
          category = 'Recyclable';
          reason = 'Fair condition, suitable for recycling';
        } else if (comp.condition === 'Poor') {
          reuseScore -= 30;
          category = 'Waste';
          reason = 'Poor condition, requires disposal';
        }

        if (comp.connectionType === 'Bolted') {
          reuseScore += 10;
        } else if (comp.connectionType === 'Welded') {
          reuseScore -= 10;
        } else if (comp.connectionType === 'Glued') {
          reuseScore -= 20;
        }

        reuseScore = Math.max(0, Math.min(100, reuseScore));

        return {
          ...comp,
          reuseScore: Math.round(reuseScore),
          category,
          reason: reason.trim()
        };
      });

      const summary = {
        total: processedComponents.length,
        reusable: processedComponents.filter(c => c.category === 'Reusable').length,
        recyclable: processedComponents.filter(c => c.category === 'Recyclable').length,
        waste: processedComponents.filter(c => c.category === 'Waste').length,
        salvageValue: processedComponents.reduce((total, comp) => {
          const materialValues = {
            'Steel': 200, 'Aluminum': 150, 'Wood': 80, 'Glass': 100,
            'Metal': 120, 'Gypsum': 20, 'PVC': 15, 'Ceramic': 40, 'Concrete': 10
          };
          const baseValue = materialValues[comp.material] || 50;
          return total + (baseValue * comp.quantity * (comp.reuseScore / 100));
        }, 0),
        co2Savings: processedComponents.reduce((total, comp) => {
          const materialCO2 = {
            'Steel': 1.8, 'Aluminum': 1.2, 'Wood': 0.3, 'Glass': 0.8,
            'Metal': 1.5, 'Gypsum': 0.2, 'PVC': 0.4, 'Ceramic': 0.6, 'Concrete': 0.1
          };
          const co2PerUnit = materialCO2[comp.material] || 0.5;
          return total + (co2PerUnit * comp.quantity * (comp.reuseScore / 100));
        }, 0)
      };

      const mockAnalysisData = {
        components: processedComponents,
        summary: summary
      };

      localStorage.setItem('analysisResults', JSON.stringify(mockAnalysisData));

      toast({
        title: "Analysis Complete!",
        description: `Successfully analyzed ${components.length} components.`,
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('analysisResults');
    toast({
      title: "Cache Cleared",
      description: "Old analysis data has been cleared.",
    });
  };

  const totalValue = components.reduce((sum, c) => {
    const values = { 'Steel': 200, 'Aluminum': 150, 'Wood': 80, 'Glass': 100, 'Metal': 120 };
    return sum + ((values[c.material] || 50) * c.quantity);
  }, 0);

  return (
    <ModernLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
            <Upload className="h-3 w-3" />
            Step 1: Upload Building Data
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Building Components</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add building components for AI-powered material analysis and circular economy insights
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <ModernMetricCard
            title="Components"
            value={components.length}
            icon={Package}
            color="emerald"
            description="Total items uploaded"
          />
          <ModernMetricCard
            title="High Value"
            value={components.filter(c => c.material === 'Steel' || c.material === 'Aluminum').length}
            icon={BarChart3}
            color="blue"
            description="Premium materials"
          />
          <ModernMetricCard
            title="Total Units"
            value={components.reduce((sum, c) => sum + c.quantity, 0)}
            icon={FileText}
            color="purple"
            description="Combined quantity"
          />
          <ModernMetricCard
            title="Est. Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={BarChart3}
            color="orange"
            description="Market value"
          />
        </motion.div>

        {/* Add Component Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-emerald-600" />
                      Add Building Component
                    </CardTitle>
                    <CardDescription>
                      Enter details about the building component
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 font-semibold">Component Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Steel Beam, Window Panel"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="material" className="text-gray-900 font-semibold">Material *</Label>
                    <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map(material => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="connectionType" className="text-gray-900 font-semibold">Connection Type</Label>
                    <Select value={formData.connectionType} onValueChange={(value) => setFormData({ ...formData, connectionType: value })}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectionTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition" className="text-gray-900 font-semibold">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(condition => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-gray-900 font-semibold">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-900 font-semibold">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={addComponent} className="bg-emerald-600 hover:bg-emerald-700">
                    Add Component
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Components List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Building Components
                  </CardTitle>
                  <CardDescription>
                    {components.length} component{components.length !== 1 ? 's' : ''} ready for analysis
                  </CardDescription>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {components.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Components Added</h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding building components for AI analysis
                  </p>
                  <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Component
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((component, index) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Card className="p-4 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{component.name}</h4>
                              <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                                {component.material}
                              </Badge>
                              <Badge 
                                className={
                                  component.condition === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                                  component.condition === 'Fair' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800'
                                }
                              >
                                {component.condition}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Connection:</span> {component.connectionType || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span> {component.location}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span> {component.quantity}
                              </div>
                              <div>
                                <span className="font-medium">ID:</span> {component.id}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(component.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearCache} className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Skip to Dashboard
            </Button>
          </div>
          <Button 
            onClick={analyzeComponents} 
            disabled={components.length === 0 || isAnalyzing}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Components <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
