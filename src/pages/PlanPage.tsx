import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, Recycle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Remove Bolted Window Panels",
    description: "Carefully unbolt and remove all double-glazed window panels from Floor 2. Use suction cup lifters for safe handling.",
    tool: "Suction Cup Lifter, Socket Wrench Set",
    time: "4 hours",
    destination: "School renovation project — Reuse",
    dotClass: "timeline-dot-emerald",
  },
  {
    title: "Detach Aluminum Door Frames",
    description: "Remove 36 aluminum door frames from interior partitions. Unscrew mounting brackets and label each frame.",
    tool: "Power Drill, Pry Bar",
    time: "3 hours",
    destination: "Secondary Market — Reuse",
    dotClass: "timeline-dot-emerald",
  },
  {
    title: "Remove Gypsum Ceiling Panels",
    description: "Unclip and stack gypsum ceiling panels from Floors 1-4. Separate damaged panels for recycling.",
    tool: "Utility Knife, Stepladder",
    time: "6 hours",
    destination: "Recycling Facility — Recycle",
    dotClass: "timeline-dot-blue",
  },
  {
    title: "Unbolt Structural Steel Beams",
    description: "Unbolt 42x Grade A steel I-beams from the North Wing structure. Requires crane support for safe removal.",
    tool: "Impact Wrench, Mobile Crane",
    time: "8 hours",
    destination: "Warehouse Construction — Direct Reuse",
    dotClass: "timeline-dot-emerald",
  },
  {
    title: "Sort and Catalog Remaining Materials",
    description: "Sort all remaining materials by category: reusable, recyclable, and waste. Tag each item with QR codes for tracking.",
    tool: "QR Scanner, Sorting Bins",
    time: "5 hours",
    destination: "Material Bank Inventory",
    dotClass: "timeline-dot-blue",
  },
];

export default function PlanPage() {
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
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-semibold mb-1">Deconstruction Plan</h1>
            <p className="text-sm text-muted-foreground">No analysis data available for deconstruction planning.</p>
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
            <h3 className="text-xl font-semibold mb-3">No Deconstruction Plan Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Please upload and analyze building components first to generate a detailed deconstruction plan.
            </p>
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Wrench className="h-4 w-4" /> Go to Upload Page
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate deconstruction steps based on analyzed components
  const deconstructionSteps = analysisData.components.map((component, index) => ({
    title: `Remove ${component.name}`,
    description: `Carefully remove ${component.quantity} ${component.name} units from ${component.location}. ${component.reason}`,
    tool: component.material === 'Steel' ? 'Cutting Torch, Wrenches' : 
           component.material === 'Glass' ? 'Suction Cups, Safety Tools' :
           component.material === 'Wood' ? 'Pry Bar, Saw' : 'Standard Tools',
    time: `${Math.max(2, component.quantity / 5)} hours`,
    destination: component.category === 'Reusable' ? 'Material Bank — Reuse' : 
                  component.category === 'Recyclable' ? 'Recycling Facility' : 'Waste Disposal',
    dotClass: component.category === 'Reusable' ? 'timeline-dot-emerald' : 
                component.category === 'Recyclable' ? 'timeline-dot-blue' : 'timeline-dot-red',
  }));
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Deconstruction Plan</h1>
          <p className="text-sm text-muted-foreground">AI-generated 5-step sequence optimized for maximum material recovery.</p>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Steps</p>
            <p className="text-2xl font-semibold font-mono">{deconstructionSteps.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Duration</p>
            <p className="text-2xl font-semibold font-mono">{deconstructionSteps.reduce((total, step) => total + parseInt(step.time), 0)}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Recovery Rate</p>
            <p className="text-2xl font-semibold font-mono text-primary">{Math.round((analysisData.summary.reusable / analysisData.summary.total) * 100)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Circular Score</p>
            <p className="text-2xl font-semibold font-mono text-primary">{analysisData.summary.reusable * 10}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-0">
          {deconstructionSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className="relative pl-8 pb-10 last:pb-0"
            >
              <div className={`timeline-dot ${step.dotClass}`} />
              {i < deconstructionSteps.length - 1 && <div className="timeline-connector" />}
              <div className="glass-card ml-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Step {i + 1}</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> {step.tool}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {step.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {step.destination}</span>
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
           className="p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
         >
           <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
               <Recycle className="h-6 w-6" />
             </div>
             <div>
               <h3 className="font-semibold text-lg">Plan Finalized</h3>
               <p className="text-sm text-muted-foreground">Deconstruction sequence is ready. Discover matches for your high-value materials.</p>
             </div>
           </div>
           <Button onClick={() => navigate('/reuse')} size="lg" className="bg-emerald text-white hover:bg-emerald/90 gap-2 shadow-lg shadow-emerald/20">
             Explore Reuse Opportunities
             <ArrowRight className="h-4 w-4" />
           </Button>
         </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
