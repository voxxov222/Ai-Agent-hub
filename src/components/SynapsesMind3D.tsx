import React, { useRef, useEffect, useState } from 'react';
import { Activity, Zap, Sparkles, Maximize2, Minimize2, Eye, RefreshCw, Cpu } from 'lucide-react';

interface SynapsesMind3DProps {
  isThinking?: boolean;
  isMicListening?: boolean;
  isSpeakingText?: boolean;
  compact?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  energy: number;
  clusterId: number;
}

interface SynapsePulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  color: string;
}

export const SynapsesMind3D: React.FC<SynapsesMind3DProps> = ({
  isThinking = false,
  isMicListening = false,
  isSpeakingText = false,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorMode, setColorMode] = useState<'indigo' | 'emerald' | 'amber' | 'cyan'>('indigo');
  const [pulseCount, setPulseCount] = useState<number>(100000000); // 100M simulated synapses
  const [activeFires, setActiveFires] = useState<number>(342890);

  // Mouse rotation state
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0.2, y: 0.5 });
  const zoom = useRef(350);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 600);
    let height = (canvas.height = containerRef.current?.clientHeight || 400);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate 3D Neural Nodes & Synaptic Clusters
    const numParticles = compact ? 180 : 320;
    const particles: Particle3D[] = [];
    const clusters = 5;

    // Colors palette
    const getColors = () => {
      if (isThinking) return ['#f59e0b', '#fbbf24', '#d97706', '#ef4444'];
      if (isMicListening) return ['#10b981', '#34d399', '#059669', '#06b6d4'];
      if (isSpeakingText) return ['#ec4899', '#f472b6', '#a855f7', '#6366f1'];
      if (colorMode === 'emerald') return ['#10b981', '#34d399', '#6ee7b7', '#047857'];
      if (colorMode === 'amber') return ['#f59e0b', '#fbbf24', '#fcd34d', '#b45309'];
      if (colorMode === 'cyan') return ['#06b6d4', '#38bdf8', '#7dd3fc', '#0284c7'];
      return ['#818cf8', '#6366f1', '#a855f7', '#38bdf8', '#c084fc'];
    };

    const palette = getColors();

    for (let i = 0; i < numParticles; i++) {
      const clusterId = i % clusters;
      // Spherical distribution around cluster center
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 180;

      const clusterOffsetX = (clusterId - 2) * 80;
      const clusterOffsetY = Math.sin(clusterId) * 60;
      const clusterOffsetZ = Math.cos(clusterId) * 80;

      const x = r * Math.sin(phi) * Math.cos(theta) + clusterOffsetX;
      const y = r * Math.sin(phi) * Math.sin(theta) + clusterOffsetY;
      const z = r * Math.cos(phi) + clusterOffsetZ;

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        color: palette[Math.floor(Math.random() * palette.length)],
        energy: Math.random(),
        clusterId
      });
    }

    // Precalculate synaptic connections between nearby nodes
    const synapses: { a: number; b: number; dist: number }[] = [];
    const maxDist = compact ? 65 : 85;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          synapses.push({ a: i, b: j, dist });
        }
      }
    }

    // Dynamic electrical pulses traveling through synapses
    const pulses: SynapsePulse[] = [];
    const numPulses = compact ? 25 : 50;
    for (let p = 0; p < numPulses; p++) {
      if (synapses.length > 0) {
        const syn = synapses[Math.floor(Math.random() * synapses.length)];
        pulses.push({
          fromIndex: syn.a,
          toIndex: syn.b,
          progress: Math.random(),
          speed: Math.random() * 0.02 + 0.008,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }
    }

    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark futuristic canvas background gradient
      const bgGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width / 1.2
      );
      bgGlow.addColorStop(0, '#0f172a');
      bgGlow.addColorStop(0.5, '#090d16');
      bgGlow.addColorStop(1, '#020617');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Rotation matrix calculations
      if (!isDragging.current) {
        const autoSpeed = isThinking ? 0.015 : isMicListening ? 0.01 : 0.003;
        angleY += autoSpeed;
      }
      const rotYAngle = rotation.current.y + angleY;
      const rotXAngle = rotation.current.x;

      const cosX = Math.cos(rotXAngle);
      const sinX = Math.sin(rotXAngle);
      const cosY = Math.cos(rotYAngle);
      const sinY = Math.sin(rotYAngle);

      // Project 3D coordinates to 2D screen
      const projectedParticles = particles.map((p, idx) => {
        // Organic idle jitter
        const jitterSpeed = isThinking ? 2.5 : 0.8;
        p.x = p.baseX + Math.sin(Date.now() * 0.002 * jitterSpeed + idx) * 8;
        p.y = p.baseY + Math.cos(Date.now() * 0.0025 * jitterSpeed + idx) * 8;

        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate around X axis
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const fov = zoom.current;
        const distance = fov / (fov + z2 + 300);
        const screenX = width / 2 + x1 * distance;
        const screenY = height / 2 + y1 * distance;

        return {
          ...p,
          screenX,
          screenY,
          screenZ: z2,
          scale: distance,
          index: idx
        };
      });

      // Sort by depth (Z-buffer for accurate painter's algorithm)
      projectedParticles.sort((a, b) => b.screenZ - a.screenZ);

      // Map from original index to projected item
      const projMap = new Map<number, (typeof projectedParticles)[0]>();
      projectedParticles.forEach((p) => projMap.set(p.index, p));

      // Draw Synapse Connection Lines (Axons)
      ctx.lineWidth = isThinking ? 0.9 : 0.5;
      synapses.forEach((syn) => {
        const pA = projMap.get(syn.a);
        const pB = projMap.get(syn.b);
        if (!pA || !pB) return;

        const alpha = Math.max(0, (1 - syn.dist / maxDist) * 0.4 * pA.scale);
        if (alpha <= 0.02) return;

        ctx.strokeStyle = isThinking
          ? `rgba(245, 158, 11, ${alpha * 1.5})`
          : isMicListening
          ? `rgba(16, 185, 129, ${alpha * 1.5})`
          : `rgba(99, 102, 241, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(pA.screenX, pA.screenY);
        ctx.lineTo(pB.screenX, pB.screenY);
        ctx.stroke();
      });

      // Update and Draw Electrical Pulses traversing synapses
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed * (isThinking ? 2.2 : 1.0);
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          // Pick new random synapse
          if (synapses.length > 0) {
            const newSyn = synapses[Math.floor(Math.random() * synapses.length)];
            pulse.fromIndex = newSyn.a;
            pulse.toIndex = newSyn.b;
          }
        }

        const pA = projMap.get(pulse.fromIndex);
        const pB = projMap.get(pulse.toIndex);
        if (pA && pB) {
          const px = pA.screenX + (pB.screenX - pA.screenX) * pulse.progress;
          const py = pA.screenY + (pB.screenY - pA.screenY) * pulse.progress;
          const pulseSize = 2.5 * pA.scale;

          ctx.fillStyle = isThinking ? '#fef08a' : pulse.color;
          ctx.shadowColor = pulse.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw 3D Neural Particles (Somas / Synapse Nodes)
      projectedParticles.forEach((p) => {
        const size = Math.max(0.5, p.radius * p.scale * (isThinking ? 1.4 : 1.0));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isThinking ? 12 : 6;

        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update active simulated fires counter periodically
      if (Math.random() < 0.1) {
        setActiveFires(Math.floor(300000 + Math.random() * 120000));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isThinking, isMicListening, isSpeakingText, colorMode, compact]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    rotation.current.y += dx * 0.005;
    rotation.current.x += dy * 0.005;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl group transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : compact ? 'h-52 w-full' : 'h-80 w-full'
      }`}
    >
      {/* HUD Info Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-white shadow-lg">
          <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-bold tracking-tight">Trillion Synapse Engine</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            100,000,000 Synapses
          </span>
        </div>
      </div>

      {/* Control Buttons Overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        {/* Color Palette Selector */}
        <div className="flex bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-1 text-xs">
          <button
            onClick={() => setColorMode('indigo')}
            className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
              colorMode === 'indigo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Indigo
          </button>
          <button
            onClick={() => setColorMode('emerald')}
            className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
              colorMode === 'emerald' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Emerald
          </button>
          <button
            onClick={() => setColorMode('amber')}
            className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
              colorMode === 'amber' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Amber
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md"
          title="Toggle Fullscreen 3D Synapse View"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D Canvas Context */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Status Ticker Overlay */}
      <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-mono text-slate-300">
            Active Firing Potential: <strong className="text-purple-300">{activeFires.toLocaleString()}</strong>/s
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[10px] font-mono text-slate-500">
          <span>Latency: 8.4ms</span>
          <span>•</span>
          <span>Matrix: 3D Projection</span>
          <span>•</span>
          <span>Drag to Orbit</span>
        </div>
      </div>
    </div>
  );
};
