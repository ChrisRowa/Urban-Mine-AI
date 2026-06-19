import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Upload, 
  FileSpreadsheet, 
  Layout, 
  Settings, 
  CheckCircle,
  Info,
  ArrowRight
} from "lucide-react";

interface QuickStartGuideProps {
  onClose?: () => void;
}

export default function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Choose Your Upload Method",
      description: "Select from three convenient ways to add your building components",
      icon: Upload,
      content: [
        { type: "method", title: "Single Entry", desc: "Add components one by one with detailed forms" },
        { type: "method", title: "Bulk Upload", desc: "Upload multiple components using CSV or JSON files" },
        { type: "method", title: "Templates", desc: "Start with pre-built residential, commercial, or industrial templates" }
      ]
    },
    {
      title: "Configure Your Materials",
      description: "Customize materials, connection types, and scoring to match your needs",
      icon: Settings,
      content: [
        { type: "tip", title: "Add Custom Materials", desc: "Define your own materials with specific values and properties" },
        { type: "tip", title: "Connection Types", desc: "Create custom connection methods with difficulty levels" },
        { type: "tip", title: "Construction Templates", desc: "Build reusable templates for different project types" }
      ]
    },
    {
      title: "Upload Best Practices",
      description: "Tips for efficient and accurate data entry",
      icon: FileSpreadsheet,
      content: [
        { type: "practice", title: "CSV Format", desc: "Use: name,material,connection,condition,quantity,location" },
        { type: "practice", title: "Batch Processing", desc: "Upload 50+ components at once using bulk upload" },
        { type: "practice", title: "Data Validation", desc: "System automatically validates and scores your components" }
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose?.();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {Array.from({ length: steps.length }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <currentStepData.icon className="h-5 w-5 text-primary" />
            {currentStepData.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm">{currentStepData.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentStepData.content.map((item, index) => (
              <Card key={index} className="p-4 border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.type === 'method' && <Upload className="h-4 w-4 text-blue-600" />}
                    {item.type === 'tip' && <Info className="h-4 w-4 text-green-600" />}
                    {item.type === 'practice' && <CheckCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {currentStep === 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Quick CSV Example:</h4>
              <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded block">
                Steel Beam,Steel,Bolted,Good,8,Foundation,6m x 0.3m x 0.3m,15,Main support beam<br/>
                Window Panel,Glass + Aluminum,Bolted,Good,12,Walls,1.2m x 1.5m,8,Double glazed
              </code>
            </div>
          )}

          {currentStep === 1 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Pro Tip:</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Start with default materials and gradually add your custom ones. This ensures compatibility while you learn the system.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 0}
              >
                Previous
              </Button>
            </div>
            
            <div className="flex gap-2">
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  Skip Guide
                </Button>
              )}
              <Button onClick={nextStep} className="gap-2">
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
