import React, { useState } from 'react';
import { SaveData } from '../types';
import { Award, Calendar, CheckSquare, Trophy, Star, Gem, HelpCircle } from 'lucide-react';

interface TrophyRoomProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  reward: number; // Gemma Shards reward
}

export default function TrophyRoom({ saveData, updateSaveData, onBack }: TrophyRoomProps) {
  const [activeTab, setActiveTab] = useState<'ACHIEVEMENTS' | 'CHECK_IN' | 'LEADERBOARD'>('ACHIEVEMENTS');

  // Hardcoded achievements in the Trophy Room
  const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'pyromaniac', name: 'Pyromaniac Flame', desc: 'Inflict 10,000 Flame Tower burn ticks on invaders', reward: 150 },
    { id: 'glacial_master', name: 'Glacial freeze', desc: 'Freeze 150 incoming enemies inside Frost slow rifts', reward: 150 },
    { id: 'necromancer', name: 'Lord of the Tomb', desc: 'Summon 500 Skeleton warriors on lane paths', reward: 200 },
    { id: 'survival_legend', name: 'Endless Vanguard', desc: 'Reach Wave 20 or higher in the Infinite Rift arena', reward: 300 },
    { id: 'weapon_master', name: 'Godly Architect', desc: 'Level any blueprint core to Max Level 50', reward: 250 },
    { id: 'coop_champion', name: 'Peer Synchronizer', desc: 'Complete 3 simulated online multiplayer network battles', reward: 200 },
  ];

  // Daily Quests Matrix
  const DAILY_QUESTS = [
    { id: 'q1', name: 'Clear 5 Waves on Stage 2', progress: '5 / 5', reward: '100 Shards', done: true },
    { id: 'q2', name: 'Cast 10 Ultimate Skills', progress: '4 / 10', reward: '150 Shards', done: false },
    { id: 'q3', name: 'Place 15 Lane Traps', progress: '12 / 15', reward: '120 Shards', done: false },
  ];

  // 7-Day calendar rewards list
  const CHECK_IN_DAYS = [
    { day: 1, rewardText: '100 Gold', claimed: true, rewardType: 'GOLD', val: 100 },
    { day: 2, rewardText: '150 Gold', claimed: false, rewardType: 'GOLD', val: 150 },
    { day: 3, rewardText: '50 Gemma Shards', claimed: false, rewardType: 'GEMMA', val: 50 },
    { day: 4, rewardText: '200 Gold', claimed: false, rewardType: 'GOLD', val: 200 },
    { day: 5, rewardText: '100 Gemma Shards', claimed: false, rewardType: 'GEMMA', val: 100 },
    { day: 6, rewardText: '300 Gold', claimed: false, rewardType: 'GOLD', val: 300 },
    { day: 7, rewardText: 'Mythic Token (300 Shards)', claimed: false, rewardType: 'GEMMA', val: 300 },
  ];

  // Claims consecutive daily login rewards
  const handleClaimCheckIn = (dayIndex: number) => {
    const day = CHECK_IN_DAYS[dayIndex];
    if (day.claimed) return;

    // We can only check in the day sequential to last (for simulation, let's allow claiming the first unclaimable day)
    const isPreviousClaimed = dayIndex === 0 || CHECK_IN_DAYS[dayIndex - 1].claimed;
    if (!isPreviousClaimed) {
      alert('You must claim previous login days sequentially!');
      return;
    }

    updateSaveData(prev => {
      const isGold = day.rewardType === 'GOLD';
      return {
        ...prev,
        gold: isGold ? prev.gold + day.val : prev.gold,
        gemmaShards: !isGold ? prev.gemmaShards + day.val : prev.gemmaShards,
        dailyLoginStreak: Math.max(prev.dailyLoginStreak, day.day),
      };
    });

    // Mark as claimed simulation
    day.claimed = true;
    alert(`Claimed Day ${day.day} reward: ${day.rewardText}!`);
  };

  // Mock global leaderboard
  const LEADERBOARD_LIST = [
    { rank: 1, name: 'VoidWalker_X', maxWave: 104, totalDamage: '4,281,000', map: 'Infinite Rift' },
    { rank: 2, name: 'SlayerGemma', maxWave: 88, totalDamage: '3,120,500', map: 'Infinite Rift' },
    { rank: 3, name: 'FlameLord99', maxWave: 71, totalDamage: '2,401,900', map: 'The Necrotic Citadel' },
    { rank: 4, name: 'BoneCrafter', maxWave: 65, totalDamage: '1,992,000', map: 'Infinite Rift' },
    { rank: 5, name: 'GlacialCoreTD', maxWave: 58, totalDamage: '1,560,000', map: 'The Obsidian Fissures' },
  ];

  return (
    <div id="trophy-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto font-mono bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-emerald-400 w-8 h-8 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              Achievements & Quest Deck
            </h1>
            <p className="text-xs text-emerald-600">Unlock trophies, claim daily checks, and review the global Hall of Fame</p>
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
          onClick={() => setActiveTab('ACHIEVEMENTS')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'ACHIEVEMENTS'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          🏆 Trophy Achievements
        </button>
        <button
          onClick={() => setActiveTab('CHECK_IN')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'CHECK_IN'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          📅 Daily Check-In Calendar
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'LEADERBOARD'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          ⚡ Global Hall of Fame
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: List of selections based on active Tab */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          {activeTab === 'ACHIEVEMENTS' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                🌟 Unlocked Trophies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {ACHIEVEMENTS_LIST.map(ach => {
                  const isClaimed = saveData.unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded border flex items-center gap-3 transition ${
                        isClaimed
                          ? 'bg-emerald-950/20 border-emerald-700 text-white'
                          : 'bg-neutral-950 border-emerald-950/40 text-emerald-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                          isClaimed ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-neutral-900 text-emerald-800 border-neutral-950'
                        }`}
                      >
                        🏅
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-bold truncate text-emerald-300">{ach.name}</div>
                        <div className="text-[10px] text-emerald-600 leading-snug mt-1 font-mono line-clamp-2">{ach.desc}</div>
                        <div className="text-[10px] text-emerald-400 font-mono font-semibold mt-2">
                          Reward: +{ach.reward} Gemma Shards
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'CHECK_IN' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                📆 7-Day Commander Login Grid
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {CHECK_IN_DAYS.map((day, idx) => {
                  // If current login streak is equal or greater than the day, it represents a simulation state
                  const isClaimed = saveData.dailyLoginStreak >= day.day;
                  const canClaim = saveData.dailyLoginStreak === day.day - 1;

                  return (
                    <button
                      key={day.day}
                      disabled={isClaimed}
                      onClick={() => handleClaimCheckIn(idx)}
                      className={`p-3 rounded border flex flex-col justify-between text-center transition cursor-pointer min-h-[140px] ${
                        isClaimed
                          ? 'bg-emerald-950/20 border-emerald-700 text-emerald-400 opacity-60'
                          : canClaim
                          ? 'bg-emerald-900/40 border-emerald-400 text-white animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-neutral-950 border-emerald-950/60 text-emerald-700 hover:border-emerald-900'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-emerald-700 block uppercase">DAY {day.day}</span>
                      <div className="text-2xl my-2">🎁</div>
                      <div>
                        <span className="text-[10px] font-mono font-bold leading-tight line-clamp-2">{day.rewardText}</span>
                        {isClaimed ? (
                          <span className="text-[8px] bg-emerald-900 text-emerald-400 font-mono px-1 rounded mt-2 block">CLAIMED</span>
                        ) : canClaim ? (
                          <span className="text-[8px] bg-emerald-400 text-black font-mono px-1 font-bold rounded mt-2 block animate-bounce">CLAIM NOW</span>
                        ) : (
                          <span className="text-[8px] bg-neutral-900 text-emerald-800 font-mono px-1 rounded mt-2 block">LOCKED</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'LEADERBOARD' && (
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                ⚡ Global Infinite Rift Rank Rankings
              </h2>

              <div className="flex flex-col gap-2 font-mono text-xs">
                {/* Header line */}
                <div className="grid grid-cols-12 text-emerald-700 border-b border-emerald-950 pb-2 px-3">
                  <div className="col-span-2">RANK</div>
                  <div className="col-span-4">COMMANDER</div>
                  <div className="col-span-3">MAX WAVE</div>
                  <div className="col-span-3 text-right">TOTAL DPS</div>
                </div>

                {LEADERBOARD_LIST.map(player => (
                  <div
                    key={player.rank}
                    className="grid grid-cols-12 bg-neutral-950/40 p-3 rounded border border-emerald-950/60 items-center px-3"
                  >
                    <div className="col-span-2 text-emerald-400 font-bold">#{player.rank}</div>
                    <div className="col-span-4 text-white font-bold">{player.name}</div>
                    <div className="col-span-3 text-emerald-300 font-bold">{player.maxWave}</div>
                    <div className="col-span-3 text-right text-emerald-500">{player.totalDamage}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Daily Quest checklist */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
            📋 Daily Commander Quests
          </h2>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {DAILY_QUESTS.map(q => (
              <div
                key={q.id}
                className={`p-3 rounded border flex flex-col justify-between ${
                  q.done ? 'bg-emerald-950/20 border-emerald-700' : 'bg-neutral-950 border border-emerald-950'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-bold ${q.done ? 'text-emerald-400 line-through' : 'text-emerald-300'}`}>
                    {q.name}
                  </span>
                  <span className="text-[10px] text-emerald-600">{q.progress}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-emerald-950/40 text-[10px]">
                  <span className="text-emerald-400">Reward: {q.reward}</span>
                  {q.done ? (
                    <span className="text-emerald-400 font-bold uppercase">SUCCESS</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold uppercase">ACTIVE</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              Quests are procedurally generated every session. Claiming completed quests awards shards and increases your local check-in progress.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
