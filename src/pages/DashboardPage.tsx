import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Leaf, TrendingUp, Layers, BarChart3, X, ChevronDown, ChevronUp,
  ZoomIn, ZoomOut, Filter, RefreshCw, Boxes, ArrowRight, Info,
  Recycle, FlameKindling, Zap, Building2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface BuildingComponent {
  id?: string;
  name: string;
  material: string;
  reuseScore?: number;
  category?: string;
  reason?: string;
  quantity?: number;
  condition?: string;
  location?: string;
}

interface AnalysisData {
  summary: {
    total: number;
    reusable: number;
    recyclable: number;
    waste: number;
    salvageValue: number;
    co2Savings: number;
  };
  components: BuildingComponent[];
}

interface HeatmapCell {
  material: string;
  zone: string;
  quantity: number;
  reuseScore: number;
  co2Saving: number;
  valueINR: number;
  category: string;
  components: BuildingComponent[];
  row: number;
  col: number;
}

interface TooltipState {
  cell: HeatmapCell;
  x: number;
  y: number;
}

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const MATERIALS = ["Concrete", "Brick", "Steel", "Wood", "Glass", "Aluminum", "Copper", "Plastic"];
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F"];
const ALL_MATERIALS = "All Materials";
const ALL_ZONES = "All Zones";

// Weight per unit (tons) per material type
const WEIGHT_PER_UNIT: Record<string, number> = {
  Concrete: 2.5, Brick: 1.8, Steel: 1.2, Wood: 0.8,
  Glass: 0.3, Aluminum: 0.4, Copper: 0.5, Plastic: 0.2
};

// CO2 saved per ton of material (tCO2e)
const CO2_PER_TON: Record<string, number> = {
  Concrete: 0.5, Brick: 0.4, Steel: 2.5, Wood: 1.2,
  Glass: 0.8, Aluminum: 1.8, Copper: 3.2, Plastic: 1.4
};

// Market rate per ton in INR
const INR_PER_TON: Record<string, number> = {
  Concrete: 4000, Brick: 6000, Steel: 45000, Wood: 12000,
  Glass: 8000, Aluminum: 120000, Copper: 750000, Plastic: 15000
};

function getHeatColor(score: number): string {
  if (score >= 80) return "#ef4444";    // Very high – red
  if (score >= 60) return "#f59e0b";    // High – amber
  if (score >= 40) return "#10b981";    // Moderate – green
  return "#3b82f6";                     // Low – blue
}

function getHeatOpacity(score: number): number {
  return 0.2 + (score / 100) * 0.75;
}

// ─────────────────────────────────────────────────────────
// Tooltip Component
// ─────────────────────────────────────────────────────────
function HeatmapTooltip({ tooltip, onClose }: { tooltip: TooltipState; onClose: () => void }) {
  const reusePaths: Record<string, string[]> = {
    Concrete: ["Road base aggregate", "Foundation fill", "Block manufacturing"],
    Brick: ["Masonry repair", "Landscaping", "Thermal insulation"],
    Steel: ["Structural beams", "Rebar production", "Framework"],
    Wood: ["Flooring", "Furniture", "Bio-energy"],
    Glass: ["Window units", "Partition walls", "Fiberglass"],
    Aluminum: ["Cladding", "Window frames", "Casting"],
    Copper: ["Electrical wiring", "Plumbing", "Heat exchangers"],
    Plastic: ["Recycled pellets", "Composites", "Packaging"],
  };

  const { cell } = tooltip;
  const paths = reusePaths[cell.material] || ["General recycling"];
  const weightTons = (cell.quantity * (WEIGHT_PER_UNIT[cell.material] || 0.5)).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ duration: 0.18 }}
      className="fixed z-50 w-80 pointer-events-auto"
      style={{ left: Math.min(tooltip.x + 12, window.innerWidth - 340), top: Math.min(tooltip.y - 10, window.innerHeight - 440) }}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getHeatColor(cell.reuseScore) }} />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{cell.zone}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{cell.material}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Metrics */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {[
            { label: "Quantity", value: `${cell.quantity} units` },
            { label: "Weight", value: `${weightTons} tons` },
            { label: "Reusability", value: `${cell.reuseScore}%` },
            { label: "CO₂ Saved", value: `${cell.co2Saving.toFixed(1)} t` },
            { label: "Est. Value", value: `₹${cell.valueINR.toLocaleString("en-IN")}`, span: true },
          ].map(m => (
            <div key={m.label} className={`bg-slate-800/60 rounded-xl p-3 ${(m as any).span ? "col-span-2" : ""}`}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{m.label}</p>
              <p className="text-base font-bold text-white font-mono">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Recovery Paths */}
        <div className="px-5 pb-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Suggested Reuse Pathways</p>
          <div className="flex flex-wrap gap-1.5">
            {paths.map(p => (
              <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">{p}</span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Recovery Potential</span>
            <span>{cell.reuseScore}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cell.reuseScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: getHeatColor(cell.reuseScore) }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(ALL_MATERIALS);
  const [selectedZone, setSelectedZone] = useState(ALL_ZONES);
  const [minScore, setMinScore] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("analysisResults");
    if (saved) {
      try { setAnalysisData(JSON.parse(saved)); } catch (_) { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // ── Build heatmap cells from actual data ──────────────
  const heatmapCells = useMemo<HeatmapCell[]>(() => {
    const comps = analysisData?.components || [];

    if (comps.length === 0) {
      // Demo cells when no data uploaded
      return MATERIALS.flatMap((mat, mi) =>
        ZONES.map((zone, zi) => {
          const baseScore = Math.min(95, 30 + ((mi * 13 + zi * 7) % 60));
          const qty = 10 + ((mi * 17 + zi * 11) % 80);
          const weight = qty * (WEIGHT_PER_UNIT[mat] || 0.5);
          return {
            material: mat, zone, quantity: qty, reuseScore: baseScore,
            co2Saving: parseFloat((weight * (CO2_PER_TON[mat] || 1)).toFixed(2)),
            valueINR: Math.round(weight * (INR_PER_TON[mat] || 5000) * (baseScore / 100)),
            category: baseScore > 70 ? "Reusable" : baseScore > 40 ? "Recyclable" : "Waste",
            components: [], row: zi, col: mi,
          };
        })
      );
    }

    // Group by material × zone (location as proxy for zone)
    const grouped: Record<string, BuildingComponent[]> = {};
    comps.forEach(c => {
      const mat = MATERIALS.includes(c.material) ? c.material : "Concrete";
      const loc = c.location || "";
      const zoneKey = ZONES.find(z => loc.toLowerCase().includes(z.toLowerCase().replace(" ", "")))
        || ZONES[Math.abs(loc.charCodeAt(0) || 0) % ZONES.length]
        || ZONES[0];
      const key = `${mat}||${zoneKey}`;
      grouped[key] = grouped[key] || [];
      grouped[key].push(c);
    });

    return MATERIALS.flatMap((mat, mi) =>
      ZONES.map((zone, zi) => {
        const key = `${mat}||${zone}`;
        const group = grouped[key] || [];
        const qty = group.reduce((s, c) => s + (c.quantity || 1), 0);
        const avgScore = group.length > 0
          ? Math.round(group.reduce((s, c) => s + (c.reuseScore || 50), 0) / group.length)
          : 0;
        const weight = qty * (WEIGHT_PER_UNIT[mat] || 0.5);
        const domCat = group.filter(c => c.category === "Reusable").length >= group.filter(c => c.category === "Recyclable").length
          ? "Reusable" : "Recyclable";

        return {
          material: mat, zone, quantity: qty, reuseScore: avgScore,
          co2Saving: parseFloat((weight * (CO2_PER_TON[mat] || 1)).toFixed(2)),
          valueINR: Math.round(weight * (INR_PER_TON[mat] || 5000) * (avgScore / 100)),
          category: qty === 0 ? "Empty" : domCat,
          components: group, row: zi, col: mi,
        };
      })
    );
  }, [analysisData]);

  // ── Aggregate summary metrics from cells ──────────────
  const summary = useMemo(() => {
    const activeCells = heatmapCells.filter(c => c.quantity > 0);
    const totalQty = activeCells.reduce((s, c) => s + c.quantity, 0);
    const totalCO2 = activeCells.reduce((s, c) => s + c.co2Saving, 0);
    const totalValue = activeCells.reduce((s, c) => s + c.valueINR, 0);
    const avgScore = activeCells.length > 0
      ? Math.round(activeCells.reduce((s, c) => s + c.reuseScore, 0) / activeCells.length) : 0;
    const reusable = activeCells.filter(c => c.reuseScore >= 60).reduce((s, c) => s + c.quantity, 0);
    return { totalQty, totalCO2, totalValue, avgScore, reusable, activeCells: activeCells.length };
  }, [heatmapCells]);

  // ── Top Materials chart data ────────────────────────────
  const topMaterials = useMemo(() => {
    const byMat: Record<string, { qty: number; score: number; value: number; count: number }> = {};
    heatmapCells.forEach(c => {
      if (c.quantity === 0) return;
      byMat[c.material] = byMat[c.material] || { qty: 0, score: 0, value: 0, count: 0 };
      byMat[c.material].qty += c.quantity;
      byMat[c.material].score += c.reuseScore;
      byMat[c.material].value += c.valueINR;
      byMat[c.material].count++;
    });
    return Object.entries(byMat)
      .map(([mat, d]) => ({ name: mat, qty: d.qty, score: Math.round(d.score / d.count), value: d.value }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [heatmapCells]);

  // ── Filtered cells ────────────────────────────────────
  const visibleCells = useMemo(() =>
    heatmapCells.filter(c =>
      (selectedMaterial === ALL_MATERIALS || c.material === selectedMaterial) &&
      (selectedZone === ALL_ZONES || c.zone === selectedZone) &&
      c.reuseScore >= minScore
    ), [heatmapCells, selectedMaterial, selectedZone, minScore]);

  // ── Heatmap interaction handlers ──────────────────────
  const handleCellMouseEnter = useCallback((e: React.MouseEvent, cell: HeatmapCell) => {
    if (cell.quantity === 0) return;
    setTooltip({ cell, x: e.clientX, y: e.clientY });
  }, []);

  const handleCellMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest("[data-heatcell]")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const stopPan = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2.5, Math.max(0.6, z - e.deltaY * 0.001)));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    </DashboardLayout>
  );

  const isDemo = !analysisData || (analysisData.components || []).length === 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* ── Page Header (non-sticky, inside scroll) ─── */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-5">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              {isDemo && (
                <span className="inline-block text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  ⚠ Demo Mode – Upload building data to see real values
                </span>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-white">Material Recovery Dashboard</h1>
              <p className="text-base text-slate-300 mt-1">Interactive heatmap — hover any cell for full material breakdown</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" onClick={() => navigate("/upload")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5">
                <Boxes className="h-3.5 w-3.5" />
                {isDemo ? "Upload Data" : "New Analysis"}
              </Button>
            </div>
          </div>

          {/* ── Filter Bar ─────────────────────────── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="max-w-screen-2xl mx-auto pt-4 flex flex-wrap gap-3 items-end">
                  {/* Material Filter */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider block mb-2">Material</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[ALL_MATERIALS, ...MATERIALS].map(m => (
                        <button key={m}
                          onClick={() => setSelectedMaterial(m)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${selectedMaterial === m
                            ? "bg-emerald-500/30 border-emerald-400/50 text-emerald-300"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zone Filter */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider block mb-2">Zone</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[ALL_ZONES, ...ZONES].map(z => (
                        <button key={z}
                          onClick={() => setSelectedZone(z)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${selectedZone === z
                            ? "bg-blue-500/30 border-blue-400/50 text-blue-300"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"}`}>
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min Score */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider block mb-2">Min Reuse Score: {minScore}%</label>
                    <input type="range" min={0} max={90} step={10} value={minScore}
                      onChange={e => setMinScore(Number(e.target.value))}
                      className="w-40 accent-emerald-500" />
                  </div>

                  <button onClick={() => { setSelectedMaterial(ALL_MATERIALS); setSelectedZone(ALL_ZONES); setMinScore(0); }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors pb-0.5 font-medium">
                    <RefreshCw className="h-3 w-3" /> Reset all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
          {/* ── Metric Cards ─────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Recoverable",
                value: `${summary.totalQty.toLocaleString("en-IN")} units`,
                sub: `${summary.reusable.toLocaleString("en-IN")} high-potential`,
                icon: <Layers className="h-4 w-4" />, color: "emerald"
              },
              {
                label: "Carbon Saved",
                value: `${summary.totalCO2.toFixed(1)} t`,
                sub: "tCO₂e prevented",
                icon: <Leaf className="h-4 w-4" />, color: "green"
              },
              {
                label: "Estimated Value",
                value: `₹${(summary.totalValue / 100000).toFixed(1)}L`,
                sub: summary.totalValue > 0 ? `₹${summary.totalValue.toLocaleString("en-IN")}` : "—",
                icon: <TrendingUp className="h-4 w-4" />, color: "amber"
              },
              {
                label: "Circularity Score",
                value: `${summary.avgScore}%`,
                sub: summary.avgScore > 70 ? "Excellent" : summary.avgScore > 40 ? "Moderate" : "Low",
                icon: <Recycle className="h-4 w-4" />, color: "blue"
              },
            ].map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-slate-800 border border-slate-600 rounded-2xl p-5 hover:border-slate-500 hover:bg-slate-750 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm text-slate-200 font-semibold uppercase tracking-wide">{m.label}</span>
                  <span className="p-2 rounded-lg bg-slate-700 text-slate-200">{m.icon}</span>
                </div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">{m.value}</div>
                <div className="text-sm text-slate-400 mt-1.5">{m.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* ── Main Heatmap ─────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden">
            {/* Heatmap Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FlameKindling className="h-5 w-5 text-amber-400" />
                  Material Recovery Heatmap
                  {isDemo && <span className="text-sm font-normal text-amber-400/70 ml-1">— Demo Data</span>}
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  {visibleCells.filter(c => c.quantity > 0).length} active material zones · Hover to inspect · Click to filter
                </p>
              </div>
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                {/* Legend */}
                <div className="hidden md:flex items-center gap-3 mr-4">
                  {[
                    { label: "Low", color: "#3b82f6" },
                    { label: "Moderate", color: "#10b981" },
                    { label: "High", color: "#f59e0b" },
                    { label: "Very High", color: "#ef4444" },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                      <span className="text-[10px] text-slate-400">{l.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                  className="h-8 w-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <ZoomIn className="h-3.5 w-3.5 text-slate-300" />
                </button>
                <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                  className="h-8 w-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <ZoomOut className="h-3.5 w-3.5 text-slate-300" />
                </button>
                <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="h-8 w-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Heatmap Canvas */}
            <div
              ref={heatmapRef}
              className="relative overflow-hidden select-none"
              style={{ height: 460, cursor: isPanning ? "grabbing" : "grab", background: "radial-gradient(ellipse at 50% 50%, #0f1a2e 0%, #0a0f1a 100%)" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopPan}
              onMouseLeave={stopPan}
              onWheel={handleWheel}
            >
              {/* Grid */}
              <div style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.1s ease",
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div>
                  {/* Column headers (Materials) */}
                  <div className="flex ml-20 mb-2">
                    {MATERIALS.map(mat => (
                      <div key={mat} className="flex-1 min-w-[90px] max-w-[110px] text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedMaterial === mat ? "text-emerald-400" : "text-slate-500"}`}>
                          {mat}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rows (Zones) */}
                  {ZONES.map((zone, zi) => (
                    <div key={zone} className="flex items-center mb-2">
                      {/* Row label */}
                      <div className={`w-20 shrink-0 text-right pr-3 text-[10px] font-bold uppercase tracking-wider ${selectedZone === zone ? "text-blue-400" : "text-slate-500"}`}>
                        {zone}
                      </div>

                      {/* Cells */}
                      {MATERIALS.map((mat, mi) => {
                        const cell = visibleCells.find(c => c.material === mat && c.zone === zone);
                        const isFiltered = !cell;
                        const score = cell?.reuseScore ?? 0;
                        const hasData = !!cell && cell.quantity > 0;

                        return (
                          <motion.div
                            key={`${zone}-${mat}`}
                            data-heatcell="true"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (zi * MATERIALS.length + mi) * 0.008, duration: 0.3 }}
                            className="flex-1 min-w-[90px] max-w-[110px] h-[56px] rounded-lg mx-0.5 relative group cursor-pointer transition-all duration-200"
                            style={{
                              backgroundColor: isFiltered || !hasData
                                ? "rgba(255,255,255,0.03)"
                                : `${getHeatColor(score)}`,
                              opacity: isFiltered ? 0.2 : getHeatOpacity(score),
                              border: `1px solid ${isFiltered || !hasData ? "rgba(255,255,255,0.05)" : `${getHeatColor(score)}50`}`,
                            }}
                            whileHover={hasData && !isFiltered ? { scale: 1.06, opacity: 1, zIndex: 10 } : {}}
                            onMouseEnter={e => cell && handleCellMouseEnter(e, cell)}
                            onMouseMove={handleCellMouseMove}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => {
                              if (cell && cell.quantity > 0) {
                                setSelectedMaterial(cell.material);
                                setSelectedZone(cell.zone);
                                setShowFilters(true);
                              }
                            }}
                          >
                            {hasData && !isFiltered && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-white font-bold text-sm drop-shadow-lg">{score}%</span>
                                <span className="text-white/70 text-[9px] drop-shadow">{cell!.quantity}u</span>
                              </div>
                            )}
                            {/* Glow on hover */}
                            {hasData && !isFiltered && (
                              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ boxShadow: `0 0 20px ${getHeatColor(score)}60` }} />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty state overlay */}
              {visibleCells.filter(c => c.quantity > 0).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Info className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No cells match current filters</p>
                  </div>
                </div>
              )}

              {/* Controls hint */}
              <div className="absolute bottom-3 right-4 text-[9px] text-slate-600 font-mono pointer-events-none">
                Scroll to zoom · Drag to pan · Click cell to filter
              </div>
            </div>
          </motion.div>

          {/* ── Bottom Row: Charts ─────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Materials Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="lg:col-span-2 bg-slate-800 border border-slate-600 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Top Recoverable Materials
              </h3>
              <p className="text-sm text-slate-300 mb-5">Reusability score by material type</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topMaterials} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Reuse Score"]}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {topMaterials.map((m, i) => (
                      <Cell key={i} fill={getHeatColor(m.score)} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Environmental & Financial Panel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Impact Summary
              </h3>

              {[
                { label: "Reuse Efficiency", value: `${summary.avgScore}%`, bar: summary.avgScore, color: "#10b981" },
                {
                  label: "Carbon Avoidance",
                  value: `${summary.totalCO2.toFixed(1)} tCO₂e`,
                  bar: Math.min(100, summary.totalCO2 / 2),
                  color: "#3b82f6"
                },
                {
                  label: "High-Value Recovery",
                  value: `${summary.reusable} units`,
                  bar: summary.totalQty > 0 ? Math.round((summary.reusable / summary.totalQty) * 100) : 0,
                  color: "#f59e0b"
                },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="text-white font-mono font-bold">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, item.bar)}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-auto pt-4 border-t border-white/8">
                <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Estimated INR Value</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    ₹{summary.totalValue > 0 ? summary.totalValue.toLocaleString("en-IN") : "—"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Based on actual material weights & market rates</p>
                </div>
              </div>

              <Button onClick={() => navigate("/analytics")} variant="outline"
                className="w-full bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-700 gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5" />
                Full Sustainability Report
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </motion.div>
          </div>

          {/* ── CTA if demo mode ────────────────────── */}
          {isDemo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-amber-400 font-bold text-sm mb-1">You are viewing demo data</p>
                <p className="text-slate-400 text-xs max-w-lg">
                  Upload your building manifest or component inventory to populate this dashboard with real material recovery data.
                  All metrics, scores, and values will update automatically.
                </p>
              </div>
              <Button onClick={() => navigate("/upload")} className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 shrink-0">
                <Boxes className="h-4 w-4" /> Upload Building Data
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Global Tooltip ────────────────────────── */}
      <AnimatePresence>
        {tooltip && <HeatmapTooltip tooltip={tooltip} onClose={() => setTooltip(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
