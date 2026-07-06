import React, { useState } from 'react';
import { SaveData, ElementType } from '../types';
import { ELEMENTS_DATA } from '../data/elements';
import { Sparkles, HelpCircle, Flame, Snowflake, ShieldAlert, Zap, Hammer } from 'lucide-react';

interface BlacksmithForgeProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

export default function BlacksmithForge({ saveData, updateSaveData, onBack }: BlacksmithForgeProps) {
  const [selectedTower, setSelectedTower] = useState<ElementType>('FLAME');
  const [isFusedActive, setIsFusedActive] = useState(false); // Godly fusion checkbox toggle

  const itemStats = ELEMENTS_DATA[selectedTower];
  const currentLevel = saveData.weaponLevels[selectedTower] || 1;
  const isGodly = saveData.fusedTowers[selectedTower] || false;

  // Level upgrade pricing formulas
  const upgradeCost = currentLevel * 150 + 200;
  const isMaxLevel = currentLevel >= 50;

  // Fusion pricing formula (sacrifices 5 blueprints/levels)
  const canFuse = currentLevel >= 25 && !isGodly;
  const fusionCostGold = 2500;

  // Execute base level upgrade
  const handleUpgradeLevel = () => {
    if (saveData.gold < upgradeCost) {
      alert('Insufficient Gold! Defeat enemies in campaign stages to earn gold.');
      return;
    }
    if (isMaxLevel) {
      alert('Tower has already reached the Maximum level of 50!');
      return;
    }

    updateSaveData(prev => ({
      ...prev,
      gold: prev.gold - upgradeCost,
      weaponLevels: {
        ...prev.weaponLevels,
        [selectedTower]: (prev.weaponLevels[selectedTower] || 1) + 1,
      },
    }));
  };

  // Execute Godly Fusion
  const handleFuseGodly = () => {
    if (saveData.gold < fusionCostGold) {
      alert('Insufficient gold for cosmic fusion! Need 2,500 Gold.');
      return;
    }
    if (currentLevel < 25) {
      alert('Your tower blueprint must be at least Level 25 to withstand Godly Fusion!');
      return;
    }

    updateSaveData(prev => ({
      ...prev,
      gold: prev.gold - fusionCostGold,
      fusedTowers: {
        ...prev.fusedTowers,
        [selectedTower]: true,
      },
    }));
  };

  return (
    <div id="blacksmith-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Hammer className="text-emerald-400 w-8 h-8 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              The Blacksmith's Anvil
            </h1>
            <p className="text-xs text-emerald-600">Forge weapon metrics, level blueprints, and trigger Godly fusions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded border border-emerald-900 font-mono text-sm">
            <span className="text-emerald-700">GOLD:</span>
            <span className="font-bold text-orange-400">
              {saveData.gold.toLocaleString()}g
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left column: Arsenal Select list */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-4 overflow-y-auto shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
            ⚒ Select Base Blueprint
          </h2>

          <div className="flex flex-col gap-2">
            {Object.keys(ELEMENTS_DATA).map(key => {
              const item = ELEMENTS_DATA[key as any];
              const level = saveData.weaponLevels[item.type] || 1;
              const isItemGodly = saveData.fusedTowers[item.type] || false;
              const isUnlocked = saveData.unlockedTowers.includes(item.type);

              return (
                <button
                  key={key}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedTower(item.type)}
                  className={`flex items-center justify-between p-3 rounded border text-left transition cursor-pointer ${
                    !isUnlocked ? 'opacity-30 cursor-not-allowed bg-neutral-950/40 border-emerald-950' : ''
                  } ${
                    selectedTower === item.type
                      ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-neutral-900/50 border-emerald-950/60 text-emerald-600 hover:border-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold bg-neutral-950/60 border border-emerald-900"
                    >
                      ★
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold">{item.name}</div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        {isUnlocked ? `Level ${level}/50` : 'NOT UNLOCKED'}
                      </div>
                    </div>
                  </div>

                  {isItemGodly && (
                    <span className="text-[9px] bg-orange-950/40 text-orange-400 border border-orange-900 px-1.5 py-0.5 rounded font-mono font-extrabold animate-pulse">
                      GODLY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center column: Forge Upgrades Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <h2 className="text-sm font-bold font-mono tracking-wider text-emerald-400 uppercase mb-4 border-b border-emerald-900 pb-2">
              🔨 Upgrade Forge Chamber
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile icon */}
              <div className="flex flex-col items-center gap-2 p-4 bg-neutral-950 border border-emerald-950 rounded-lg w-full md:w-44 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-pulse shadow-lg bg-emerald-950/30 border border-emerald-900"
                >
                  ⚙
                </div>
                <div className="font-mono font-bold text-xs mt-2 text-emerald-300">{itemStats.name}</div>
                {isGodly ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-400 text-black font-extrabold font-mono uppercase">
                    GODLY ANVIL
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold font-mono uppercase">
                    STANDARD CORES
                  </span>
                )}
              </div>

              {/* Stats delta representation */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-neutral-950 p-3 rounded border border-emerald-950">
                    <span className="text-emerald-700 block uppercase">Base Damage:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-600">{itemStats.damage}</span>
                      <span className="text-emerald-400 font-bold">&rarr;</span>
                      <span className="text-emerald-300 font-extrabold text-sm">
                        {Math.round(itemStats.damage * (1 + currentLevel * 0.05))}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded border border-emerald-950">
                    <span className="text-emerald-700 block uppercase">Core Attack Range:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-600">{itemStats.range}px</span>
                      <span className="text-emerald-400 font-bold">&rarr;</span>
                      <span className="text-emerald-300 font-extrabold text-sm">
                        {Math.round(itemStats.range * (1 + currentLevel * 0.01))}px
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-neutral-950 p-4 rounded border border-emerald-950 gap-4">
                  <div className="font-mono text-xs">
                    <div className="text-emerald-700">UPGRADE FEE</div>
                    <div className="font-bold text-orange-400 text-base">{isMaxLevel ? 'MAXED' : `${upgradeCost} Gold`}</div>
                  </div>
                  <button
                    onClick={handleUpgradeLevel}
                    disabled={isMaxLevel}
                    className={`px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition shadow cursor-pointer border ${
                      isMaxLevel
                        ? 'bg-neutral-900 text-emerald-800 border-emerald-950 cursor-not-allowed'
                        : 'bg-emerald-900 border-emerald-500 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isMaxLevel ? 'LEVEL CAP REACHED' : `LEVEL UP TO ${currentLevel + 1}`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fusion Chamber */}
          <div className="rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-950/60 pb-2">
              <h2 className="text-sm font-bold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-2">
                🌟 Fused Weapon Matrix
              </h2>
              {/* Toggle switch */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fused-toggle"
                  checked={isFusedActive}
                  onChange={e => setIsFusedActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="fused-toggle" className="text-xs font-mono text-emerald-500 uppercase cursor-pointer font-bold">
                  Fused All-In-1
                </label>
              </div>
            </div>

            {isFusedActive ? (
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-neutral-950/50 p-4 rounded border border-emerald-900">
                <div className="font-mono text-xs flex-1">
                  <h3 className="text-sm text-emerald-300 font-bold uppercase mb-1">Godly Transmutation</h3>
                  <p className="text-emerald-600 leading-relaxed text-[11px]">
                    Sacrifice duplicate element materials to fuse this spire. Unlocks a screen-clearing multi-phase ultimate projectile animation! Requires level 25.
                  </p>
                  <div className="flex gap-4 mt-3 border-t border-emerald-950/60 pt-2 text-emerald-700">
                    <div>
                      STATUS: {isGodly ? <span className="text-emerald-400 font-bold">FUSED</span> : <span className="text-red-400 font-bold">UNFUSED</span>}
                    </div>
                    <div>MIN REQ: <span className={currentLevel >= 25 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>Level 25</span></div>
                  </div>
                </div>

                <div className="text-center w-full md:w-auto font-mono text-xs flex flex-col gap-2">
                  <span className="text-orange-400 font-bold block">COST: 2,500g</span>
                  <button
                    onClick={handleFuseGodly}
                    disabled={isGodly || currentLevel < 25}
                    className={`px-6 py-3 rounded font-bold font-mono text-xs tracking-wider uppercase border transition cursor-pointer ${
                      isGodly || currentLevel < 25
                        ? 'bg-neutral-900 text-emerald-800 border-emerald-950 cursor-not-allowed'
                        : 'bg-emerald-900 border-emerald-500 hover:bg-emerald-700 text-white animate-pulse'
                    }`}
                  >
                    {isGodly ? 'FUSION COMPLETE' : 'ACTIVATE GODLY FUSION'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-neutral-950/50 rounded border border-emerald-950 font-mono text-xs text-emerald-600">
                <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Toggle the <strong className="text-emerald-300">"Fused All-In-1"</strong> checkbox above to perform cosmic merges. Merging releases the hidden potential of your element, creating phase-shifting ultimate projectiles.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
