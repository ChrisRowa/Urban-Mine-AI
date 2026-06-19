import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RotateCcw, 
  Package, 
  Link, 
  Home,
  DollarSign,
  Leaf,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  UserConstructorConfig, 
  MaterialProperty, 
  ConnectionType, 
  ConstructorTemplate,
  loadUserConfig,
  saveUserConfig,
  addCustomMaterial,
  addCustomConnectionType,
  addCustomTemplate,
  resetToDefaults
} from "@/lib/constructorConfig";

export default function ConfigurationPage() {
  const [config, setConfig] = useState<UserConstructorConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'materials' | 'connections' | 'templates'>('materials');
  const [editingItem, setEditingItem] = useState<MaterialProperty | ConnectionType | ConstructorTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userConfig = loadUserConfig();
    setConfig(userConfig);
  }, []);

  const handleAddMaterial = (material: MaterialProperty) => {
    if (!config) return;
    
    // Check if material already exists
    if (config.materials.some(m => m.name.toLowerCase() === material.name.toLowerCase())) {
      toast({
        title: "Duplicate Material",
        description: "A material with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfig = addCustomMaterial(material);
    setConfig(updatedConfig);
    setShowForm(false);
    setEditingItem(null);
    
    toast({
      title: "Material Added",
      description: `${material.name} has been added to your materials.`,
    });
  };

  const handleAddConnectionType = (connectionType: ConnectionType) => {
    if (!config) return;
    
    if (config.connectionTypes.some(c => c.name.toLowerCase() === connectionType.name.toLowerCase())) {
      toast({
        title: "Duplicate Connection Type",
        description: "A connection type with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfig = addCustomConnectionType(connectionType);
    setConfig(updatedConfig);
    setShowForm(false);
    setEditingItem(null);
    
    toast({
      title: "Connection Type Added",
      description: `${connectionType.name} has been added to your connection types.`,
    });
  };

  const handleAddTemplate = (template: ConstructorTemplate) => {
    if (!config) return;
    
    if (config.constructorTemplates.some(t => t.id === template.id)) {
      toast({
        title: "Duplicate Template",
        description: "A template with this ID already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfig = addCustomTemplate(template);
    setConfig(updatedConfig);
    setShowForm(false);
    setEditingItem(null);
    
    toast({
      title: "Template Added",
      description: `${template.name} has been added to your templates.`,
    });
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    const defaultConf = loadUserConfig();
    setConfig(defaultConf);
    
    toast({
      title: "Reset to Defaults",
      description: "Configuration has been reset to default values.",
    });
  };

  const removeCustomItem = (type: 'materials' | 'connectionTypes' | 'constructorTemplates', index: number) => {
    if (!config) return;
    
    const defaultIndices = {
      materials: 9, // Number of default materials
      connectionTypes: 8, // Number of default connection types
      constructorTemplates: 3 // Number of default templates
    };

    if (index < defaultIndices[type]) {
      toast({
        title: "Cannot Remove Default Item",
        description: "Default items cannot be removed, only custom ones.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfig = {
      ...config,
      [type]: (config[type] as Array<MaterialProperty | ConnectionType | ConstructorTemplate>).filter((_: unknown, i: number) => i !== index)
    };
    
    saveUserConfig(updatedConfig);
    setConfig(updatedConfig);
    
    toast({
      title: "Item Removed",
      description: "Custom item has been removed.",
    });
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Constructor Configuration</h1>
              <p className="text-sm text-muted-foreground">
                Customize materials, connection types, and construction templates
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'materials' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('materials')}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Materials
            </Button>
            <Button
              variant={activeTab === 'connections' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('connections')}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              Connections
            </Button>
            <Button
              variant={activeTab === 'templates' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('templates')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Templates
            </Button>
          </div>
        </motion.div>

        {/* Add Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Add New {activeTab === 'materials' ? 'Material' : activeTab === 'connections' ? 'Connection Type' : 'Template'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'materials' && (
                  <MaterialForm onSubmit={handleAddMaterial} onCancel={() => setShowForm(false)} />
                )}
                {activeTab === 'connections' && (
                  <ConnectionForm onSubmit={handleAddConnectionType} onCancel={() => setShowForm(false)} />
                )}
                {activeTab === 'templates' && (
                  <TemplateForm onSubmit={handleAddTemplate} onCancel={() => setShowForm(false)} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === 'materials' ? 'Materials' : activeTab === 'connections' ? 'Connection Types' : 'Construction Templates'}
                </CardTitle>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add {activeTab === 'materials' ? 'Material' : activeTab === 'connections' ? 'Connection' : 'Template'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'materials' && (
                <MaterialsList materials={config.materials} onRemove={(index) => removeCustomItem('materials', index)} />
              )}
              {activeTab === 'connections' && (
                <ConnectionsList connections={config.connectionTypes} onRemove={(index) => removeCustomItem('connectionTypes', index)} />
              )}
              {activeTab === 'templates' && (
                <TemplatesList templates={config.constructorTemplates} onRemove={(index) => removeCustomItem('constructorTemplates', index)} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// Material Form Component
function MaterialForm({ onSubmit, onCancel }: { onSubmit: (material: MaterialProperty) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<MaterialProperty>({
    name: '',
    baseValue: 0,
    co2Factor: 0,
    reusabilityScore: 0,
    recyclable: true,
    color: '#CCCCCC',
    texture: 'solid'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="materialName">Material Name</Label>
          <Input
            id="materialName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Carbon Fiber"
            required
          />
        </div>
        <div>
          <Label htmlFor="baseValue">Base Value ($)</Label>
          <Input
            id="baseValue"
            type="number"
            value={formData.baseValue}
            onChange={(e) => setFormData({ ...formData, baseValue: parseFloat(e.target.value) || 0 })}
            placeholder="100"
            required
          />
        </div>
        <div>
          <Label htmlFor="co2Factor">CO2 Factor</Label>
          <Input
            id="co2Factor"
            type="number"
            step="0.1"
            value={formData.co2Factor}
            onChange={(e) => setFormData({ ...formData, co2Factor: parseFloat(e.target.value) || 0 })}
            placeholder="1.0"
            required
          />
        </div>
        <div>
          <Label htmlFor="reusabilityScore">Reusability Score</Label>
          <Input
            id="reusabilityScore"
            type="number"
            value={formData.reusabilityScore}
            onChange={(e) => setFormData({ ...formData, reusabilityScore: parseInt(e.target.value) || 0 })}
            placeholder="10"
            required
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="texture">Texture</Label>
          <Select value={formData.texture} onValueChange={(value) => setFormData({ ...formData, texture: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="metallic">Metallic</SelectItem>
              <SelectItem value="wood-grain">Wood Grain</SelectItem>
              <SelectItem value="transparent">Transparent</SelectItem>
              <SelectItem value="brushed-metal">Brushed Metal</SelectItem>
              <SelectItem value="smooth">Smooth</SelectItem>
              <SelectItem value="rough">Rough</SelectItem>
              <SelectItem value="plastic">Plastic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="recyclable"
          checked={formData.recyclable}
          onChange={(e) => setFormData({ ...formData, recyclable: e.target.checked })}
        />
        <Label htmlFor="recyclable">Recyclable</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Material
        </Button>
      </div>
    </form>
  );
}

// Connection Form Component
function ConnectionForm({ onSubmit, onCancel }: { onSubmit: (connection: ConnectionType) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<ConnectionType>({
    name: '',
    score: 0,
    description: '',
    difficulty: 'Easy'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="connectionName">Connection Name</Label>
          <Input
            id="connectionName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Magnetically Attached"
            required
          />
        </div>
        <div>
          <Label htmlFor="score">Score</Label>
          <Input
            id="score"
            type="number"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
            placeholder="10"
            required
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe how this connection type works..."
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Connection Type
        </Button>
      </div>
    </form>
  );
}

// Template Form Component
function TemplateForm({ onSubmit, onCancel }: { onSubmit: (template: ConstructorTemplate) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<ConstructorTemplate>({
    id: '',
    name: '',
    description: '',
    category: '',
    size: '',
    difficulty: 'Easy',
    estimatedCost: 0,
    co2Savings: 0,
    materials: [],
    baseRequirements: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="templateId">Template ID</Label>
          <Input
            id="templateId"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="e.g., custom-shed"
            required
          />
        </div>
        <div>
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Custom Garden Shed"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Storage"
            required
          />
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            placeholder="e.g., 100 sq ft"
            required
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
            placeholder="5000"
            required
          />
        </div>
        <div>
          <Label htmlFor="co2Savings">CO2 Savings (tons)</Label>
          <Input
            id="co2Savings"
            type="number"
            step="0.1"
            value={formData.co2Savings}
            onChange={(e) => setFormData({ ...formData, co2Savings: parseFloat(e.target.value) || 0 })}
            placeholder="2.5"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="templateDescription">Description</Label>
        <Textarea
          id="templateDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this construction template..."
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Template
        </Button>
      </div>
    </form>
  );
}

// Materials List Component
function MaterialsList({ materials, onRemove }: { materials: MaterialProperty[], onRemove: (index: number) => void }) {
  const defaultCount = 9; // Number of default materials

  return (
    <div className="space-y-3">
      {materials.map((material, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: material.color }}
            />
            <div>
              <div className="font-medium">{material.name}</div>
              <div className="text-sm text-muted-foreground">
                ${material.baseValue} • CO2: {material.co2Factor} • Score: {material.reusabilityScore}
              </div>
            </div>
            {material.recyclable && <Badge variant="secondary">Recyclable</Badge>}
            {index >= defaultCount && <Badge variant="outline">Custom</Badge>}
          </div>
          {index >= defaultCount && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// Connections List Component
function ConnectionsList({ connections, onRemove }: { connections: ConnectionType[], onRemove: (index: number) => void }) {
  const defaultCount = 8; // Number of default connection types

  return (
    <div className="space-y-3">
      {connections.map((connection, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{connection.name}</div>
            <div className="text-sm text-muted-foreground">{connection.description}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Score: {connection.score}</Badge>
              <Badge variant="secondary">{connection.difficulty}</Badge>
              {index >= defaultCount && <Badge variant="outline">Custom</Badge>}
            </div>
          </div>
          {index >= defaultCount && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// Templates List Component
function TemplatesList({ templates, onRemove }: { templates: ConstructorTemplate[], onRemove: (index: number) => void }) {
  const defaultCount = 3; // Number of default templates

  return (
    <div className="space-y-3">
      {templates.map((template, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{template.name}</span>
              <Badge variant="outline">{template.category}</Badge>
              <Badge variant="secondary">{template.difficulty}</Badge>
              {index >= defaultCount && <Badge variant="outline">Custom</Badge>}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${template.estimatedCost.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                {template.co2Savings} tons CO2
              </span>
              <span>{template.size}</span>
            </div>
          </div>
          {index >= defaultCount && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
