import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building, Building2, Trash2, AlertTriangle, GraduationCap, Home, Factory, Recycle, Leaf, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";

const opportunities = [
  {
    material: "Steel I-Beams",
    icon: Factory,
    suggestedReuse: "Warehouse & Industrial Construction",
    description: "42 Grade A steel beams in good condition, suitable for structural reuse in new warehouse projects.",
    quantity: "42 units",
    estimatedValue: "₹56,77,200",
    co2Saved: "126 tons",
    tags: ["Structural", "High-Value", "Direct Reuse"],
  },
  {
    material: "Double-Glazed Windows",
    icon: GraduationCap,
    suggestedReuse: "School Renovation Projects",
    description: "120 sealed window panels. 80% in fair-to-good condition for educational facility upgrades.",
    quantity: "120 panels",
    estimatedValue: "₹19,92,000",
    co2Saved: "42 tons",
    tags: ["Glazing", "Refurbishment", "Education"],
  },
  {
    material: "Wooden Doors",
    icon: Home,
    suggestedReuse: "Affordable Housing Projects",
    description: "48 solid wood doors with hinges. Minimal refinishing needed for residential reuse.",
    quantity: "48 units",
    estimatedValue: "₹7,96,800",
    co2Saved: "18 tons",
    tags: ["Interior", "Residential", "Low-Cost"],
  },
  {
    material: "Aluminum Door Frames",
    icon: Building,
    suggestedReuse: "Commercial Office Fit-Outs",
    description: "36 aluminum frames in good condition. Compatible with standard commercial door sizes.",
    quantity: "36 units",
    estimatedValue: "₹11,95,200",
    co2Saved: "32 tons",
    tags: ["Commercial", "Standard Size", "Reusable"],
  },
  {
    material: "Copper Wiring",
    icon: Recycle,
    suggestedReuse: "Electrical Supply Recycling",
    description: "High-purity copper wiring recovered from all floors. Premium material value for recycling markets.",
    quantity: "2,400 meters",
    estimatedValue: "₹14,94,000",
    co2Saved: "48 tons",
    tags: ["High-Value", "Recycling", "Electrical"],
  },
  {
    material: "Concrete Slabs",
    icon: Factory,
    suggestedReuse: "Road Base & Aggregate",
    description: "Crushed concrete can serve as aggregate for road base, parking lots, and foundation fill.",
    quantity: "180 tons",
    estimatedValue: "₹7,01,350",
    co2Saved: "18 tons",
    tags: ["Aggregate", "Infrastructure", "Recycled"],
  },
];

export default function ReusePage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load analysis results from localStorage
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const data = JSON.parse(savedResults);
        setAnalysisData(data);
      } catch (error) {
        console.error('Error parsing analysis results:', error);
      }
    }
    setLoading(false);
  }, []);

  // If no analysis data, show empty state
  if (!analysisData || !analysisData.components || analysisData.components.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-semibold mb-1">Reuse Opportunities</h1>
            <p className="text-sm text-muted-foreground">No analysis data available for reuse recommendations.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="glass-card p-12 text-center"
          >
            <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No Reuse Opportunities Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Please upload and analyze building components first to discover reuse opportunities and environmental benefits.
            </p>
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Recycle className="h-4 w-4" /> Go to Upload Page
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate reuse opportunities based on analyzed components
  const reuseOpportunities = analysisData.components
    .filter(comp => comp.category === 'Reusable' || comp.category === 'Recyclable')
    .map(component => ({
      material: component.name,
      suggestedReuse: component.category === 'Recyclable' 
        ? `Recycling into new ${component.material.toLowerCase()} products`
        : component.material === 'Steel' ? 'Warehouse & Industrial Construction' :
          component.material === 'Glass' ? 'School Renovation Projects' :
          component.material === 'Wood' ? 'Affordable Housing Projects' :
          'General Construction Projects',
      description: component.category === 'Recyclable'
        ? `${component.quantity} units of ${component.name} in fair condition. ${component.reason}`
        : `${component.quantity} units of ${component.name} in good condition. ${component.reason}`,
      quantity: `${component.quantity} units`,
      estimatedValue: `$${component.quantity * (component.category === 'Recyclable' ? 300 : 500)}`,
      co2Saved: `${component.quantity * (component.category === 'Recyclable' ? 1.8 : 2.5)} tons`,
      tags: [component.material, component.category === 'Recyclable' ? 'Recycling' : 'High-Value', component.category === 'Recyclable' ? 'Material Recovery' : 'Direct Reuse']
    }));
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Reuse Opportunities</h1>
          <p className="text-sm text-muted-foreground">AI-matched destinations for recovered building materials.</p>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card flex flex-wrap gap-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Opportunities</p>
            <p className="text-2xl font-semibold font-mono">{reuseOpportunities.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Direct Reuse</p>
            <p className="text-2xl font-semibold font-mono text-emerald-600">{reuseOpportunities.filter(opp => opp.tags.includes('Direct Reuse')).length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Recycling</p>
            <p className="text-2xl font-semibold font-mono text-blue-600">{reuseOpportunities.filter(opp => opp.tags.includes('Recycling')).length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Recovery Value</p>
            <p className="text-2xl font-semibold font-mono">${reuseOpportunities.reduce((total, opp) => total + parseInt(opp.estimatedValue.replace('$', '')), 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">CO₂ Savings</p>
            <p className="text-2xl font-semibold font-mono text-primary">{reuseOpportunities.reduce((total, opp) => total + parseFloat(opp.co2Saved), 0).toFixed(1)}t</p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reuseOpportunities.map((opp, i) => (
            <motion.div
              key={opp.material}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              whileHover={{ y: -2 }}
              className="metric-card flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{opp.quantity}</span>
              </div>
              <h3 className="font-semibold mb-1">{opp.material}</h3>
              <p className="text-xs text-primary font-medium mb-2">{opp.suggestedReuse}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{opp.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {opp.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-muted/50 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Est. Value</p>
                  <p className="font-mono font-semibold">{opp.estimatedValue}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                  <p className="font-mono font-semibold text-primary">{opp.co2Saved}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Suggested Step */}
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="p-6 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
         >
           <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
               <Building2 className="h-6 w-6" />
             </div>
             <div>
               <h3 className="font-semibold text-lg">Inventory Matched</h3>
               <p className="text-sm text-muted-foreground">Reuse opportunities identified. Start designing your new building with these materials.</p>
             </div>
           </div>
           <Button onClick={() => navigate('/rebuild')} size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-500/20">
             Rebuild with Materials
             <ArrowRight className="h-4 w-4" />
           </Button>
         </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            onClick={() => navigate('/plan')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Plan
          </Button>
          <Button 
            onClick={() => navigate('/waste-disposal')}
            variant="ghost"
            size="lg"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Waste Disposal
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
