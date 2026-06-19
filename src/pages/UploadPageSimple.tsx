import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building, Package, Settings, AlertCircle, ArrowRight, BarChart3, Leaf, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { loadUserConfig } from "@/lib/constructorConfig";

interface BuildingComponent {
  id: string;
  name: string;
  material: string;
  connectionType: string;
  condition: string;
  quantity: number;
  location: string;
  estimatedAge?: number;
  notes?: string;
  category?: string;
  reuseScore?: number;
}

interface ProjectData {
  projectName: string;
  components: BuildingComponent[];
}

export default function UploadPageSimple() {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: '',
    components: []
  });
  const [currentComponent, setCurrentComponent] = useState<BuildingComponent>({
    id: '',
    name: '',
    material: '',
    connectionType: '',
    condition: '',
    quantity: 1,
    location: '',
    estimatedAge: undefined,
    notes: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userConfig, setUserConfig] = useState(loadUserConfig());
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hasExistingResults, setHasExistingResults] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('analysisResults');
    const urlParams = new URLSearchParams(window.location.search);
    const fromUpload = urlParams.get('from') === 'upload';
    
    console.log('Upload page mounted');
    console.log('Saved results found:', !!savedResults);
    
    if (savedResults) {
      setHasExistingResults(true);
    }
    
    setUserConfig(loadUserConfig());
  }, []); // Remove navigate from dependencies as we don't automatedly redirect anymore

  const clearResults = () => {
    console.log('Clearing all analysis results');
    localStorage.removeItem('analysisResults');
    localStorage.removeItem('projectData');
    
    // Reset local state
    setProjectData({
      projectName: '',
      components: []
    });
    setHasExistingResults(false);
    
    toast({
      title: "Results Cleared",
      description: "All previous analysis results and current project data have been cleared.",
    });
  };

  const addComponent = () => {
    console.log('Adding component:', currentComponent);
    
    if (!currentComponent.name || !currentComponent.material || !currentComponent.connectionType || !currentComponent.condition) {
      console.log('Validation failed - missing fields:', {
        name: !!currentComponent.name,
        material: !!currentComponent.material,
        connectionType: !!currentComponent.connectionType,
        condition: !!currentComponent.condition
      });
      
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required component fields.",
        variant: "destructive",
      });
      return;
    }

    const newComponent: BuildingComponent = {
      ...currentComponent,
      id: Date.now().toString(),
    };

    console.log('New component created:', newComponent);

    setProjectData(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    // Reset form
    console.log('Resetting form...');
    setCurrentComponent({
      id: '',
      name: '',
      material: '',
      connectionType: '',
      condition: '',
      quantity: 1,
      location: '',
      estimatedAge: undefined,
      notes: ''
    });

    toast({
      title: "Component Added",
      description: `${newComponent.name} has been added to your project.`,
    });
  };

  const removeComponent = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
  };

  const analyzeComponents = async () => {
    if (isAnalyzing) {
      console.log('Analysis already in progress, ignoring click');
      return;
    }
    
    if (!projectData.projectName) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (projectData.components.length === 0) {
      toast({
        title: "No Components Added",
        description: "Please add at least one component to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const requestData = {
        components: projectData.components,
        userConfig: userConfig,
        projectName: projectData.projectName
      };
      
      console.log('Sending request:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Analysis failed: ${response.status} ${errorText}`);
      }

      const analysisData = await response.json();
      console.log('Analysis data received:', analysisData);

      // Clear any existing data and save new results
      localStorage.removeItem('analysisResults');
      localStorage.removeItem('projectData');
      
      localStorage.setItem('analysisResults', JSON.stringify(analysisData));
      localStorage.setItem('projectData', JSON.stringify(projectData));

      toast({
        title: "Analysis Complete!",
        description: `Successfully analyzed ${projectData.components.length} components from ${projectData.projectName}.`,
      });

      // Force navigation to dashboard
      console.log('Navigating to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">UrbanMine AI</h1>
          <p className="text-muted-foreground">
            Enter your building components manually for circular construction analysis
          </p>
          
          {hasExistingResults && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg inline-flex items-center gap-3"
            >
              <span className="text-sm font-medium">You have previous analysis results.</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                View Dashboard <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Project Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Project Information
              </CardTitle>
              <CardDescription>
                Enter the basic details about your construction project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Office Building Renovation"
                    value={projectData.projectName}
                    onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    variant="secondary"
                    onClick={clearResults}
                    className="w-full font-semibold border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100"
                  >
                    Clear Previous Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Component Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add Building Component
              </CardTitle>
              <CardDescription>
                Enter details for each building component you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="componentName">Component Name *</Label>
                  <Input
                    id="componentName"
                    placeholder="e.g., Steel I-Beam, Window Panel"
                    value={currentComponent.name}
                    onChange={(e) => setCurrentComponent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material Type *</Label>
                  <Select
                    value={currentComponent.material}
                    onValueChange={(value) => setCurrentComponent(prev => ({ ...prev, material: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel">Steel</SelectItem>
                      <SelectItem value="Concrete">Concrete</SelectItem>
                      <SelectItem value="Wood">Wood</SelectItem>
                      <SelectItem value="Glass">Glass</SelectItem>
                      <SelectItem value="Aluminum">Aluminum</SelectItem>
                      <SelectItem value="Gypsum">Gypsum</SelectItem>
                      <SelectItem value="Brick">Brick</SelectItem>
                      <SelectItem value="Copper">Copper</SelectItem>
                      <SelectItem value="Plastic">Plastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectionType">Connection Type *</Label>
                  <Select
                    value={currentComponent.connectionType}
                    onValueChange={(value) => setCurrentComponent(prev => ({ ...prev, connectionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bolted">Bolted</SelectItem>
                      <SelectItem value="Welded">Welded</SelectItem>
                      <SelectItem value="Screwed">Screwed</SelectItem>
                      <SelectItem value="Nailed">Nailed</SelectItem>
                      <SelectItem value="Glued">Glued</SelectItem>
                      <SelectItem value="Interlocking">Interlocking</SelectItem>
                      <SelectItem value="Cast-in-place">Cast-in-place</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={currentComponent.condition}
                    onValueChange={(value) => setCurrentComponent(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="e.g., 5"
                    value={currentComponent.quantity}
                    onChange={(e) => setCurrentComponent(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Floor 2, North Wall"
                    value={currentComponent.location}
                    onChange={(e) => setCurrentComponent(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedAge">Age (years)</Label>
                  <Input
                    id="estimatedAge"
                    type="number"
                    min="0"
                    placeholder="e.g., 10"
                    value={currentComponent.estimatedAge || ''}
                    onChange={(e) => setCurrentComponent(prev => ({ ...prev, estimatedAge: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this component..."
                  value={currentComponent.notes}
                  onChange={(e) => setCurrentComponent(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button onClick={addComponent} className="w-full">
                Add Component
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Added Components List */}
        {projectData.components.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Added Components ({projectData.components.length})
                </CardTitle>
                <CardDescription>
                  Review your components before analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectData.components.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{component.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {component.material} • {component.connectionType} • {component.condition} • Qty: {component.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {component.location} {component.estimatedAge && `• Age: ${component.estimatedAge} years`}
                        </p>
                        {component.notes && (
                          <p className="text-sm text-muted-foreground italic">{component.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeComponent(component.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analysis Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={analyzeComponents}
            disabled={isAnalyzing || !projectData.projectName || projectData.components.length === 0}
            size="lg"
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Continue to Analysis
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
