import { motion } from "framer-motion";
import { ArrowRight, Play, Trash2, Brain, ClipboardList, Store, Building, Recycle, Leaf, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-building.png";

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as [number, number, number, number] } },
};

const steps = [
  { icon: Building, title: "Upload Building Data", desc: "Import your building manifest or enter components manually." },
  { icon: Brain, title: "AI Material Analysis", desc: "Our AI categorizes every component by reuse potential." },
  { icon: ClipboardList, title: "Deconstruction Plan", desc: "Get a step-by-step plan optimized for material recovery." },
  { icon: Trash2, title: "Waste Disposal", desc: "Route leftover materials to certified disposal sites." },
];

const metrics = [
  { value: "2.4M", label: "Tons of Waste Avoided", icon: Trash2 },
  { value: "890K", label: "Tons CO₂ Reduced", icon: TrendingDown },
  { value: "₹10,000 Cr", label: "Material Value Recovered", icon: Recycle },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Recycle className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">UrbanMine AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
            <a href="#solution" className="hover:text-foreground transition-colors">Solution</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
          </div>
          <Button size="sm" onClick={() => navigate("/upload")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        variants={stagger}
        initial="initial"
        animate="animate"
        className="pt-32 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Leaf className="h-3 w-3" /> Deconstruction GPT for Circular Construction
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
              Turn Buildings into Reusable Material Banks
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              UrbanMine AI uses artificial intelligence to analyze buildings and generate deconstruction plans that maximize material reuse and minimize demolition waste.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/upload")} className="gap-2 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                Initialize Analysis <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="flex justify-center">
            <img src={heroImage} alt="Building being deconstructed into reusable materials" className="w-full max-w-lg" />
          </motion.div>
        </div>
      </motion.section>

      {/* Problem */}
      <section id="problem" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card text-center"
          >
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Construction Demolition Creates Massive Waste</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The construction industry generates over 600 million tons of demolition waste annually. Most of it ends up in landfills — even though up to 80% of building materials can be reused or recycled. Traditional demolition destroys valuable resources and accelerates climate change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-20 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">The Solution</p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">AI-Powered Circular Deconstruction</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              UrbanMine AI analyzes every building component — from steel beams to glass panels — and generates an optimized deconstruction plan that maximizes material recovery, reduces waste, and connects salvaged materials with new construction projects.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Four Steps to Circularity</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="metric-card"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Step {i + 1}</p>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Impact</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Measurable Environmental Impact</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="metric-card text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-4xl font-semibold font-mono mb-2">{m.value}</h3>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Recycle className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">UrbanMine AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 UrbanMine AI. Buildings as Material Banks.</p>
        </div>
      </footer>
    </div>
  );
}
