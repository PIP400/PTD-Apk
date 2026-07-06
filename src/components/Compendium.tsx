import React, { useState, useEffect, useRef } from 'react';
import { BESTIARY_DATA } from '../data/bestiary';
import { ELEMENTS_DATA } from '../data/elements';
import { drawPixelSprite } from '../utils/pixelArt';
import { BookOpen, ShieldAlert, Zap, Flame, Snowflake, Activity } from 'lucide-react';

interface CompendiumProps {
  onBack: () => void;
}

export default function Compendium({ onBack }: CompendiumProps) {
  const [activeTab, setActiveTab] = useState<'BESTIARY' | 'ELEMENTS'>('BESTIARY');
  const [selectedMonster, setSelectedMonster] = useState<string>('goblin');
  const [selectedElement, setSelectedElement] = useState<string>('FLAME');
  const [animationFrame, setAnimationFrame] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simple frame loop to keep pixel sprites actively breathing/animating in the Compendium
  useEffect(() => {
    let frameId: number;
    const tick = () => {
      setAnimationFrame(prev => prev + 1);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Redraw the selected item on the preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark background grid to match retro design
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw the active item
    if (activeTab === 'BESTIARY') {
      const stats = BESTIARY_DATA[selectedMonster];
      if (stats) {
        // Draw the walking monster center stage
        drawPixelSprite(
          ctx,
          stats.type,
          canvas.width / 2,
          canvas.height - 20,
          96, // 96px massive size
          1, // Facing right
          animationFrame,
          0,
          null,
          stats.type === 'dark_mage' || stats.type === 'bone_wizard' || stats.type === 'void_stalker'
        );
      }
    } else {
      const element = ELEMENTS_DATA[selectedElement as any];
      if (element) {
        // Draw tower
        drawPixelSprite(
          ctx,
          element.type,
          canvas.width / 2,
          canvas.height - 20,
          96,
          1,
          animationFrame,
          0,
          null,
          false
        );
      }
    }
  }, [activeTab, selectedMonster, selectedElement, animationFrame]);

  return (
    <div id="compendium-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 font-mono p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-emerald-400 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              The Grand Compendium
            </h1>
            <p className="text-xs text-emerald-600">Tactical bestiary & elemental tower reference sheets</p>
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
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('BESTIARY');
            const keys = Object.keys(BESTIARY_DATA);
            setSelectedMonster(keys[0]);
          }}
          className={`flex-1 py-3 font-mono text-sm tracking-widest uppercase transition border border-emerald-900 cursor-pointer ${
            activeTab === 'BESTIARY'
              ? 'bg-emerald-950/40 text-emerald-400 border-b-2 border-b-emerald-400 font-bold shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
              : 'bg-neutral-900/50 text-emerald-600 hover:bg-emerald-950/20'
          }`}
        >
          💀 Monster Bestiary
        </button>
        <button
          onClick={() => {
            setActiveTab('ELEMENTS');
            const keys = Object.keys(ELEMENTS_DATA);
            setSelectedElement(keys[0]);
          }}
          className={`flex-1 py-3 font-mono text-sm tracking-widest uppercase transition border border-emerald-900 cursor-pointer ${
            activeTab === 'ELEMENTS'
              ? 'bg-emerald-950/40 text-emerald-400 border-b-2 border-b-emerald-400 font-bold shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
              : 'bg-neutral-900/50 text-emerald-600 hover:bg-emerald-950/20'
          }`}
        >
          ⚡ Elemental Arsenal
        </button>
      </div>

      {/* Content Columns */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-140px)] min-h-[480px]">
        {/* Left column: List of items */}
        <div className="flex-1 overflow-y-auto bg-neutral-900/40 border border-emerald-900 p-4 rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          {activeTab === 'BESTIARY' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(BESTIARY_DATA).map(key => {
                const item = BESTIARY_DATA[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMonster(key)}
                    className={`flex flex-col items-center p-3 rounded border text-center transition cursor-pointer ${
                      selectedMonster === key
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'bg-neutral-900/50 border-emerald-950/60 text-emerald-600 hover:border-emerald-800'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-2 bg-neutral-950 rounded border border-emerald-900">
                      {/* Drawing canvas in micro-frame */}
                      <canvas
                        id={`micro-canvas-${key}`}
                        width={40}
                        height={40}
                        ref={el => {
                          if (!el) return;
                          const ctx = el.getContext('2d');
                          if (!ctx) return;
                          ctx.clearRect(0, 0, 40, 40);
                          drawPixelSprite(ctx, item.type, 20, 36, 32, 1, animationFrame, 0, null, item.type === 'dark_mage' || item.type === 'bone_wizard' || item.type === 'void_stalker');
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold">{item.name}</span>
                    <span className="text-[10px] text-orange-400 uppercase tracking-widest mt-1 font-bold">
                      {item.isBoss ? '⭐ BOSS' : 'Unit'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(ELEMENTS_DATA).map(key => {
                const item = ELEMENTS_DATA[key as any];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedElement(key)}
                    className={`flex flex-col items-center p-3 rounded border text-center transition cursor-pointer ${
                      selectedElement === key
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'bg-neutral-900/50 border-emerald-950/60 text-emerald-600 hover:border-emerald-800'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-2 bg-neutral-950 rounded border border-emerald-900">
                      <canvas
                        id={`micro-canvas-${key}`}
                        width={40}
                        height={40}
                        ref={el => {
                          if (!el) return;
                          const ctx = el.getContext('2d');
                          if (!ctx) return;
                          ctx.clearRect(0, 0, 40, 40);
                          drawPixelSprite(ctx, item.type, 20, 36, 32, 1, animationFrame, 0, null, false);
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold">{item.name}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900"
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Detailed View & Live Canvas Preview */}
        <div className="w-full lg:w-[450px] flex flex-col gap-4 bg-neutral-900/80 border border-emerald-900 p-5 rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
          {/* Animated Retro Target Viewfinder */}
          <div className="relative border border-emerald-800 rounded overflow-hidden aspect-video w-full flex items-center justify-center bg-neutral-950">
            {/* Retro overlay targeting notches */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-500 w-3 h-3"></div>
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-500 w-3 h-3"></div>
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-500 w-3 h-3"></div>
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-500 w-3 h-3"></div>

            <canvas
              ref={canvasRef}
              width={260}
              height={180}
              className="rounded shadow-lg max-w-full"
            />
          </div>

          {/* Text stats detailing elements */}
          <div className="flex-1 flex flex-col justify-between">
            {activeTab === 'BESTIARY' ? (
              <div>
                {(() => {
                  const item = BESTIARY_DATA[selectedMonster];
                  if (!item) return null;
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold font-mono text-emerald-400">{item.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-900 rounded font-mono font-bold">
                          SPEED: {item.speed}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded border border-emerald-950">
                        <div className="flex items-center gap-2">
                          <Activity className="text-red-400 w-4 h-4" />
                          <div className="text-xs">
                            <div className="text-emerald-700 font-mono">Max HP</div>
                            <div className="font-bold font-mono text-emerald-300 text-sm">{item.maxHp.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="text-orange-400 w-4 h-4" />
                          <div className="text-xs">
                            <div className="text-emerald-700 font-mono">Core Damage</div>
                            <div className="font-bold font-mono text-emerald-300 text-sm">{item.dmg}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-emerald-400 font-mono font-bold uppercase mb-1 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Special Ability Description:
                        </div>
                        <div className="text-xs text-emerald-500 leading-relaxed bg-neutral-950 p-3 rounded border border-emerald-950 font-mono">
                          {item.ability}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div>
                {(() => {
                  const item = ELEMENTS_DATA[selectedElement as any];
                  if (!item) return null;
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold font-mono text-emerald-300">
                          {item.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900 rounded font-mono font-bold">
                          COST: {item.cost}g
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded border border-emerald-950 font-mono text-xs">
                        <div>
                          <span className="text-emerald-700 block">BASE ATK:</span>
                          <span className="font-bold text-emerald-300 text-sm">{item.damage}</span>
                        </div>
                        <div>
                          <span className="text-emerald-700 block">RANGE:</span>
                          <span className="font-bold text-emerald-300 text-sm">{item.range}px</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-emerald-700 block">COOLDOWN:</span>
                          <span className="font-bold text-emerald-300 text-sm">{(item.cooldown / 60).toFixed(2)}s</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-emerald-700 block">UPGRADE ACTION:</span>
                          <span className="font-bold text-cyan-400 text-sm font-mono">{item.upgradeName}</span>
                        </div>
                      </div>

                      <div className="bg-neutral-950 p-3 rounded border border-emerald-950 text-xs font-mono">
                        <div className="text-orange-400 font-bold uppercase mb-1">Elemental Mastery Core:</div>
                        <p className="text-emerald-500 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
