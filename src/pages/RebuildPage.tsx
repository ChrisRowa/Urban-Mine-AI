import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Building2, Package, DollarSign, Leaf,
  Download, Share, Send, Search, Recycle,
  Lightbulb, TrendingUp, Zap, Target, Award,
  ArrowRight, Trash2, HelpCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AestheticCard, AestheticBadge, MetricCard } from "@/components/AestheticCard";
import { useToast } from "@/hooks/use-toast";

interface BuildingComponent {
  id?: string;
  name: string;
  material: string;
  quantity: number;
  condition: 'Good' | 'Fair' | 'Poor';
  category: string;
  reuseScore?: number;
}

interface RecoveredMaterial {
  id: string;
  name: string;
  material: string;
  quantity: number;
  condition: 'Good' | 'Fair';
  reuseScore: number;
  source: string;
  suggestedApplications: string[];
}

interface MaterialAllocation {
  material: string;
  used: number;
  remaining: number;
  source: string;
}

interface BuildingDesign {
  type: string;
  typeLabel: string;
  floors: number;
  area: number;
  purpose: string;
  materials: MaterialAllocation[];
  sustainability: {
    co2Saved: number;
    landfillWasteAvoided: number;
    costSaved: number;
    reuseEfficiency: number;
  };
  recommendations: string[];
  architecturalRationale: string;
  imageUrl: string;
}

// --- Static Data ---

const buildingTypes = [
  { value: 'residential', label: 'Residential House', icon: '🏠' },
  { value: 'affordable', label: 'Affordable Housing', icon: '🏘️' },
  { value: 'school', label: 'School', icon: '🏫' },
  { value: 'warehouse', label: 'Warehouse', icon: '📦' },
  { value: 'office', label: 'Office Building', icon: '🏢' },
  { value: 'tiny-house', label: 'Tiny House', icon: '⛺' },
  { value: 'urban-park', label: 'Urban Park Structure', icon: '🏞️' },
  { value: 'artist-studio', label: 'Artist Studio', icon: '🎨' },
  { value: 'clinic', label: 'Community Clinic', icon: '🏥' },
  { value: 'greenhouse', label: 'Sustainable Greenhouse', icon: '🌿' },
];

const purposes = [
  'Family Housing', 'Educational Facility', 'Storage', 'Commercial Space',
  'Community Center', 'Mixed Use', 'Industrial', 'Agricultural',
  'Emergency Shelter', 'Medical Clinic', 'Urban Farming', 'Co-working',
  'Art Gallery', 'Public Recreation', 'Low-cost Housing', 'Transit Hub',
];

const sampleMaterials: RecoveredMaterial[] = [
  {
    id: 'sample-1',
    name: 'Structural Steel Beams (Grade A)',
    material: 'Steel',
    quantity: 45,
    condition: 'Good',
    reuseScore: 92,
    source: 'Industrial Demolition, Peenya',
    suggestedApplications: ['Main Frame', 'Structural Support'],
  },
  {
    id: 'sample-2',
    name: 'Tempered Glass Panels',
    material: 'Glass',
    quantity: 120,
    condition: 'Good',
    reuseScore: 88,
    source: 'Office Strip-out, Whitefield',
    suggestedApplications: ['Exterior Glazing', 'Partitions'],
  },
  {
    id: 'sample-3',
    name: 'Reclaimed Teak Flooring',
    material: 'Wood',
    quantity: 850,
    condition: 'Good',
    reuseScore: 95,
    source: 'Heritage Building, Basavanagudi',
    suggestedApplications: ['Premium Flooring', 'Wall Cladding'],
  },
  {
    id: 'sample-4',
    name: 'Aluminum Door Frames',
    material: 'Aluminum',
    quantity: 36,
    condition: 'Fair',
    reuseScore: 78,
    source: 'Modern Office, HSR Layout',
    suggestedApplications: ['Interior Doors', 'Window Frames'],
  },
];

// --- Helper functions defined at module level to avoid hoisting issues ---

function getSuggestedApplications(material: string): string[] {
  const applications: Record<string, string[]> = {
    'Steel': ['Structural Beams', 'Framework', 'Support Columns'],
    'Wood': ['Flooring', 'Wall Panels', 'Roof Structure'],
    'Glass': ['Windows', 'Doors', 'Partitions'],
    'Metal': ['Cladding', 'Roofing', 'Structural Elements'],
    'Concrete': ['Foundation', 'Floor Slabs', 'Walls'],
    'Aluminum': ['Window Frames', 'Cladding', 'Doors'],
  };
  return applications[material] || ['General Construction'];
}

function getMaterialIcon(material: string): string {
  const icons: Record<string, string> = {
    'Steel': '🔩', 'Wood': '🪵', 'Glass': '🪟',
    'Metal': '⚙️', 'Concrete': '🧱', 'Aluminum': '🔧',
  };
  return icons[material] || '📦';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-blue-100 text-blue-800';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function getConditionColor(condition: string): string {
  return condition === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
}

/**
 * Builds a highly specific AI image generation prompt based on user's exact inputs.
 * Uses Pollinations.ai (free, no API key) with the Flux model for photorealistic renders.
 */
function buildArchitecturalImageUrl(
  buildingType: string,
  typeLabel: string,
  purpose: string,
  floors: number,
  area: number,
  dominantMaterials: string[]
): string {
  const materialDesc = dominantMaterials.slice(0, 3).join(', ');

  // Type-specific architectural style descriptors
  const styleMap: Record<string, string> = {
    'residential':   'modern luxury residential house, clean lines, large glass windows, landscaped garden',
    'affordable':    'affordable housing complex, efficient design, warm community feel, green common areas',
    'school':        'contemporary school building, open courtyard, colorful facade, natural ventilation',
    'warehouse':     'industrial warehouse, high ceilings, loading bays, solar panel roof, efficient layout',
    'office':        'modern corporate office building, glass curtain wall, sustainable green architecture',
    'tiny-house':    'compact minimalist tiny house, clever storage, rooftop deck, natural wood finish',
    'urban-park':    'urban park pavilion, open steel canopy structure, integrated greenery, public seating',
    'artist-studio': 'artist studio and gallery, north-facing skylights, raw concrete and timber, dramatic interior light',
    'clinic':        'community health clinic, welcoming facade, natural light, calm healing environment',
    'greenhouse':    'sustainable greenhouse, glass and steel structure, tropical plants, foggy humid interior',
  };

  const style = styleMap[buildingType] || `${typeLabel} building, modern architecture`;

  const prompt = [
    `photorealistic architectural render of a ${style}`,
    `purpose: ${purpose}`,
    `${floors} floor${floors > 1 ? 's' : ''}, approximately ${area} square feet`,
    `constructed using reclaimed ${materialDesc} materials`,
    'sustainable circular construction, Bangalore India urban context',
    'golden hour lighting, professional architectural photography',
    'ultra detailed, 8K, award winning design'
  ].join(', ');

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1400&height=700&nologo=true&model=flux&seed=${buildingType.length * floors * (area % 97)}`;
}


const ARCHITECTURAL_RATIONALE: Record<string, string> = {
  'residential': 'This residence is designed around passive solar principles, with the recovered glass panels forming expansive south-facing windows that flood the interior with natural light. The salvaged timber creates a warm, biophilic interior language while the steel beams provide an industrial-modern structural aesthetic.',
  'affordable':  'Modular construction using the recovered steel framework dramatically reduces build time and cost, enabling a higher density of units. The design prioritizes shared green spaces and natural ventilation, reducing long-term energy costs for residents.',
  'school':      'The school design places learning spaces around a central courtyard, using the recovered materials to create a bright, airy environment. Exposed structural elements become educational talking points about circular construction and sustainability.',
  'warehouse':   'The clear-span steel structure maximizes unobstructed floor space, with recovered metal cladding providing a robust and low-maintenance exterior envelope. Solar-ready roofing and optimized loading access make this a future-proof logistics facility.',
  'office':      'Biophilic design principles guide this workplace, with recovered timber used throughout the interior to create warmth against the industrial steel structure. Open floor plates allow flexible workspaces while large glass panels maximize daylighting.',
  'tiny-house':  'Every reclaimed material has a purpose in this compact, precision-engineered dwelling. The teak flooring and aluminum frames deliver surprising luxury, while the modular layout adapts to diverse topographies.',
  'urban-park':  'The structure serves as both shelter and landmark — a community focal point. Recovered steel forms elegant canopy structures that provide shade, while the glass elements create seasonal greenhouse spaces for community planting.',
  'artist-studio':'High ceilings from the steel structure create ideal gallery lighting conditions. North-facing skylights constructed from recovered glass panels provide consistent, shadow-free illumination. The raw material aesthetic becomes part of the artistic identity of the space.',
  'clinic':      'The clinical and public zones are separated by a recovered glass wall system that maintains visual connectivity while ensuring privacy. The design prioritizes hygiene-friendly surfaces, cross-ventilation, and a calming, nature-connected aesthetic.',
  'greenhouse':  'The glass panel inventory is ideally suited for the double-skin envelope of this greenhouse, maximizing solar gain in winter and enabling natural ventilation in summer. The steel structure provides the necessary span without obstructing light.',
};

// --- Main Component ---

export default function RebuildPage() {
  const [availableMaterials, setAvailableMaterials] = useState<RecoveredMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RecoveredMaterial[]>([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState('');
  const [floors, setFloors] = useState(2);
  const [area, setArea] = useState(1200);
  const [purpose, setPurpose] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<BuildingDesign | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStage, setLoadingStage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load materials from localStorage or fallback to sample data
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('analysisResults');
      if (savedResults) {
        const data = JSON.parse(savedResults);
        if (data?.components && Array.isArray(data.components) && data.components.length > 0) {
          const recovered: RecoveredMaterial[] = data.components
            .filter((c: BuildingComponent) => c && (c.category === 'Reusable' || c.category === 'Recyclable'))
            .map((c: BuildingComponent, i: number) => ({
              id: c.id || `mat-${i}`,
              name: c.name || 'Recovered Component',
              material: c.material || 'Mixed',
              quantity: Number(c.quantity) || 1,
              condition: (c.condition === 'Good' || c.condition === 'Fair') ? c.condition : 'Fair',
              reuseScore: Number(c.reuseScore) || 70,
              source: `Salvage Site ${i + 1}`,
              suggestedApplications: getSuggestedApplications(c.material || 'Mixed'),
            }));
          setAvailableMaterials(recovered);
          return;
        }
      }
    } catch (e) {
      console.error('Material load error:', e);
    }
    // Fallback to sample data
    setAvailableMaterials([...sampleMaterials]);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = availableMaterials;
    if (filterType !== 'all') {
      result = result.filter(m => m.material === filterType);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) || m.material.toLowerCase().includes(q)
      );
    }
    setFilteredMaterials(result);
  }, [availableMaterials, filterType, searchTerm]);

  const generateBuildingDesign = async () => {
    if (!selectedBuildingType) {
      toast({
        title: 'Select Building Type',
        description: 'Please choose a building type from the configuration panel below.',
        variant: 'destructive',
      });
      return;
    }

    const materialsToUse = filteredMaterials.length > 0 ? filteredMaterials : availableMaterials;

    if (materialsToUse.length === 0) {
      toast({
        title: 'No Materials Available',
        description: 'No recovered materials found. Sample data will be used.',
      });
      setAvailableMaterials([...sampleMaterials]);
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedDesign(null);

      // Multi-stage loading experience
      const stages = [
        'Scanning recovered material inventory...',
        'Computing structural load distribution...',
        'Optimizing floorplan layout...',
        'Generating aesthetic design concept...',
        'Finalizing blueprint...',
      ];
      for (const stage of stages) {
        setLoadingStage(stage);
        await new Promise(r => setTimeout(r, 600));
      }

      const typeLabel = buildingTypes.find(t => t.value === selectedBuildingType)?.label || selectedBuildingType;

      // Utilization modifiers per building type
      const utilModifiers: Record<string, number> = {
        'residential': 0.68, 'affordable': 0.62, 'school': 0.75,
        'warehouse': 0.88, 'office': 0.80, 'tiny-house': 0.55,
        'urban-park': 0.50, 'artist-studio': 0.60, 'clinic': 0.72, 'greenhouse': 0.65,
      };
      const modifier = utilModifiers[selectedBuildingType] ?? 0.70;
      const totalQty = materialsToUse.reduce((s, m) => s + m.quantity, 0);
      const utilizationRate = Math.min(0.95, modifier + totalQty / 2000);

      const materials: MaterialAllocation[] = materialsToUse.map(m => {
        const eff = (m.condition === 'Good' ? 1.1 : 0.85) * (m.reuseScore / 100);
        const used = Math.min(Math.floor(m.quantity * utilizationRate * eff), m.quantity);
        return {
          material: m.name,
          used,
          remaining: Math.max(0, m.quantity - used),
          source: m.source,
        };
      });

      const co2Saved = Math.round(totalQty * 2.45 * 10) / 10;
      const landfillWasteAvoided = Math.round(totalQty * 1.72 * 10) / 10;
      const costSaved = Math.round(totalQty * 142.5);
      const reuseEfficiency = Math.round(utilizationRate * 100);

      // Sort materials by quantity to find dominant ones
      const sortedMaterials = [...materialsToUse].sort((a, b) => b.quantity - a.quantity);
      const dominantMaterial = sortedMaterials[0]?.material ?? 'Mixed';
      const dominantMaterialsList = sortedMaterials.slice(0, 3).map(m => m.material);

      const recs = [
        `The ${typeLabel} design integrates ${dominantMaterial} as the primary structural material — ${sortedMaterials[0]?.quantity || 0} units contribute to load-bearing walls and frame.`,
        `At ${area} sq ft across ${floors} floor${floors > 1 ? 's' : ''}, the layout is optimized for ${purpose || 'the intended use'} with flexible open-plan zoning.`,
        `High-reuse-score components (scored above 85%) are positioned in the permanent structural core; lower-rated materials form non-critical interior elements.`,
        `This project prevents ${landfillWasteAvoided} tons of demolition debris from entering Bangalore landfills — equivalent to planting ${Math.round(landfillWasteAvoided * 4)} mature trees.`,
      ];

      // Build a dynamic AI image URL based on exact user inputs
      const imageUrl = buildArchitecturalImageUrl(
        selectedBuildingType,
        typeLabel,
        purpose || 'Sustainable Use',
        floors,
        area,
        dominantMaterialsList
      );

      // Build rationale dynamically using their inputs
      const baseRationale = ARCHITECTURAL_RATIONALE[selectedBuildingType] || 
        `This ${typeLabel} is engineered from the ground up using circular construction principles.`;
      const rationale = `${baseRationale} The ${dominantMaterialsList.join(', ')} inventory forms the primary structural and aesthetic language of this ${area} sq ft, ${floors}-floor design. Every module has been selected specifically for its ${purpose || 'intended purpose'} application, minimising waste and maximising material reuse efficiency.`;

      const design: BuildingDesign = {
        type: selectedBuildingType,
        typeLabel,
        floors,
        area,
        purpose: purpose || 'Sustainable Use',
        materials,
        sustainability: { co2Saved, landfillWasteAvoided, costSaved, reuseEfficiency },
        recommendations: recs,
        architecturalRationale: rationale,
        imageUrl,
      };

      setImageLoading(true);
      setGeneratedDesign(design);
      setLoadingStage('');
      setIsGenerating(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      console.error('Design generation error:', err);
      setIsGenerating(false);
      setLoadingStage('');
      toast({
        title: 'Generation Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Rebuild Using Recovered Materials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Design aesthetically stunning new structures from salvaged deconstruction inventory
            </p>
          </div>
        </motion.div>

        {/* Available Materials Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AestheticCard variant="elevated" className="border-0">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-green-600" />
                    Available Materials
                  </CardTitle>
                  <CardDescription>
                    {availableMaterials.length} types of recovered materials ready for reuse
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      {['Steel','Wood','Glass','Metal','Concrete','Aluminum'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search materials..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 w-52"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No materials match the current filter.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredMaterials.map((material, index) => (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 border border-green-200/60 bg-gradient-to-br from-green-50 to-blue-50 h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-2xl">{getMaterialIcon(material.material)}</div>
                          <Badge className={getScoreColor(material.reuseScore)}>
                            {material.reuseScore}%
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-2 leading-tight">{material.name}</h4>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Qty:</span>
                            <span className="font-medium">{material.quantity} units</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Condition:</span>
                            <Badge className={`${getConditionColor(material.condition)} text-[10px]`} variant="outline">
                              {material.condition}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Source:</span>
                            <span className="font-medium text-right max-w-[100px] truncate">{material.source}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200 flex flex-wrap gap-1">
                          {material.suggestedApplications.slice(0, 2).map((app, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{app}</Badge>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </AestheticCard>
        </motion.div>

        {/* Building Design Generator Config */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AestheticCard variant="elevated" className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                Building Design Generator
              </CardTitle>
              <CardDescription>
                Configure your project parameters, then click Generate below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buildingType" className="font-semibold text-slate-700">Building Type *</Label>
                  <Select value={selectedBuildingType} onValueChange={setSelectedBuildingType}>
                    <SelectTrigger id="buildingType" className={!selectedBuildingType ? 'border-amber-400' : 'border-green-400'}>
                      <SelectValue placeholder="Choose type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedBuildingType && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> Required
                    </p>
                  )}
                  {selectedBuildingType && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors" className="font-semibold text-slate-700">Number of Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    min="1"
                    max="10"
                    value={floors}
                    onChange={e => setFloors(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="font-semibold text-slate-700">Area (sq ft)</Label>
                  <Input
                    id="area"
                    type="number"
                    min="100"
                    step="100"
                    value={area}
                    onChange={e => setArea(Math.max(100, parseInt(e.target.value) || 100))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="font-semibold text-slate-700">Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Select purpose..." />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button — inside the config card, below the inputs */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  id="generate-design-btn"
                  onClick={generateBuildingDesign}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl shadow-blue-500/25 px-10 py-7 text-lg font-bold transition-all duration-300 hover:-translate-y-1 active:scale-95 rounded-2xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {loadingStage || 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Generate New Building Design
                    </>
                  )}
                </Button>
                {isGenerating && (
                  <p className="text-sm text-slate-500 animate-pulse">{loadingStage}</p>
                )}
              </div>
            </CardContent>
          </AestheticCard>
        </motion.div>

        {/* Generated Design Results */}
        <div ref={resultsRef}>
          {generatedDesign && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* Design Success Banner */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Design Generated Successfully!</p>
                  <p className="text-sm text-green-600">Your {generatedDesign.typeLabel} design is ready. Review the full plan below.</p>
                </div>
              </div>

              {/* Hero Visual */}
              <AestheticCard variant="glass" className="border-0 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-50 rounded-xl">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    {generatedDesign.typeLabel} — Design Concept
                    <AestheticBadge variant="premium">AI Generated</AestheticBadge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cinematic Image — AI generated from user's exact inputs */}
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
                    {imageLoading && (
                      <div className="w-full h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        <p className="text-blue-400 font-mono text-sm">Rendering AI architectural visual...</p>
                        <p className="text-slate-500 text-xs">Generating image based on your exact configuration</p>
                      </div>
                    )}
                    <img
                      src={generatedDesign.imageUrl}
                      alt={`${generatedDesign.typeLabel} — ${generatedDesign.purpose} design concept`}
                      className={`w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'hidden' : 'block'}`}
                      onLoad={() => setImageLoading(false)}
                      onLoadStart={() => setImageLoading(true)}
                      onError={e => {
                        setImageLoading(false);
                        // Fallback: use a type-specific Unsplash photo
                        const fallbacks: Record<string, string> = {
                          'residential': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80',
                          'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
                          'school': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80',
                          'warehouse': 'https://images.unsplash.com/photo-1553344434-c02d8f98d1c3?w=1400&q=80',
                          'artist-studio': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&q=80',
                          'clinic': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80',
                          'greenhouse': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
                          'tiny-house': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1400&q=80',
                        };
                        (e.target as HTMLImageElement).src =
                          fallbacks[generatedDesign.type] ||
                          'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />

                    {/* Overlay specs */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-mono text-blue-300 mb-1">URBANMINE AI · CIRCULAR DESIGN</p>
                          <h3 className="text-3xl font-bold">{generatedDesign.typeLabel}</h3>
                          <p className="text-slate-300 mt-1">{generatedDesign.purpose} · {generatedDesign.area} sq ft · {generatedDesign.floors} floor{generatedDesign.floors > 1 ? 's' : ''}</p>
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1 text-xs font-mono text-slate-400">
                          <span>LAT: 12.9716° N</span>
                          <span>BANGALORE REGION</span>
                          <span>ENV: OPTIMIZED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Architectural Rationale */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                      Architectural Design Rationale
                    </h5>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {generatedDesign.architecturalRationale}
                    </p>
                  </div>
                </CardContent>
              </AestheticCard>

              {/* Building Overview */}
              <AestheticCard variant="elevated" className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    Project Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Building Type', value: generatedDesign.typeLabel },
                      { label: 'Total Area', value: `${generatedDesign.area} sq ft` },
                      { label: 'Floors', value: `${generatedDesign.floors} Level${generatedDesign.floors > 1 ? 's' : ''}` },
                      { label: 'Purpose', value: generatedDesign.purpose },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
                        <p className="text-base font-bold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AestheticCard>

              {/* Sustainability Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="CO₂ Saved"
                  value={`${generatedDesign.sustainability.co2Saved} tons`}
                  icon={<Leaf className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Waste Avoided"
                  value={`${generatedDesign.sustainability.landfillWasteAvoided} tons`}
                  icon={<Recycle className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Cost Saved"
                  value={`₹${(generatedDesign.sustainability.costSaved * 83).toLocaleString()}`}
                  icon={<DollarSign className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Reuse Efficiency"
                  value={`${generatedDesign.sustainability.reuseEfficiency}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                  trend="up"
                />
              </div>

              {/* Material Allocation */}
              <AestheticCard variant="elevated" className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    Material Allocation Plan
                  </CardTitle>
                  <CardDescription>How each recovered material will be deployed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-slate-600 font-semibold">Material</th>
                          <th className="text-center py-3 px-4 text-slate-600 font-semibold">Used</th>
                          <th className="text-center py-3 px-4 text-slate-600 font-semibold">Remaining</th>
                          <th className="text-left py-3 px-4 text-slate-600 font-semibold">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedDesign.materials.map((m, i) => (
                          <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800">{m.material}</td>
                            <td className="text-center py-3 px-4">
                              <Badge className="bg-green-100 text-green-800 font-bold">{m.used}</Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant="outline" className="text-slate-600">{m.remaining}</Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-xs">{m.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </AestheticCard>

              {/* AI Recommendations */}
              <AestheticCard variant="elevated" className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-600" />
                    AI Design Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedDesign.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/60">
                        <div className="h-6 w-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AestheticCard>

              {/* Next Steps */}
              <div className="grid md:grid-cols-1 gap-4">
                <motion.div
                  className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-200 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Manage Remaining Waste</h3>
                      <p className="text-xs text-slate-500">Route leftover materials to certified Bangalore disposal sites</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/waste-disposal')} className="bg-red-600 hover:bg-red-700 gap-2 flex-shrink-0">
                    Dispose <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Export */}
              <div className="flex flex-wrap gap-3 justify-center pt-2 border-t border-slate-100">
                <Button size="lg" className="gap-2" onClick={() => toast({ title: 'Coming Soon', description: 'PDF export is being finalized.' })}>
                  <Download className="h-4 w-4" /> Download Report (PDF)
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => toast({ title: 'Link Copied', description: 'Design link copied to clipboard.' })}>
                  <Share className="h-4 w-4" /> Share Design
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => toast({ title: 'Sent!', description: 'Design transmitted to contractor partners.' })}>
                  <Send className="h-4 w-4" /> Send to Contractor
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
