import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Sparkles, Sliders, Palette, RefreshCw } from 'lucide-react';

interface ParticleFXStudioProps {
  onBack: () => void;
  // Options saved in localStorage
  fxConfig: {
    emissionCount: number;
    trailDuration: number;
    decaySpeed: number;
    gravity: number;
    flameColor: string;
    frostColor: string;
    thunderColor: string;
  };
  setFxConfig: React.Dispatch<React.SetStateAction<{
    emissionCount: number;
    trailDuration: number;
    decaySpeed: number;
    gravity: number;
    flameColor: string;
    frostColor: string;
    thunderColor: string;
  }>>;
}

export default function ParticleFXStudio({ onBack, fxConfig, setFxConfig }: ParticleFXStudioProps) {
  const [activeTab, setActiveTab] = useState<'SLIDERS' | 'COLORS'>('SLIDERS');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simple floating particle physics preview canvas running inside Mod Studio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface PreviewParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }

    let particles: PreviewParticle[] = [];

    let frameId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark digital matrix space
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural scan lines grid
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Constantly emit particles from center based on Config emission rates
      if (Math.random() < fxConfig.emissionCount / 100) {
        const angles = [fxConfig.flameColor, fxConfig.frostColor, fxConfig.thunderColor];
        const chosenColor = angles[Math.floor(Math.random() * angles.length)];

        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 0,
          maxLife: fxConfig.trailDuration / 10,
          color: chosenColor,
        });
      }

      // Physics loop
      particles = particles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy + fxConfig.gravity * 0.1, // apply gravity vector
          life: p.life + fxConfig.decaySpeed,
        }))
        .filter(p => p.life < p.maxLife);

      particles.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        const radius = Math.max(1, 4 * (1 - p.life / p.maxLife));
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render center core emitter
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [fxConfig]);

  const handleResetDefaults = () => {
    setFxConfig({
      emissionCount: 50,
      trailDuration: 400,
      decaySpeed: 1,
      gravity: 0,
      flameColor: '#FF5722',
      frostColor: '#00BCD4',
      thunderColor: '#FFEB3B',
    });
    alert('Visual particles mod overridden with default configurations successfully!');
  };

  return (
    <div id="particle-studio-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px] font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4 font-sans">
        <div className="flex items-center gap-3">
          <Sparkles className="text-emerald-400 w-8 h-8 animate-spin" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              Visual Particle FX Mod Studio
            </h1>
            <p className="text-xs text-emerald-600 font-mono">Tweak projectile count, trail duration vectors, and elemental gradients</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
        >
          &lt; MAIN MENU
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 font-mono text-xs">
        <button
          onClick={() => setActiveTab('SLIDERS')}
          className={`flex-1 py-3 tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'SLIDERS'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          <Sliders className="inline-block w-4 h-4 mr-2" /> Sliders Mod Physics
        </button>
        <button
          onClick={() => setActiveTab('COLORS')}
          className={`flex-1 py-3 tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'COLORS'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          <Palette className="inline-block w-4 h-4 mr-2" /> Color Gradient Mixer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left-Center Panel based on selection */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          {activeTab === 'SLIDERS' ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-2">
                ⚙️ Custom Particle Mod Controls
              </h2>

              {/* Slider 1: Emission */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-700">PARTICLE EMISSION RATE:</span>
                  <span className="font-bold text-emerald-300">{fxConfig.emissionCount}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={fxConfig.emissionCount}
                  onChange={e => setFxConfig(prev => ({ ...prev, emissionCount: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-400 bg-neutral-900 h-1 rounded outline-none cursor-pointer"
                />
                <span className="text-[10px] text-emerald-600 block mt-1">Controls how many particles are spawned upon projectile impact.</span>
              </div>

              {/* Slider 2: Trail duration */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-700">TRAIL RETENTION DURATION:</span>
                  <span className="font-bold text-emerald-300">{fxConfig.trailDuration}MS</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={fxConfig.trailDuration}
                  onChange={e => setFxConfig(prev => ({ ...prev, trailDuration: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-400 bg-neutral-900 h-1 rounded outline-none cursor-pointer"
                />
                <span className="text-[10px] text-emerald-600 block mt-1">Dictates longevity of trailing particle steps before decay.</span>
              </div>

              {/* Slider 3: Gravity */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-700">GRAVITY VECTORS FORCE:</span>
                  <span className="font-bold text-emerald-300">{fxConfig.gravity}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={fxConfig.gravity}
                  onChange={e => setFxConfig(prev => ({ ...prev, gravity: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-400 bg-neutral-900 h-1 rounded outline-none cursor-pointer"
                />
                <span className="text-[10px] text-emerald-600 block mt-1">Pulls particle trails upward or downward procedurally.</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-2">
                🎨 Elemental Color override mixer
              </h2>

              <p className="text-xs text-emerald-600 font-mono leading-relaxed mb-2">
                Override default project colors. Alter associated canvas bullet streaks and light blooms instantly:
              </p>

              {/* Color Flame */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950 flex justify-between items-center">
                <div>
                  <strong className="text-emerald-300 block">🔥 Flame blast Color:</strong>
                  <span className="text-[10px] text-emerald-600 font-bold">Overrides fireballs and infernos.</span>
                </div>
                <input
                  type="color"
                  value={fxConfig.flameColor}
                  onChange={e => setFxConfig(prev => ({ ...prev, flameColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-emerald-800 bg-transparent cursor-pointer"
                />
              </div>

              {/* Color Frost */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950 flex justify-between items-center">
                <div>
                  <strong className="text-emerald-300 block">❄️ Frost slow Color:</strong>
                  <span className="text-[10px] text-emerald-600 font-bold">Overrides ice shards and blizzard storms.</span>
                </div>
                <input
                  type="color"
                  value={fxConfig.frostColor}
                  onChange={e => setFxConfig(prev => ({ ...prev, frostColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-emerald-800 bg-transparent cursor-pointer"
                />
              </div>

              {/* Color Thunder */}
              <div className="font-mono text-xs bg-neutral-950 p-4 rounded border border-emerald-950 flex justify-between items-center">
                <div>
                  <strong className="text-emerald-300 block">⚡ Thunder Voltage Color:</strong>
                  <span className="text-[10px] text-emerald-600 font-bold">Overrides lighting strikes and chain bolts.</span>
                </div>
                <input
                  type="color"
                  value={fxConfig.thunderColor}
                  onChange={e => setFxConfig(prev => ({ ...prev, thunderColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-emerald-800 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleResetDefaults}
            className="mt-6 w-full py-2.5 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white border border-emerald-850 shadow-md font-mono text-xs font-bold tracking-widest uppercase rounded cursor-pointer transition flex justify-center items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 animate-spin" /> Reset FX Defaults
          </button>
        </div>

        {/* Right Column: Live Emitter Radar preview */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-2">
              🔮 Particle Emitter Radar
            </h2>
            <p className="text-[10px] text-emerald-600 font-mono mb-4 leading-relaxed">
              Live simulation showing current modified metrics. Watch gravity vectors and colors reflect dynamically:
            </p>

            <div className="border border-emerald-950 rounded overflow-hidden aspect-square w-full">
              <canvas
                ref={canvasRef}
                width={260}
                height={260}
                className="w-full h-full block"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              All particle color overriding hex keys are synchronized globally with the standard in-game gameplay render loop instantly!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
