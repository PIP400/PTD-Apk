import React, { useState, useEffect } from 'react';
import { SaveData, ElementType } from '../types';
import { Star, Sparkles, Filter, ShieldCheck, Gem } from 'lucide-react';

interface GachaVaultProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

interface SummonResult {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'MYTHIC';
  type: 'BLUEPRINT' | 'ARTIFACT_PIECE' | 'TOWER_SKIN';
  element: ElementType;
  color: string;
}

export default function GachaVault({ saveData, updateSaveData, onBack }: GachaVaultProps) {
  const [filterRarity, setFilterRarity] = useState<string>('ALL');
  const [filterElement, setFilterElement] = useState<string>('ALL');
  const [summonResults, setSummonResults] = useState<SummonResult[]>([]);
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonAnimationStep, setSummonAnimationStep] = useState(0); // 0 = idle, 1 = flash, 2 = cards

  // List of all possible drops in our database
  const DROP_TABLE: SummonResult[] = [
    { id: 'bp_flame', name: 'Inferno Forge Blueprint', rarity: 'COMMON', type: 'BLUEPRINT', element: 'FLAME', color: '#FF5722' },
    { id: 'bp_frost', name: 'Glacial Spires Blueprint', rarity: 'COMMON', type: 'BLUEPRINT', element: 'FROST', color: '#00BCD4' },
    { id: 'bp_water', name: 'Tidal Swell Blueprint', rarity: 'COMMON', type: 'BLUEPRINT', element: 'WATER', color: '#2196F3' },
    { id: 'bp_poison', name: 'Toxic Catalyst Blueprint', rarity: 'RARE', type: 'BLUEPRINT', element: 'POISON', color: '#4CAF50' },
    { id: 'bp_wind', name: 'Cyclonic Force Blueprint', rarity: 'RARE', type: 'BLUEPRINT', element: 'WIND', color: '#80DEEA' },
    { id: 'bp_earth', name: 'Shatter Earthquake Blueprint', rarity: 'RARE', type: 'BLUEPRINT', element: 'EARTH', color: '#8D6E63' },
    { id: 'bp_thunder', name: 'Chain Voltage Blueprint', rarity: 'EPIC', type: 'BLUEPRINT', element: 'THUNDER', color: '#FFEB3B' },
    { id: 'bp_light', name: 'Solar Blessing Blueprint', rarity: 'EPIC', type: 'BLUEPRINT', element: 'LIGHT', color: '#FFF59D' },
    { id: 'bp_dark', name: 'Abyssal Nova Blueprint', rarity: 'EPIC', type: 'BLUEPRINT', element: 'DARK', color: '#9C27B0' },
    { id: 'bp_arcane', name: 'Arcane Rift Gate Blueprint', rarity: 'MYTHIC', type: 'BLUEPRINT', element: 'ARCANE', color: '#E040FB' },
    { id: 'bp_nature', name: 'Forest Treant Guardian Core', rarity: 'MYTHIC', type: 'BLUEPRINT', element: 'NATURE_SUMMON', color: '#A5D6A7' },
    { id: 'bp_corpse', name: 'Lich Soul Core Blueprint', rarity: 'MYTHIC', type: 'BLUEPRINT', element: 'CORPSE_SUMMON', color: '#B39DDB' },
  ];

  // Perform summon
  const handleSummon = (count: number) => {
    const cost = count === 1 ? 100 : 900;
    if (saveData.gemmaShards < cost) {
      alert('Insufficient Gemma Shards! Play standard waves or Infinite Rift mode to earn shards.');
      return;
    }

    setIsSummoning(true);
    setSummonAnimationStep(1);

    // Roll items
    const newResults: SummonResult[] = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let selectedRarity: 'COMMON' | 'RARE' | 'EPIC' | 'MYTHIC' = 'COMMON';

      if (roll < 3) {
        selectedRarity = 'MYTHIC';
      } else if (roll < 15) {
        selectedRarity = 'EPIC';
      } else if (roll < 50) {
        selectedRarity = 'RARE';
      } else {
        selectedRarity = 'COMMON';
      }

      // Filter drops matching rarity
      const candidates = DROP_TABLE.filter(d => d.rarity === selectedRarity);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || DROP_TABLE[0];
      newResults.push({ ...chosen, id: `${chosen.id}_${Date.now()}_${i}` });
    }

    // Deduct currency and save to blueprint inventories
    setTimeout(() => {
      setSummonAnimationStep(2);
      setSummonResults(newResults);

      updateSaveData(prev => {
        const nextUnlocked = [...prev.unlockedTowers];
        newResults.forEach(item => {
          if (!nextUnlocked.includes(item.element)) {
            nextUnlocked.push(item.element);
          }
          // Increment blueprint levels in weaponLevels
          prev.weaponLevels[item.element] = Math.min(50, (prev.weaponLevels[item.element] || 1) + 1);
        });

        return {
          ...prev,
          gemmaShards: prev.gemmaShards - cost,
          unlockedTowers: nextUnlocked,
        };
      });
    }, 1200);
  };

  const rarityColor = (r: string) => {
    switch (r) {
      case 'COMMON': return 'text-gray-400 border-gray-600';
      case 'RARE': return 'text-blue-400 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'EPIC': return 'text-purple-400 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
      case 'MYTHIC': return 'text-yellow-400 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)] font-bold animate-pulse';
      default: return 'text-gray-400 border-gray-800';
    }
  };

  // Filter player blueprints for visual chest inventory
  const filterBlueprints = DROP_TABLE.filter(item => {
    if (filterRarity !== 'ALL' && item.rarity !== filterRarity) return false;
    if (filterElement !== 'ALL' && item.element !== filterElement) return false;
    return true;
  });

  return (
    <div id="summon-gate-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Gem className="text-emerald-400 w-8 h-8 animate-bounce" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              The Summon Gate
            </h1>
            <p className="text-xs text-emerald-600">Unlock elemental blueprints & weapon cores</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded border border-emerald-900">
            <Gem className="text-orange-400 w-4 h-4" />
            <span className="font-mono font-bold text-orange-400 text-sm">
              {saveData.gemmaShards.toLocaleString()} SHARDS
            </span>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
          >
            &lt; MAIN MENU
          </button>
        </div>
      </div>

      {/* Main Summoning Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Banner Column */}
        <div className="relative md:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/60 p-5 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-orange-950/40 text-orange-400 border border-orange-900 rounded font-bold">
              LATEST RATE UP
            </span>
            <h2 className="text-xl font-bold text-emerald-300 mt-3 font-mono">INFINITY VOID CORES</h2>
            <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
              Unlock the ultra-powerful <strong className="text-emerald-400 font-mono">Arcane</strong> and <strong className="text-emerald-400 font-mono">Corpse Summoner</strong> blueprints! Increased rates for mythic cores!
            </p>
          </div>

          <div className="mt-4 bg-neutral-950 p-3 rounded border border-emerald-950 font-mono text-[10px] text-emerald-600 flex flex-col gap-1">
            <div className="flex justify-between"><span className="text-orange-400 font-bold">Mythic Core:</span> <span>3.00%</span></div>
            <div className="flex justify-between"><span className="text-emerald-400 font-bold">Epic Core:</span> <span>12.00%</span></div>
            <div className="flex justify-between"><span className="text-cyan-400 font-bold">Rare Core:</span> <span>35.00%</span></div>
            <div className="flex justify-between"><span className="text-emerald-700 font-bold">Common Core:</span> <span>50.00%</span></div>
          </div>
        </div>

        {/* Action Columns */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
          <div className="flex-1 rounded-lg border border-emerald-900 bg-neutral-900/40 p-5 flex flex-col justify-between text-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <div>
              <Sparkles className="text-emerald-500 w-8 h-8 mx-auto mb-2" />
              <h3 className="font-mono text-sm font-bold text-emerald-300 uppercase">Single Core Wave</h3>
              <p className="text-xs text-emerald-600 mt-1">Acquire 1 random element core or artifact blueprint.</p>
            </div>
            <button
              onClick={() => handleSummon(1)}
              className="mt-6 py-3 bg-neutral-950 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-850 font-mono text-xs font-bold tracking-widest rounded transition cursor-pointer flex justify-center items-center gap-2"
            >
              SUMMON x1 (100 Shards)
            </button>
          </div>

          <div className="flex-1 rounded-lg border border-emerald-900 bg-neutral-900/40 p-5 flex flex-col justify-between text-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <div>
              <div className="flex justify-center gap-1 mb-2">
                <Sparkles className="text-orange-400 w-6 h-6 animate-pulse" />
                <Sparkles className="text-orange-400 w-6 h-6 animate-pulse delay-75" />
              </div>
              <h3 className="font-mono text-sm font-bold text-orange-400 uppercase">10-Pull Core Storm</h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">Guarantees at least 1 Epic or higher rarity blueprint! (10% discount)</p>
            </div>
            <button
              onClick={() => handleSummon(10)}
              className="mt-6 py-3 bg-neutral-950 hover:bg-emerald-500 hover:text-black text-orange-400 border border-emerald-850 font-mono text-xs font-bold tracking-widest rounded transition cursor-pointer flex justify-center items-center gap-2"
            >
              SUMMON x10 (900 Shards)
            </button>
          </div>
        </div>
      </div>

      {/* Animation / Summoning Results modal Overlay */}
      {isSummoning && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
          {summonAnimationStep === 1 ? (
            <div className="text-center font-mono">
              <div className="w-16 h-16 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-emerald-400 text-sm tracking-widest animate-pulse">
                OPENING RIFT PORTS TO THE VOID VAULT...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl flex flex-col items-center">
              <h3 className="text-lg font-mono font-bold text-emerald-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="text-orange-400 w-5 h-5 animate-spin" /> Void Gate Drop results
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-h-[420px] overflow-y-auto p-4 bg-neutral-950 border border-emerald-900 rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                {summonResults.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded border border-emerald-950 flex flex-col items-center text-center bg-neutral-900 transition-all transform scale-100"
                  >
                    <div
                      className="w-10 h-10 rounded-full mb-2 flex items-center justify-center font-bold bg-neutral-950 border border-emerald-900"
                      style={{ color: item.color }}
                    >
                      ★
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold h-8 flex items-center line-clamp-2">
                      {item.name}
                    </span>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-700 mt-2 block font-extrabold">
                      {item.rarity}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsSummoning(false);
                  setSummonResults([]);
                  setSummonAnimationStep(0);
                }}
                className="mt-8 px-6 py-2 bg-emerald-900 border border-emerald-500 hover:bg-emerald-700 text-white font-bold font-mono text-sm uppercase rounded cursor-pointer transition shadow-lg"
              >
                CONFIRM REWARDS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collected Vault Chest Inventory */}
      <div className="flex-1 flex flex-col rounded-lg border border-emerald-900 bg-neutral-900/40 p-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-sm font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
            💼 Your Inventory Blueprints
          </h2>

          {/* Filtering */}
          <div className="flex gap-2 font-mono">
            <div className="flex items-center bg-neutral-950 px-2 rounded border border-emerald-900 text-xs">
              <Filter className="w-3.5 h-3.5 text-emerald-600 mr-2" />
              <select
                value={filterRarity}
                onChange={e => setFilterRarity(e.target.value)}
                className="bg-transparent text-xs font-mono text-emerald-400 border-none outline-none cursor-pointer py-1"
              >
                <option value="ALL">All Rarities</option>
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="MYTHIC">Mythic</option>
              </select>
            </div>

            <div className="flex items-center bg-neutral-950 px-2 rounded border border-emerald-900 text-xs">
              <select
                value={filterElement}
                onChange={e => setFilterElement(e.target.value)}
                className="bg-transparent text-xs font-mono text-emerald-400 border-none outline-none cursor-pointer py-1"
              >
                <option value="ALL">All Elements</option>
                <option value="FLAME">Flame</option>
                <option value="FROST">Frost</option>
                <option value="THUNDER">Thunder</option>
                <option value="POISON">Poison</option>
                <option value="EARTH">Earth</option>
                <option value="WIND">Wind</option>
                <option value="WATER">Water</option>
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
                <option value="ARCANE">Arcane</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blueprint display grid */}
        <div className="flex-1 min-h-[220px] overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-2 bg-neutral-950 border border-emerald-900 rounded shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
          {filterBlueprints.map(item => {
            const isUnlocked = saveData.unlockedTowers.includes(item.element);
            const level = saveData.weaponLevels[item.element] || 1;
            return (
              <div
                key={item.id}
                className={`relative p-3 rounded border bg-neutral-900 flex flex-col justify-between ${
                  isUnlocked ? 'border-emerald-800' : 'border-emerald-950/60 opacity-40'
                }`}
              >
                {/* Level / Status badge */}
                {isUnlocked ? (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-mono bg-emerald-950/50 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900 font-bold">
                    LV. {level}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-mono bg-neutral-950 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-950 font-bold">
                    LOCKED
                  </span>
                )}

                <div>
                  <div
                    className="w-8 h-8 rounded mb-2 flex items-center justify-center text-xs bg-neutral-950 border border-emerald-950"
                    style={{ color: item.color }}
                  >
                    ★
                  </div>
                  <h4 className="text-xs font-mono text-emerald-300 font-bold leading-snug">{item.name}</h4>
                </div>

                <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-emerald-700 border-t border-emerald-950/50 pt-2 font-bold">
                  <span style={{ color: item.color }}>{item.rarity}</span>
                  <span>{item.element}</span>
                </div>
              </div>
            );
          })}
          {filterBlueprints.length === 0 && (
            <div className="col-span-full flex items-center justify-center text-xs text-emerald-700 font-mono">
              No blueprints match selection. Summons to unlock more!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
