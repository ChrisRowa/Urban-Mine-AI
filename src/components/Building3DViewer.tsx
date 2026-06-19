import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial,
  Text,
  Html
} from '@react-three/drei';
import * as THREE from 'three';

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

interface Building3DViewerProps {
  data: {
    components: BuildingComponent[];
  };
}

function BuildingFloor({ position, color, label, score, delay = 0 }: { position: [number, number, number], color: string, label: string, score: number, delay?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Animated scaling and floating
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={active ? 1.1 : 1}
      >
        <boxGeometry args={[4, 0.8, 4]} />
        <MeshDistortMaterial
          color={hovered ? '#60a5fa' : color}
          speed={hovered ? 2 : 0}
          distort={hovered ? 0.3 : 0}
          metalness={0.6}
          roughness={0.2}
          transparent={true}
          opacity={0.85}
        />
      </mesh>
      
      {/* Structural "Skeleton" lines */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4.05, 0.85, 4.05]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>

      {/* Label and Score Html */}
      {(hovered || active) && (
        <Html distanceFactor={10} position={[0, 1, 0]}>
          <div className="bg-slate-900/90 text-white p-3 rounded-xl border border-white/20 backdrop-blur-md shadow-2xl min-w-[120px] pointer-events-none select-none">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">{label}</p>
            <div className="flex justify-between items-center gap-4">
               <span className="text-lg font-bold">{score}%</span>
               <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500" style={{ width: `${score}%` }} />
               </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2">Reusability Index: {score > 70 ? 'Optimal' : score > 40 ? 'Fair' : 'Discard'}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Building3DViewer({ data }: Building3DViewerProps) {
  // Model generation logic (simulated architectural stack)
  const floorData = useMemo(() => {
    const components = data?.components || [];
    if (components.length === 0) {
      return [
        { label: "Foundation", score: 45, color: "#94a3b8", pos: [0, -1, 0] },
        { label: "Structural Frame", score: 82, color: "#10b981", pos: [0, 0, 0] },
        { label: "Facade Systems", score: 65, color: "#3b82f6", pos: [0, 1, 0] },
      ];
    }

    // Group components into realistic building tiers based on material
    const foundationComps = components.filter((c: BuildingComponent) => ['Concrete', 'Wood'].includes(c.material));
    const frameComps = components.filter((c: BuildingComponent) => ['Steel', 'Metal'].includes(c.material));
    const facadeComps = components.filter((c: BuildingComponent) => ['Glass', 'Aluminum'].includes(c.material));

    const getAvgScore = (comps: BuildingComponent[], fallback: number) => {
      if (comps.length === 0) return fallback;
      return Math.round(comps.reduce((sum, c) => sum + (c.reuseScore || 50), 0) / comps.length);
    };

    return [
      { 
        label: "Foundation (Concrete/Wood)", 
        score: getAvgScore(foundationComps, 45), 
        color: "#94a3b8", 
        pos: [0, -1, 0] 
      },
      { 
        label: "Structural Frame (Steel/Metal)", 
        score: getAvgScore(frameComps, 82), 
        color: "#10b981", 
        pos: [0, 0, 0] 
      },
      { 
        label: "Facade Systems (Glass/Alum)", 
        score: getAvgScore(facadeComps, 65), 
        color: "#3b82f6", 
        pos: [0, 1, 0] 
      },
    ];
  }, [data]);

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-950 rounded-3xl overflow-hidden relative group border border-slate-800 shadow-2xl">
      {/* Overlay UI Controls */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h4 className="text-white font-bold text-lg mb-1 tracking-tight">Interactive Heatmap</h4>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
             Live Data Input
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
             V4 Render Engine
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/50 backdrop-blur-md p-3 rounded-xl border border-white/5 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <p className="text-[10px] text-slate-400 leading-tight">
          <strong className="text-white">CONTROLS:</strong> Left Click to Rotate | Right Click to Pan | Scroll to Zoom
        </p>
      </div>

      <Canvas shadows antialias="true">
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={40} />
        <OrbitControls 
          enableDamping={true} 
          dampingFactor={0.05} 
          rotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#fb7185" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />

        {/* Global Blueprint Grid */}
        <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -2, 0]} />

        {/* Building Floors */}
        {floorData.map((floor, i) => (
          <BuildingFloor 
            key={floor.label} 
            position={floor.pos as [number, number, number]} 
            color={floor.color} 
            label={floor.label} 
            score={floor.score}
            delay={i * 0.5}
          />
        ))}

        {/* Cinematic Particles */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
            </mesh>
          ))}
        </Float>
      </Canvas>

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
    </div>
  );
}
