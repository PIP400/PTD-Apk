import React, { useState } from 'react';
import { SaveData } from '../types';
import { Shield, Map, Coins, HelpCircle, Sparkles, Plus, Check } from 'lucide-react';

interface GuildHQProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

export default function GuildHQ({ saveData, updateSaveData, onBack }: GuildHQProps) {
  const [activeTab, setActiveTab] = useState<'CREATOR' | 'CITADEL' | 'TERRITORIES'>('CREATOR');

  // Banner Creator options
  const SHAPES = ['COSMIC_SHIELD', 'DIAMOND_SPIRE', 'HEX_GATE', 'DRAGON_TOME'];
  const COLORS = ['#FF1744', '#00E5FF', '#D500F9', '#00E676', '#FFEA00'];
  const SYMBOLS = ['⚔', '💀', '🛡', '★', '🔥'];

  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [typedGuildName, setTypedGuildName] = useState(saveData.guildName || 'COSMIC VANGUARDS');

  // Citadel Vault Simulation
  const [vaultGold, setVaultGold] = useState(saveData.guildDonatedGold || 15000);
  const [unlockedBuffs, setUnlockedBuffs] = useState<string[]>(['GOLD_GAIN']);

  // Territory nodes map representation
  const TERRITORIES = [
    { id: 't1', name: 'Reck Grasslands Sector 4', faction: 'COSMIC VANGUARDS (YOU)', control: '92%', color: 'text-cyan-400' },
    { id: 't2', name: 'The Obsidian Fissures S-8', faction: 'VULCAN ARCHONS', control: '64%', color: 'text-red-400' },
    { id: 't3', name: 'The Necrotic Citadel Core', faction: 'DEATH SPECTRUM', control: '45%', color: 'text-purple-400' },
    { id: 't4', name: 'Infinite Rift Rift Gates', faction: 'VOID HORIZONS', control: '30%', color: 'text-yellow-400' },
  ];

  const handleSaveBanner = () => {
    updateSaveData(prev => ({
      ...prev,
      guildName: typedGuildName,
      guildCrest: JSON.stringify({ shape: selectedShape, color: selectedColor, symbol: selectedSymbol }),
    }));
    alert('Alliance Crest saved to local storage database successfully!');
  };

  const handleDonateGold = (amount: number) => {
    if (saveData.gold < amount) {
      alert('Insufficient gold wallet balance to make donation!');
      return;
    }

    updateSaveData(prev => ({
      ...prev,
      gold: prev.gold - amount,
      guildDonatedGold: (prev.guildDonatedGold || 0) + amount,
    }));

    setVaultGold(prev => prev + amount);
    alert(`Donated ${amount} Gold to the Alliance Citadel Vault!`);
  };

  return (
    <div id="guild-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px] font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-400 w-8 h-8 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              Guild Headquarters
            </h1>
            <p className="text-xs text-emerald-600">Assemble custom banners, raid citadel boss vaults, and conquer territories</p>
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
          onClick={() => setActiveTab('CREATOR')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'CREATOR'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          🎨 Banner Creator
        </button>
        <button
          onClick={() => setActiveTab('CITADEL')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'CITADEL'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          🏰 Citadel Raid & Buff Vault
        </button>
        <button
          onClick={() => setActiveTab('TERRITORIES')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'TERRITORIES'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          🗺 Alliance Territories
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left-Center Panel based on selection */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          {activeTab === 'CREATOR' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                🛡 Create Guild Crest Identity
              </h2>

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Visual Preview Banner */}
                <div className="flex flex-col items-center justify-center p-6 bg-neutral-950 border border-emerald-950 rounded-lg w-full sm:w-48 text-center aspect-square shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                  <div
                    className="w-24 h-28 rounded-b-2xl border-2 flex items-center justify-center text-4xl shadow-lg relative"
                    style={{ borderColor: selectedColor, color: selectedColor, backgroundColor: `${selectedColor}11` }}
                  >
                    {/* Top horns decoration */}
                    <div className="absolute top-0 w-2 h-2 rounded-full -mt-1 bg-white"></div>
                    <span>{selectedSymbol}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 mt-4 block truncate max-w-full font-bold uppercase">
                    {typedGuildName}
                  </span>
                </div>

                {/* Settings list */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Guild name input */}
                  <div className="font-mono text-xs">
                    <label className="text-emerald-700 block mb-1">ALLIANCE NAME:</label>
                    <input
                      type="text"
                      value={typedGuildName}
                      onChange={e => setTypedGuildName(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-950 border border-emerald-950 rounded p-2 text-emerald-300 font-mono uppercase tracking-wide font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Shield Frame Shape selection */}
                  <div className="font-mono text-xs">
                    <span className="text-emerald-700 block mb-1">SHIELD SHAPE FORM:</span>
                    <div className="flex flex-wrap gap-2">
                      {SHAPES.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedShape(s)}
                          className={`px-3 py-1.5 rounded border text-[10px] uppercase font-bold cursor-pointer transition ${
                            selectedShape === s
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                              : 'bg-neutral-950 border-emerald-950 text-emerald-700 hover:border-emerald-850'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div className="font-mono text-xs">
                    <span className="text-emerald-700 block mb-1">NEON ACCENT GRADIENT:</span>
                    <div className="flex gap-3">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer transition ${
                            selectedColor === c ? 'border-emerald-400 scale-110 shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Symbol selector */}
                  <div className="font-mono text-xs">
                    <span className="text-emerald-700 block mb-1">EMBEDDED ICON SYMBOL:</span>
                    <div className="flex gap-2">
                      {SYMBOLS.map(sym => (
                        <button
                          key={sym}
                          onClick={() => setSelectedSymbol(sym)}
                          className={`w-8 h-8 rounded border flex items-center justify-center text-sm cursor-pointer transition font-bold ${
                            selectedSymbol === sym ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-neutral-950 border-emerald-950 text-emerald-700 hover:border-emerald-850'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSaveBanner}
                className="mt-6 w-full py-3 bg-emerald-900 border border-emerald-500 hover:bg-emerald-700 text-white font-mono text-xs font-bold tracking-widest uppercase rounded cursor-pointer transition flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Plus className="w-4 h-4" /> Save Alliance Identity
              </button>
            </div>
          )}

          {activeTab === 'CITADEL' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                🏰 Weekly Raid Citadel Vault
              </h2>

              <p className="text-xs text-emerald-600 font-mono leading-relaxed mb-4">
                Contribute Gold to the alliance pool to buy passive global modifiers that directly assist you inside active tactical campaigns!
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs text-center">
                <div className="bg-neutral-950 p-4 rounded border border-emerald-950 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                  <span className="text-emerald-700 block font-bold uppercase">CITADEL COOP VAULT</span>
                  <span className="font-extrabold text-orange-400 text-lg mt-1 block">
                    {vaultGold.toLocaleString()}g
                  </span>
                </div>
                <div className="bg-neutral-950 p-4 rounded border border-emerald-950 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                  <span className="text-emerald-700 block font-bold uppercase">CONTRIBUTION STATS</span>
                  <span className="font-extrabold text-emerald-300 text-lg mt-1 block">
                    {saveData.guildDonatedGold ? saveData.guildDonatedGold.toLocaleString() : '0'}g
                  </span>
                </div>
              </div>

              {/* Buff list */}
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="p-3 bg-neutral-950/60 rounded border border-emerald-950/60 flex justify-between items-center">
                  <div>
                    <strong className="text-emerald-300 block">💰 Royal Treasury (+5% Gold Gain)</strong>
                    <span className="text-[10px] text-emerald-600">Global boost. Defeated targets drop extra gold coins.</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 bg-neutral-950/60 rounded border border-emerald-950/60 flex justify-between items-center">
                  <div>
                    <strong className="text-emerald-300 block">❤️ Life Infusion (+10% Summoned HP)</strong>
                    <span className="text-[10px] text-emerald-600">Unlocks Nature and Corpse allies with extra maximum health.</span>
                  </div>
                  <button
                    onClick={() => {
                      if (vaultGold >= 25000) {
                        setUnlockedBuffs(prev => [...prev, 'HP_BUFF']);
                        alert('Buff unlocked successfully!');
                      } else {
                        alert('Weekly Citadel pool needs 25,000g to buy this level!');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-950 hover:bg-emerald-500 hover:text-black border border-emerald-900 text-emerald-400 text-[10px] rounded font-bold cursor-pointer transition uppercase"
                  >
                    {unlockedBuffs.includes('HP_BUFF') ? 'ACTIVE' : 'BUY FOR 25k'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TERRITORIES' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                🗺 Alliance Territory Tactical Map
              </h2>

              <p className="text-xs text-emerald-600 font-mono leading-relaxed mb-4">
                Guild points earned from clearing campaign waves expand your alliance borders across sector nodes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {TERRITORIES.map(t => (
                  <div key={t.id} className="p-3 bg-neutral-950 border border-emerald-950 flex justify-between items-center shadow-[inset_0_0_5px_rgba(0,0,0,0.4)]">
                    <div>
                      <span className="text-emerald-300 block font-bold">{t.name}</span>
                      <span className="text-[10px] text-emerald-600 block uppercase mt-1">Held by: {t.faction}</span>
                    </div>
                    <span className={`text-xs font-extrabold font-mono text-emerald-400`}>{t.control}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Donation Deck */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
              🪙 Contributions Desk
            </h2>

            <div className="bg-neutral-950 p-4 rounded border border-emerald-950 text-center font-mono text-xs mb-4 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
              <span className="text-emerald-700 font-bold block uppercase">YOUR WALLET</span>
              <span className="font-extrabold text-orange-400 text-lg mt-1 block">
                {saveData.gold.toLocaleString()}g
              </span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <button
                onClick={() => handleDonateGold(500)}
                className="py-2.5 bg-neutral-950 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900 rounded cursor-pointer transition font-bold"
              >
                + Donate 500 Gold
              </button>
              <button
                onClick={() => handleDonateGold(1000)}
                className="py-2.5 bg-neutral-950 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900 rounded cursor-pointer transition font-bold animate-pulse"
              >
                + Donate 1,000 Gold
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              Crest and names synchronize inside the local browser storage file system, ensuring persistence across page refreshes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
