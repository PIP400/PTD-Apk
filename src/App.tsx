import React, { useState, useEffect, useRef } from 'react';
import { GameView, SaveData, Stage, StageId, ElementType, TowerInstance, EnemyInstance, AllyInstance, Projectile, TrapInstance, Particle, WeatherType } from './types';
import { STAGES_DATA } from './data/stages';
import { ELEMENTS_DATA } from './data/elements';
import { BESTIARY_DATA } from './data/bestiary';
import { drawPixelSprite } from './utils/pixelArt';

// Subcomponents imports
import Compendium from './components/Compendium';
import GachaVault from './components/GachaVault';
import BlacksmithForge from './components/BlacksmithForge';
import TrophyRoom from './components/TrophyRoom';
import GuildHQ from './components/GuildHQ';
import MarketAuctionHouse from './components/MarketAuctionHouse';
import SandboxLevelEditor from './components/SandboxLevelEditor';
import NetworkLobbyHub from './components/NetworkLobbyHub';
import ParticleFXStudio from './components/ParticleFXStudio';

// Icons imports
import { Play, BookOpen, Star, Hammer, Shield, ShoppingBag, Edit3, Network, Trophy, Sparkles, Sliders, Flame, Snowflake, HelpCircle, FastForward, PlayCircle } from 'lucide-react';

const defaultSaveData: SaveData = {
  gold: 2500,
  gemmaShards: 800,
  unlockedTowers: ['FLAME', 'FROST', 'THUNDER'],
  weaponLevels: {
    FLAME: 1,
    FROST: 1,
    THUNDER: 1,
    POISON: 1,
    EARTH: 1,
    WIND: 1,
    WATER: 1,
    LIGHT: 1,
    DARK: 1,
    ARCANE: 1,
    NATURE_SUMMON: 1,
    CORPSE_SUMMON: 1,
  },
  fusedTowers: {} as Record<ElementType, boolean>,
  activeRelics: [],
  unlockedAchievements: [],
  completedDailyQuests: [],
  dailyLoginStreak: 1,
  lastLoginDate: '',
  guildName: 'COSMIC VANGUARDS',
  guildCrest: JSON.stringify({ shape: 'COSMIC_SHIELD', color: '#00E5FF', symbol: '⚔' }),
  guildDonatedGold: 0,
  customMapJson: '',
  redeemedCodes: [],
};

const defaultFxConfig = {
  emissionCount: 60,
  trailDuration: 350,
  decaySpeed: 1,
  gravity: 0,
  flameColor: '#FF5722',
  frostColor: '#00BCD4',
  thunderColor: '#FFEB3B',
};

export default function App() {
  const [currentView, setCurrentView] = useState<GameView>('MAIN_MENU');
  
  // Persistence state
  const [saveData, setSaveData] = useState<SaveData>(() => {
    try {
      const raw = localStorage.getItem('pixel_td_savedata');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultSaveData;
  });

  // Particle mod configs state
  const [fxConfig, setFxConfig] = useState(() => {
    try {
      const raw = localStorage.getItem('pixel_td_fxconfig');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultFxConfig;
  });

  // State sync persistence helpers
  const handleUpdateSaveData = (updater: (prev: SaveData) => SaveData) => {
    setSaveData(prev => {
      const next = updater(prev);
      localStorage.setItem('pixel_td_savedata', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('pixel_td_fxconfig', JSON.stringify(fxConfig));
  }, [fxConfig]);

  // Gift Codes Redemption Engine
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = codeInputValue.trim().toLowerCase();
    if (!cleanCode) return;

    const redeemed = saveData.redeemedCodes || [];
    if (redeemed.includes(cleanCode)) {
      setCodeFeedback({ message: 'CODE ALREADY REDEEMED!', type: 'error' });
      return;
    }

    let goldReward = 0;
    let unlockCorpseSummoner = false;
    let successMessage = '';

    if (cleanCode === 'abc') {
      goldReward = 200;
      successMessage = 'SUCCESS! CLAIMED +200 FORGE GOLD.';
    } else if (cleanCode === '123') {
      goldReward = 500;
      successMessage = 'SUCCESS! CLAIMED +500 FORGE GOLD.';
    } else if (cleanCode === '000') {
      goldReward = 1000;
      successMessage = 'SUCCESS! CLAIMED +1000 FORGE GOLD.';
    } else if (cleanCode === 'kingscard') {
      goldReward = 1000000;
      unlockCorpseSummoner = true;
      successMessage = 'LEGENDARY CODE! +1,000,000 GOLD & CORPSE SUMMONER UNLOCKED!';
    } else {
      setCodeFeedback({ message: 'INVALID DECK CODE!', type: 'error' });
      return;
    }

    handleUpdateSaveData(prev => {
      const updatedTowers = [...prev.unlockedTowers];
      if (unlockCorpseSummoner && !updatedTowers.includes('CORPSE_SUMMON')) {
        updatedTowers.push('CORPSE_SUMMON');
      }
      return {
        ...prev,
        gold: prev.gold + goldReward,
        unlockedTowers: updatedTowers,
        redeemedCodes: [...(prev.redeemedCodes || []), cleanCode],
      };
    });

    setCodeInputValue('');
    setCodeFeedback({ message: successMessage, type: 'success' });
  };

  // Active game play variables state
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES_DATA.reck_grasslands);
  const [lives, setLives] = useState(20);
  const [gameGold, setGameGold] = useState(400);
  const [gameMana, setGameMana] = useState(100);
  const [currentWave, setCurrentWave] = useState(0);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1); // 1x or 2x speed

  // Ultimate spell cool downs
  const [ultimateCooldowns, setUltimateCooldowns] = useState({
    METEOR: 0,
    FREEZE: 0,
    NUKE: 0,
  });

  // Active build selectors
  const [selectedBuildType, setSelectedBuildType] = useState<ElementType | 'TRAP_SPIKES' | 'TRAP_TAR' | 'TRAP_MINE' | null>(null);
  const [selectedActiveTower, setSelectedActiveTower] = useState<TowerInstance | null>(null);

  // Core gameplay arrays refs (uncontrolled to avoid re-render delays inside 60FPS loop)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Entities cache
  const towersRef = useRef<TowerInstance[]>([]);
  const enemiesRef = useRef<EnemyInstance[]>([]);
  const alliesRef = useRef<AllyInstance[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const trapsRef = useRef<TrapInstance[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCounterRef = useRef<number>(0);

  // Weather loop
  const [weatherType, setWeatherType] = useState<WeatherType>('CLEAR');
  const weatherTimerRef = useRef<number>(1800); // changes every 30 seconds (1800 frames at 60fps)

  // Roguelike Boon drafting card selection modal
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftCards, setDraftCards] = useState<{ id: string; title: string; boon: string; curse: string }[]>([]);

  // Peer co-op visual alerts
  const [coopMessage, setCoopMessage] = useState<string | null>(null);

  // Set up custom sandbox stage if cached in save profiles
  useEffect(() => {
    if (saveData.customMapJson) {
      try {
        const parsed = JSON.parse(atob(saveData.customMapJson));
        if (parsed.mapGrid && parsed.lanes) {
          const customStage: Stage = {
            id: 'custom_map',
            name: 'Sandbox Realm',
            description: 'Your self-engineered lane configuration layout.',
            lanes: parsed.lanes,
            mapGrid: parsed.mapGrid,
            enemySpeedMultiplier: 1.0,
            baseGold: 500,
            baseMana: 150,
          };
          STAGES_DATA.custom_map = customStage;
        }
      } catch (e) {}
    }
  }, [saveData.customMapJson]);

  // Launch active stage campaign gameplay
  const handleLaunchGame = (stage: Stage) => {
    setSelectedStage(stage);
    setLives(20);
    setGameGold(stage.baseGold);
    setGameMana(stage.baseMana);
    setCurrentWave(0);
    setIsWaveActive(false);
    setSelectedBuildType(null);
    setSelectedActiveTower(null);

    // Wipe cached loops
    towersRef.current = [];
    enemiesRef.current = [];
    alliesRef.current = [];
    projectilesRef.current = [];
    trapsRef.current = [];
    particlesRef.current = [];
    frameCounterRef.current = 0;
    weatherTimerRef.current = 1800;
    setWeatherType('CLEAR');

    setCurrentView('GAMEPLAY');
  };

  // Launch simulated co-op matchmaking mode
  const handleLaunchSimulatedMultiplayer = (mode: 'CO_OP' | 'PVP') => {
    const stage = STAGES_DATA.reck_grasslands;
    handleLaunchGame(stage);
    
    setTimeout(() => {
      setCoopMessage(mode === 'CO_OP' ? '👥 ALLY PEER JOINED DECK!' : '⚔️ PVP CHALLENGER ESTABLISHED!');
      setTimeout(() => setCoopMessage(null), 4000);
    }, 2000);
  };

  // Triggers Wave Draft selector between rounds
  const triggerWaveDraft = () => {
    const pool = [
      { id: '1', title: 'Solar Flare Surge', boon: '+2 Mana regen rate', curse: 'Nature sumoners disabled' },
      { id: '2', title: 'Volcanic Core', boon: 'Flame tower attack +30% damage', curse: 'Frost slow rate cut in half' },
      { id: '3', title: 'Necrotic Deal', boon: 'Skeletal guardians gain +40 Max HP', curse: 'Enemies move +10% faster' },
      { id: '4', title: 'Storm Overdrive', boon: 'Thunder bolt chains bounce twice', curse: 'Placing cost is +20% gold' },
    ];
    // Pick 2 random cards
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setDraftCards(shuffled.slice(0, 2));
    setShowDraftModal(true);
  };

  // Spawns progressive monster waves on lanes
  const handleSpawnNextWave = () => {
    if (isWaveActive) return;

    const nextWaveNum = currentWave + 1;
    setCurrentWave(nextWaveNum);
    setIsWaveActive(true);

    // Determine enemy spawns based on active wave
    const waveEnemies: string[] = [];

    if (nextWaveNum === 1) {
      waveEnemies.push('goblin', 'goblin', 'skeleton', 'skeleton', 'dark_mage', 'goblin_chief');
    } else if (nextWaveNum === 2) {
      waveEnemies.push('orc_warrior', 'orc_warrior', 'undead_archer', 'shadow_assassin', 'death_knight');
    } else if (nextWaveNum === 3) {
      waveEnemies.push('ogre_brute', 'ogre_brute', 'bone_wizard', 'void_stalker', 'dread_lord');
    } else {
      // Endless Scaling randomized waves
      const pool = ['goblin', 'skeleton', 'dark_mage', 'orc_warrior', 'undead_archer', 'shadow_assassin', 'ogre_brute', 'bone_wizard', 'void_stalker'];
      for (let i = 0; i < 5 + nextWaveNum * 2; i++) {
        waveEnemies.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      if (nextWaveNum % 3 === 0) {
        waveEnemies.push('dread_lord');
      }
    }

    // Spawn them with staggered coordinate node entries
    waveEnemies.forEach((type, idx) => {
      const stats = BESTIARY_DATA[type] || BESTIARY_DATA['goblin'];
      // Support dual lanes for stages with multiple paths
      const laneIndex = idx % selectedStage.lanes.length;
      const startNode = selectedStage.lanes[laneIndex][0];

      // Convert grid node index into standard pixel coordinates center
      const startPx = startNode.x * 50 + 25;
      const startPy = startNode.y * 50 + 25;

      const scale = 1.0 + (nextWaveNum - 1) * 0.15; // +15% HP per wave level

      enemiesRef.current.push({
        id: `enemy_${Date.now()}_${idx}`,
        type,
        name: stats.name,
        hp: Math.round(stats.maxHp * scale),
        maxHp: Math.round(stats.maxHp * scale),
        dmg: stats.dmg,
        speed: stats.speedVal,
        originalSpeed: stats.speedVal,
        ability: stats.ability,
        x: startPx - idx * 40, // Stagger horizontal entrance spacing
        y: startPy,
        laneIndex,
        nodeIndex: 0,
        distanceTraveled: 0,
        isBoss: type.includes('chief') || type.includes('knight') || type.includes('lord'),
        isStealth: type === 'void_stalker',
        stealthTimer: type === 'void_stalker' ? 180 : 0,
        shieldHp: type === 'orc_warrior' ? 100 : 0,
        hitFlashTimer: 0,
        hitFlashColor: null,
        burnDuration: 0,
        burnDmg: 0,
        slowDuration: 0,
        slowMult: 1,
        stunDuration: 0,
        poisonDuration: 0,
        poisonStacks: 0,
        soakedDuration: 0,
        vortexDuration: 0,
        vortexCenter: { x: 0, y: 0 },
        animFrame: 0,
        animTimer: 0,
        width: 32,
        height: 32,
      });
    });
  };

  // Triggers Ultimate Spells
  const handleCastUltimate = (spell: 'METEOR' | 'FREEZE' | 'NUKE') => {
    let manaCost = 50;
    if (spell === 'METEOR') manaCost = 60;
    if (spell === 'NUKE') manaCost = 80;

    if (gameMana < manaCost) {
      alert('Insufficient Mana reservoir points to cast this cosmic spell!');
      return;
    }

    setGameMana(prev => prev - manaCost);

    // Apply immediate spell impact on active enemies in list
    if (spell === 'METEOR') {
      enemiesRef.current.forEach(enemy => {
        enemy.hp -= 200;
        enemy.hitFlashTimer = 15;
        enemy.hitFlashColor = 'red';

        // Spawn dramatic particle bursts
        for (let i = 0; i < 15; i++) {
          particlesRef.current.push({
            id: `p_meteor_${Date.now()}_${Math.random()}`,
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 4,
            color: '#FF1744',
            size: 5,
            life: 0,
            maxLife: 30,
          });
        }
      });
      alert('☄️ PYROCLASTIC METEOR CLEARED LENTICULAR LANES!');
    } else if (spell === 'FREEZE') {
      enemiesRef.current.forEach(enemy => {
        enemy.slowDuration = 300; // Freeze slow for 5 seconds (300 frames)
        enemy.slowMult = 0.2; // Slow to crawl speed
        enemy.hitFlashTimer = 20;
        enemy.hitFlashColor = 'white';
      });
      alert('❄️ GLACIAL STASIS INDUCED DEEP FROST FOR 5 SECONDS!');
    } else if (spell === 'NUKE') {
      enemiesRef.current.forEach(enemy => {
        enemy.hp -= 350;
        enemy.poisonDuration = 300;
        enemy.poisonStacks = 5;
        enemy.hitFlashTimer = 25;
        enemy.hitFlashColor = 'red';
      });
      alert('☢️ TACTICAL ATOMIC ACCELERATION MUTATED PATH ALIGNMENTS!');
    }
  };

  // Game ticks runner inside requestAnimationFrame
  useEffect(() => {
    if (currentView !== 'GAMEPLAY') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 16;
    const rows = 12;
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    const gameTick = () => {
      if (gamePaused) {
        gameLoopRef.current = requestAnimationFrame(gameTick);
        return;
      }

      // Execute logic up to gameSpeed multipliers (1x or 2x)
      for (let speedCycle = 0; speedCycle < gameSpeed; speedCycle++) {
        frameCounterRef.current++;

        // 1. Weather ticks
        weatherTimerRef.current--;
        if (weatherTimerRef.current <= 0) {
          weatherTimerRef.current = 1800; // 30 seconds
          const list: WeatherType[] = ['CLEAR', 'HEATWAVE', 'BLIZZARD', 'ACID_RAIN', 'TEMPEST'];
          setWeatherType(list[Math.floor(Math.random() * list.length)]);
        }

        // 2. Slow Mana regen
        if (frameCounterRef.current % 30 === 0) {
          const manaRegenRate = weatherType === 'TEMPEST' ? 2 : 1;
          setGameMana(prev => Math.min(200, prev + manaRegenRate));
        }

        // 3. Move Enemies & Ticks status effects
        enemiesRef.current.forEach(enemy => {
          // Status slow decrement
          if (enemy.slowDuration > 0) {
            enemy.slowDuration--;
            enemy.speed = enemy.originalSpeed * enemy.slowMult;
          } else {
            enemy.speed = enemy.originalSpeed;
          }

          // Weather slowing modifier
          if (weatherType === 'BLIZZARD') {
            enemy.speed *= 0.7; // blizzard slow
          } else if (weatherType === 'HEATWAVE') {
            enemy.speed *= 1.25; // heatwave rush!
          }

          // Stun ticks
          if (enemy.stunDuration > 0) {
            enemy.stunDuration--;
            enemy.speed = 0;
          }

          // Damage flash decay
          if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer--;

          // Poison damage stacks
          if (enemy.poisonDuration > 0) {
            enemy.poisonDuration--;
            if (frameCounterRef.current % 20 === 0) {
              enemy.hp -= enemy.poisonStacks * 3;
              enemy.hitFlashTimer = 5;
              enemy.hitFlashColor = 'red';
            }
          }

          // Burn damage stacks
          if (enemy.burnDuration > 0) {
            enemy.burnDuration--;
            if (frameCounterRef.current % 15 === 0) {
              enemy.hp -= enemy.burnDmg;
              enemy.hitFlashTimer = 5;
              enemy.hitFlashColor = 'red';
            }
          }

          // Movement logic along stage lanes waypoints coords
          const lane = selectedStage.lanes[enemy.laneIndex];
          if (enemy.nodeIndex < lane.length - 1) {
            const currentWaypoint = lane[enemy.nodeIndex];
            const nextWaypoint = lane[enemy.nodeIndex + 1];

            const targetPx = nextWaypoint.x * 50 + 25;
            const targetPy = nextWaypoint.y * 50 + 25;

            const dx = targetPx - enemy.x;
            const dy = targetPy - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < Math.max(1, enemy.speed)) {
              // Snap and step up to next node waypoint
              enemy.x = targetPx;
              enemy.y = targetPy;
              enemy.nodeIndex++;
            } else {
              // Move vector forward
              enemy.x += (dx / distance) * enemy.speed;
              enemy.y += (dy / distance) * enemy.speed;
            }
            enemy.distanceTraveled += enemy.speed;
          } else {
            // Reached core gem spire! Deduct lives
            setLives(prev => {
              const next = Math.max(0, prev - 1);
              if (next === 0) {
                // Game Over trigger
                alert('💥 THE DEFENSE CORE HAS BEEN OVERRUN! GAME OVER!');
                setCurrentView('MAIN_MENU');
              }
              return next;
            });
            // Eliminate from active game
            enemy.hp = -100;
          }
        });

        // Filter dead enemies and distribute gold/gems awards
        enemiesRef.current = enemiesRef.current.filter(enemy => {
          if (enemy.hp <= 0 && enemy.hp > -100) {
            const goldAward = enemy.isBoss ? 150 : 25;
            setGameGold(g => g + goldAward);
            return false;
          }
          return enemy.hp > 0;
        });

        // Check if wave is fully cleared
        if (isWaveActive && enemiesRef.current.length === 0) {
          setIsWaveActive(false);
          // Trigger reward triggers and achievements
          handleUpdateSaveData(prev => ({
            ...prev,
            gold: prev.gold + 100, // Caches +100 gold globally per cleared wave
          }));

          triggerWaveDraft();
        }

        // 4. Tower Attacks ticks
        towersRef.current.forEach(tower => {
          if (tower.timer > 0) {
            tower.timer--;
            return;
          }

          // Scan closest walkable targets
          const inRangeEnemies = enemiesRef.current.filter(enemy => {
            const dx = enemy.x - tower.px;
            const dy = enemy.y - tower.py;
            return Math.sqrt(dx * dx + dy * dy) <= tower.range;
          });

          if (inRangeEnemies.length > 0) {
            // Sort by target modes first/last/weakest/strongest
            let target = inRangeEnemies[0];
            if (tower.targetMode === 'STRONG') {
              inRangeEnemies.sort((a, b) => b.hp - a.hp);
              target = inRangeEnemies[0];
            } else if (tower.targetMode === 'LAST') {
              inRangeEnemies.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
              target = inRangeEnemies[0];
            }

            // Nature & Corpse summoners spawn friendly mobile units rather than firing standard orbs
            if (tower.type === 'NATURE_SUMMON' || tower.type === 'CORPSE_SUMMON') {
              if (alliesRef.current.length < 8) {
                // Find random nearby dirt path block to deploy ally spire on
                alliesRef.current.push({
                  id: `ally_${Date.now()}_${Math.random()}`,
                  name: tower.type === 'NATURE_SUMMON' ? 'Forest Guardian' : 'Skeleton Defender',
                  type: tower.type === 'NATURE_SUMMON' ? 'FOREST_WARRIOR' : 'SKELETON_WARRIOR',
                  hp: 150,
                  maxHp: 150,
                  damage: 20,
                  x: tower.px + (Math.random() - 0.5) * 60,
                  y: tower.py + (Math.random() - 0.5) * 60,
                  spawnX: tower.px,
                  spawnY: tower.py,
                  cooldown: 40,
                  timer: 0,
                  range: 40,
                  isNature: tower.type === 'NATURE_SUMMON',
                  hitFlashTimer: 0,
                  animFrame: 0,
                  animTimer: 0,
                  targetEnemyId: null,
                });
              }
              tower.timer = tower.cooldown;
            } else {
              // Regular towers shoot animated projectiles
              projectilesRef.current.push({
                id: `proj_${Date.now()}_${Math.random()}`,
                type: 'BASIC_BULLET',
                x: tower.px,
                y: tower.py,
                targetX: target.x,
                targetY: target.y,
                targetEnemyId: target.id,
                speed: 6,
                damage: tower.damage,
                elementType: tower.type,
                color: tower.type === 'FLAME' ? fxConfig.flameColor : tower.type === 'FROST' ? fxConfig.frostColor : tower.type === 'THUNDER' ? fxConfig.thunderColor : '#FFFFFF',
                bounceCount: 0,
                bouncedEnemyIds: [],
                angle: Math.atan2(target.y - tower.py, target.x - tower.px),
                size: 8,
                trail: [],
                isUltimate: tower.isGodly,
              });
              tower.timer = tower.cooldown;
            }
          }
        });

        // 5. Ticks Projectiles movement & collision checks
        projectilesRef.current.forEach(proj => {
          let target = enemiesRef.current.find(e => e.id === proj.targetEnemyId);
          if (!target && enemiesRef.current.length > 0) {
            target = enemiesRef.current[0]; // re-aim if previous target died
          }

          if (target) {
            proj.targetX = target.x;
            proj.targetY = target.y;
          }

          const dx = proj.targetX - proj.x;
          const dy = proj.targetY - proj.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= proj.speed) {
            // Collision Impact! Deal damage and trigger status effects
            if (target) {
              const baseDmg = proj.damage;
              
              // Apply elemental specific status debuffs
              if (proj.elementType === 'FLAME') {
                target.burnDuration = 180; // 3 seconds
                target.burnDmg = 8;
                target.hp -= baseDmg;
              } else if (proj.elementType === 'FROST') {
                target.slowDuration = 120; // 2 seconds
                target.slowMult = 0.5;
                target.hp -= baseDmg;
              } else if (proj.elementType === 'THUNDER') {
                // Chain lightning chain bouncing simulation
                target.hp -= baseDmg;
                if (proj.bounceCount < 3) {
                  const unhitEnemy = enemiesRef.current.find(e => e.id !== target?.id && !proj.bouncedEnemyIds.includes(e.id));
                  if (unhitEnemy) {
                    proj.x = target.x;
                    proj.y = target.y;
                    proj.targetEnemyId = unhitEnemy.id;
                    proj.bounceCount++;
                    proj.bouncedEnemyIds.push(target.id);
                  }
                }
              } else {
                target.hp -= baseDmg;
              }

              target.hitFlashTimer = 10;
              target.hitFlashColor = 'white';

              // Launch customized visual mod particles!
              const particleColor = proj.color;
              for (let pIdx = 0; pIdx < Math.round(fxConfig.emissionCount / 3); pIdx++) {
                particlesRef.current.push({
                  id: `p_impact_${Date.now()}_${Math.random()}`,
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5 - 1,
                  color: particleColor,
                  size: 3 + Math.random() * 3,
                  life: 0,
                  maxLife: Math.round(fxConfig.trailDuration / 10),
                  gravity: fxConfig.gravity,
                });
              }
            }
            proj.x = proj.targetX;
            proj.y = proj.targetY;
          } else {
            // Flight movement
            proj.x += (dx / distance) * proj.speed;
            proj.y += (dy / distance) * proj.speed;
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 5) proj.trail.shift();
          }
        });

        // Filter collided projectiles
        projectilesRef.current = projectilesRef.current.filter(p => p.x !== p.targetX || p.y !== p.targetY);

        // 6. Ally summon melee battles
        alliesRef.current.forEach(ally => {
          let target = enemiesRef.current.find(e => e.id === ally.targetEnemyId);
          if (!target) {
            // Lock closest enemy
            const sorted = [...enemiesRef.current].sort((a, b) => {
              const distA = Math.sqrt((a.x - ally.x) ** 2 + (a.y - ally.y) ** 2);
              const distB = Math.sqrt((b.x - ally.x) ** 2 + (b.y - ally.y) ** 2);
              return distA - distB;
            });
            if (sorted.length > 0 && Math.sqrt((sorted[0].x - ally.x) ** 2 + (sorted[0].y - ally.y) ** 2) <= 80) {
              target = sorted[0];
              ally.targetEnemyId = target.id;
            }
          }

          if (target) {
            const dx = target.x - ally.x;
            const dy = target.y - ally.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 15) {
              // Walk towards enemy
              ally.x += (dx / distance) * 1.5;
              ally.y += (dy / distance) * 1.5;
            } else {
              // Attack!
              if (ally.timer <= 0) {
                target.hp -= ally.damage;
                target.hitFlashTimer = 8;
                target.hitFlashColor = 'white';
                ally.timer = ally.cooldown;

                // Enemy counterattacks summoner
                ally.hp -= target.dmg / 2;
                ally.hitFlashTimer = 10;
              }
            }
          }

          if (ally.timer > 0) ally.timer--;
          if (ally.hitFlashTimer > 0) ally.hitFlashTimer--;
        });

        // Filter deceased allies
        alliesRef.current = alliesRef.current.filter(a => a.hp > 0);

        // 7. Decay particles
        particlesRef.current = particlesRef.current
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + (p.gravity || 0) * 0.1,
            life: p.life + 1,
          }))
          .filter(p => p.life < p.maxLife);
      }

      // --- RENDER SCREEN SECTION ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid tiles backdrops
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = selectedStage.mapGrid[r][c];
          
          if (val === 0) {
            ctx.fillStyle = '#181b25'; // Dirt path corridor
          } else if (val === 1) {
            ctx.fillStyle = '#0a0d14'; // Grass build grid
          } else if (val === 2) {
            ctx.fillStyle = '#2d1616'; // Obstacle rocks block
          } else if (val === 3) {
            ctx.fillStyle = '#0b0c15'; // Portal zone
          } else if (val === 4) {
            ctx.fillStyle = '#0b0c15'; // Spire zone
          }

          ctx.fillRect(c * tileW, r * tileH, tileW, tileH);

          // Grid line accents
          ctx.strokeStyle = '#121722';
          ctx.lineWidth = 1;
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        }
      }

      // Draw path highlights (textured portals)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = selectedStage.mapGrid[r][c];
          if (val === 3) {
            ctx.fillStyle = '#311054';
            ctx.beginPath();
            ctx.arc(c * tileW + 25, r * tileH + 25, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('PORTAL', c * tileW + 11, r * tileH + 28);
          } else if (val === 4) {
            ctx.fillStyle = '#0f4435';
            ctx.fillRect(c * tileW + 5, r * tileH + 5, tileW - 10, tileH - 10);
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('CORE', c * tileW + 15, r * tileH + 28);
          }
        }
      }

      // Render Active traps on pathways
      trapsRef.current.forEach(t => {
        ctx.save();
        ctx.shadowBlur = 8;
        if (t.type === 'TAR_BOG') {
          ctx.fillStyle = '#1c1917';
          ctx.shadowColor = '#44403c';
        } else if (t.type === 'SPIKED_PIT') {
          ctx.fillStyle = '#4b5563';
          ctx.shadowColor = '#9ca3af';
        } else {
          ctx.fillStyle = '#4c1d95';
          ctx.shadowColor = '#8b5cf6';
        }
        ctx.fillRect(t.x * tileW + 5, t.y * tileH + 5, tileW - 10, tileH - 10);
        ctx.restore();
      });

      // Render Allies Summons on path
      alliesRef.current.forEach(ally => {
        drawPixelSprite(
          ctx,
          ally.isNature ? 'forest_warrior' : 'skeleton',
          ally.x,
          ally.y,
          24,
          1,
          frameCounterRef.current,
          ally.hitFlashTimer,
          'white'
        );

        // HP Bar
        ctx.fillStyle = '#000000';
        ctx.fillRect(ally.x - 10, ally.y - 20, 20, 3);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(ally.x - 10, ally.y - 20, 20 * (ally.hp / ally.maxHp), 3);
      });

      // Render Placed towers
      towersRef.current.forEach(tower => {
        // Draw standard spire using pixel engine
        drawPixelSprite(
          ctx,
          tower.type,
          tower.px,
          tower.py + 15,
          32,
          1,
          frameCounterRef.current,
          0,
          null
        );

        // Upgraded Level numbers display stars
        ctx.fillStyle = '#eab308';
        ctx.font = '10px monospace';
        ctx.fillText('★'.repeat(tower.level), tower.px - 14, tower.py - 18);

        // Highlight active clicked tower
        if (selectedActiveTower && selectedActiveTower.id === tower.id) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(tower.px, tower.py, tower.range, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Render Walking Enemies & boss overlays
      enemiesRef.current.forEach(enemy => {
        // Face moving vector directions
        const direction = enemy.speed >= 0 ? 1 : -1;

        drawPixelSprite(
          ctx,
          enemy.type,
          enemy.x,
          enemy.y + 12,
          enemy.isBoss ? 44 : 32,
          direction as any,
          frameCounterRef.current,
          enemy.hitFlashTimer,
          enemy.hitFlashColor
        );

        // Standard floating HP Bar
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x - 16, enemy.y - 22, 32, 4);
        ctx.fillStyle = enemy.isBoss ? '#f43f5e' : '#eab308';
        ctx.fillRect(enemy.x - 16, enemy.y - 22, 32 * (enemy.hp / enemy.maxHp), 4);

        // Show status indicators above bar
        if (enemy.slowDuration > 0) {
          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('FREEZE', enemy.x - 15, enemy.y - 28);
        } else if (enemy.burnDuration > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('BURN', enemy.x - 10, enemy.y - 28);
        }
      });

      // Render Projectiles flight and trail paths
      projectilesRef.current.forEach(proj => {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = proj.color;
        ctx.fillStyle = proj.color;

        // Draw trail lines
        if (proj.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = `${proj.color}44`;
          ctx.lineWidth = 2;
          ctx.moveTo(proj.trail[0].x, proj.trail[0].y);
          for (let i = 1; i < proj.trail.length; i++) {
            ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
          }
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.isUltimate ? 8 : 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Particle explosions
      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw screen-wide Weather visualizers storms particles
      if (weatherType === 'BLIZZARD') {
        ctx.fillStyle = '#ffffff11'; // cold haze
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#e0f2fe';
        for (let i = 0; i < 6; i++) {
          const randX = (Math.random() * canvas.width);
          const randY = (Math.random() * canvas.height);
          ctx.fillRect(randX, randY, 2, 2);
        }
      } else if (weatherType === 'ACID_RAIN') {
        ctx.fillStyle = '#a3e6350f'; // green corrosion acid mist
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#a3e63555';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const randX = Math.random() * canvas.width;
          ctx.beginPath();
          ctx.moveTo(randX, 0);
          ctx.lineTo(randX - 20, 600);
          ctx.stroke();
        }
      } else if (weatherType === 'HEATWAVE') {
        ctx.fillStyle = '#f973160a'; // solar heat flare
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      gameLoopRef.current = requestAnimationFrame(gameTick);
    };

    gameLoopRef.current = requestAnimationFrame(gameTick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [currentView, selectedStage, weatherType, gamePaused, gameSpeed, fxConfig]);

  // Click on active gameplay canvas coordinates places towers or select stats
  const handleGameplayCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cols = 16;
    const rows = 12;
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    const colIndex = Math.floor(clickX / tileW);
    const rowIndex = Math.floor(clickY / tileH);

    // Grid sanity bound checks
    if (rowIndex < 0 || rowIndex >= rows || colIndex < 0 || colIndex >= cols) return;

    const cellVal = selectedStage.mapGrid[rowIndex][colIndex];

    // Check if clicking on an already built tower
    const existingTower = towersRef.current.find(t => t.x === colIndex && t.y === rowIndex);
    if (existingTower) {
      setSelectedActiveTower(existingTower);
      return;
    }

    // Place a new element tower
    if (selectedBuildType && cellVal === 1) {
      // Placing traps is path-bound
      if (selectedBuildType.toString().startsWith('TRAP_')) return;

      const stats = ELEMENTS_DATA[selectedBuildType as ElementType];
      if (!stats) return;

      if (gameGold < stats.cost) {
        alert('Insufficient gold coins to place this elemental spire!');
        return;
      }

      const forgeLevel = saveData.weaponLevels[selectedBuildType as ElementType] || 1;
      const isItemFusedGodly = saveData.fusedTowers[selectedBuildType as ElementType] || false;

      // Deduct gold
      setGameGold(g => g - stats.cost);

      // Instantiates tower spire stats based on levels forged in weapon anvil
      const damageMultiplier = 1.0 + forgeLevel * 0.05;
      const rangeMultiplier = 1.0 + forgeLevel * 0.01;

      towersRef.current.push({
        id: `tower_${Date.now()}`,
        type: selectedBuildType as ElementType,
        x: colIndex,
        y: rowIndex,
        px: colIndex * tileW + 25,
        py: rowIndex * tileH + 10,
        level: 1,
        damage: Math.round(stats.damage * damageMultiplier),
        range: Math.round(stats.range * rangeMultiplier),
        cooldown: stats.cooldown,
        timer: 0,
        isGodly: isItemFusedGodly,
        targetMode: 'FIRST',
        animFrame: 0,
        animTimer: 0,
      });

      setSelectedBuildType(null);
      alert(`Placed ${stats.name}! Stats enhanced by forge Blueprint Level: ${forgeLevel}.`);
    } else if (selectedBuildType && selectedBuildType.toString().startsWith('TRAP_') && cellVal === 0) {
      // Instantiates active lane traps (tar bogs, spiked pits)
      let trapCost = 50;
      if (gameGold < trapCost) {
        alert('Insufficient gold wallet balance to list trap!');
        return;
      }

      setGameGold(g => g - trapCost);

      const trapRole = selectedBuildType === 'TRAP_TAR' ? 'TAR_BOG' : selectedBuildType === 'TRAP_SPIKES' ? 'SPIKED_PIT' : 'ARCANE_MINES';
      trapsRef.current.push({
        id: `trap_${Date.now()}`,
        type: trapRole as any,
        x: colIndex,
        y: rowIndex,
        px: colIndex * tileW + 25,
        py: rowIndex * tileH + 25,
        cost: trapCost,
        charges: 5,
      });

      setSelectedBuildType(null);
      alert(`Instantiated custom lane trap blocker at coordinates: [Col ${colIndex}, Row ${rowIndex}]!`);
    } else {
      setSelectedActiveTower(null);
    }
  };

  // Upgrades tower inside active gameplay session (Max level 5 stats multipliers)
  const handleUpgradePlacedTower = () => {
    if (!selectedActiveTower) return;
    if (selectedActiveTower.level >= 5) {
      alert('Tower spire is already fully maxed inside active level camp!');
      return;
    }

    const upgradeFee = selectedActiveTower.level * 150 + 100;
    if (gameGold < upgradeFee) {
      alert('Insufficient gold wallet balance to level up spire!');
      return;
    }

    setGameGold(g => g - upgradeFee);

    selectedActiveTower.level++;
    selectedActiveTower.damage = Math.round(selectedActiveTower.damage * 1.3);
    selectedActiveTower.range = Math.round(selectedActiveTower.range * 1.15);

    // Forces re-render state
    setSelectedActiveTower({ ...selectedActiveTower });
    alert(`Upgraded tower spire successfully to Level ${selectedActiveTower.level}!`);
  };

  const handleSellPlacedTower = () => {
    if (!selectedActiveTower) return;
    const rebate = Math.round(ELEMENTS_DATA[selectedActiveTower.type].cost * 0.6);
    setGameGold(g => g + rebate);

    // Remove from active towers cache
    towersRef.current = towersRef.current.filter(t => t.id !== selectedActiveTower.id);
    setSelectedActiveTower(null);
    alert(`Sold spire tower! Gold wallet refunded +${rebate}g.`);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-emerald-500 select-none overflow-hidden font-mono border-4 border-emerald-900/80 relative">
      
      {/* 1. Main Menu Dashboards View */}
      {currentView === 'MAIN_MENU' && (
        <div id="main-menu" className="flex flex-col items-center justify-center h-full relative overflow-y-auto p-6 bg-neutral-950 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Logo Heading */}
          <div className="text-center mb-8 max-w-xl animate-fade-in">
            <span className="text-[10px] tracking-widest text-emerald-400 font-mono font-extrabold uppercase border border-emerald-900 px-3 py-1 bg-emerald-950/40 shadow-md">
              ★ RETRO 2D GRAPHICS ENGINE ★
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight font-mono mt-4 drop-shadow-[0_0_8px_rgba(16,181,129,0.3)] uppercase">
              Pixel Art Tower Defense
            </h1>
            <p className="text-emerald-600 text-xs mt-2 font-mono leading-relaxed">
              Explore pathfinding lanes, fuse blueprints, claim daily quests, trade on exchange boards, and configure customized particle mod trails.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl">
            {/* Left Column: Player Stats Dashboard profile */}
            <div className="lg:col-span-4 rounded-xl border border-emerald-800 bg-neutral-900/80 p-5 backdrop-blur shadow-2xl font-mono text-xs flex flex-col justify-between shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-emerald-400 uppercase border-b border-emerald-800/60 pb-2 mb-4 flex items-center gap-2">
                  👤 Commander Profile
                </h2>

                <div className="flex items-center gap-3 bg-black/30 p-3 rounded border border-emerald-950 mb-4">
                  <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center text-xl bg-emerald-950/20 text-emerald-400">
                    🛡
                  </div>
                  <div>
                    <strong className="text-white block">{saveData.guildName}</strong>
                    <span className="text-[10px] text-emerald-600">Consecutive Streak: {saveData.dailyLoginStreak} Days</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-black/40 border border-emerald-950 px-3 py-2 rounded">
                    <span className="text-emerald-600">GEMMA SHARDS:</span>
                    <span className="font-extrabold text-cyan-400">{saveData.gemmaShards.toLocaleString()} Shards</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 border border-emerald-950 px-3 py-2 rounded">
                    <span className="text-emerald-600">FORGE GOLD:</span>
                    <span className="font-extrabold text-orange-400">{saveData.gold.toLocaleString()}g</span>
                  </div>
                </div>

                {/* Redeem Gift Code Module */}
                <form onSubmit={handleRedeemCode} className="mt-5 border-t border-emerald-800/40 pt-4 font-mono">
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider block mb-2 uppercase">
                    🔑 REDEEM GIFT CODE
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={codeInputValue}
                      onChange={e => setCodeInputValue(e.target.value)}
                      placeholder="ENTER CODE..."
                      className="flex-1 bg-black/40 border border-emerald-900 rounded px-2.5 py-1.5 text-emerald-300 placeholder:text-emerald-800 text-[10px] uppercase focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-emerald-900 hover:bg-emerald-700 text-white font-bold border border-emerald-700 hover:border-emerald-500 rounded text-[10px] uppercase cursor-pointer transition flex items-center justify-center"
                    >
                      CLAIM
                    </button>
                  </div>
                  {codeFeedback && (
                    <div className={`text-[9px] mt-2 font-bold uppercase ${
                      codeFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {codeFeedback.message}
                    </div>
                  )}
                </form>
              </div>

              <div className="mt-6 p-3 bg-emerald-950/20 border border-emerald-900 rounded text-[10px] text-emerald-600 leading-normal flex gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-spin" />
                <span>All profile gold, blueprints, achievements and visual mod parameters are automatically persisted inside local browser storage!</span>
              </div>
            </div>

            {/* Center-Right Columns: Actions Core links grids */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              <button
                onClick={() => setCurrentView('STAGE_SELECT')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Play className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">READY</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">Stage Selector</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Spawn and clears monsters across campaign lanes</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('COMPENDIUM')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <BookOpen className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">INDEX</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">The Bestiary</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Review tower stats and monster characteristics</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('SUMMON_GATE')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Star className="text-orange-400 w-8 h-8 group-hover:scale-110 transition animate-bounce" />
                  <span className="text-[9px] bg-orange-400/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-mono font-bold">GATES</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-orange-400 transition">Summon Vault</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Summon shards cards inside Infinite Gacha gates</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('BLACKSMITH')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Hammer className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">FORGE</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">The Blacksmith</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Forge upgrades blueprint levels and fusions</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('GUILD_HQ')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Shield className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">GUILD</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">Guild HQ</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Crests creator and weekly Raid Citadel stats</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('AUCTION_HOUSE')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <ShoppingBag className="text-orange-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-orange-400/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-mono font-bold">BOARD</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-orange-400 transition">Exchange Market</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Trade blueprint cores on the fluctuating boards</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('LEVEL_EDITOR')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Edit3 className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">SANDBOX</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">Level Editor</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Paint custom layouts and solves path grids</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('NETWORK_LOBBY')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Network className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition animate-pulse" />
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">PEERS</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-emerald-400 transition">Multiplayer Lobby</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Join Co-Op and PvP simulated matchmaking lobbies</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('TROPHY_ROOM')}
                className="group p-5 rounded-lg border border-emerald-900 bg-neutral-950 hover:bg-emerald-950/20 hover:border-emerald-400 text-left transition cursor-pointer flex flex-col justify-between aspect-square shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Trophy className="text-orange-400 w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[9px] bg-orange-400/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-mono font-bold">MEDALS</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase group-hover:text-orange-400 transition">Trophy Room</h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono leading-relaxed">Daily check-in and local completed achievements</p>
                </div>
              </button>

            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentView('PARTICLE_STUDIO')}
              className="px-6 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black border border-emerald-800 rounded font-mono text-xs font-bold tracking-widest uppercase transition cursor-pointer"
            >
              ⚙️ PARTICLE MODS STUDIO
            </button>
          </div>
        </div>
      )}

      {/* 2. Campaign Stage Select View */}
      {currentView === 'STAGE_SELECT' && (
        <div id="stage-selector" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
                Select Battlegrounds
              </h1>
              <p className="text-xs text-emerald-600 font-mono">Choose your tactical lane map configurations</p>
            </div>
            <button
              onClick={() => setCurrentView('MAIN_MENU')}
              className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
            >
              &lt; MAIN MENU
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.values(STAGES_DATA).map(stage => (
              <div
                key={stage.id}
                className="bg-neutral-900/50 border border-emerald-900 rounded p-5 hover:border-emerald-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex flex-col justify-between transition"
              >
                <div>
                  <h3 className="font-mono text-sm font-bold text-emerald-300 uppercase mb-2">{stage.name}</h3>
                  <p className="text-[11px] text-emerald-600 font-mono leading-relaxed h-14 overflow-hidden line-clamp-3">
                    {stage.description}
                  </p>

                  <div className="flex flex-col gap-1.5 mt-4 border-t border-emerald-950 pt-3 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">SPEED MULTIPLIER:</span>
                      <span className="text-cyan-400 font-semibold">{stage.enemySpeedMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">STARTING GOLD:</span>
                      <span className="text-orange-400 font-semibold">{stage.baseGold}g</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchGame(stage)}
                  className="mt-6 w-full py-2 bg-emerald-900 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase rounded border border-emerald-800 cursor-pointer transition tracking-widest"
                >
                  DEPLOY VANGUARDS
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Subcomponents Views */}
      {currentView === 'COMPENDIUM' && (
        <Compendium onBack={() => setCurrentView('MAIN_MENU')} />
      )}

      {currentView === 'SUMMON_GATE' && (
        <GachaVault
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'BLACKSMITH' && (
        <BlacksmithForge
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'GUILD_HQ' && (
        <GuildHQ
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'AUCTION_HOUSE' && (
        <MarketAuctionHouse
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'LEVEL_EDITOR' && (
        <SandboxLevelEditor
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'NETWORK_LOBBY' && (
        <NetworkLobbyHub
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
          onLaunchSimulatedGame={handleLaunchSimulatedMultiplayer}
        />
      )}

      {currentView === 'TROPHY_ROOM' && (
        <TrophyRoom
          saveData={saveData}
          updateSaveData={handleUpdateSaveData}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {currentView === 'PARTICLE_STUDIO' && (
        <ParticleFXStudio
          fxConfig={fxConfig}
          setFxConfig={setFxConfig}
          onBack={() => setCurrentView('MAIN_MENU')}
        />
      )}

      {/* 4. Active Active Canvas Tower Defense Gameplay Deck */}
      {currentView === 'GAMEPLAY' && (
        <div id="gameplay-deck" className="flex flex-col lg:flex-row h-full bg-neutral-950">
          
          {/* Main game board workspace */}
          <div className="flex-1 flex flex-col justify-between p-4 relative">
            
            {/* HUD Header */}
            <div className="flex justify-between items-center bg-neutral-900/80 border border-emerald-900 p-3 rounded-lg font-mono text-xs mb-3 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <div className="flex gap-4">
                <div className="flex items-center gap-1 bg-red-950/20 px-2.5 py-1 rounded border border-red-900">
                  <span className="text-red-700">HP:</span>
                  <strong className="text-red-400 font-extrabold">{lives}/20</strong>
                </div>

                <div className="flex items-center gap-1 bg-orange-950/20 px-2.5 py-1 rounded border border-orange-900">
                  <span className="text-orange-700">GOLD:</span>
                  <strong className="text-orange-400 font-extrabold">{gameGold}g</strong>
                </div>

                <div className="flex items-center gap-1 bg-cyan-950/20 px-2.5 py-1 rounded border border-cyan-900">
                  <span className="text-cyan-700">MANA:</span>
                  <strong className="text-cyan-400 font-extrabold">{gameMana}/200</strong>
                </div>
              </div>

              {/* Weather cycles alerts status display */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded border border-emerald-900">
                  <span className="text-emerald-700 uppercase">WEATHER:</span>
                  <span className={`font-bold uppercase ${
                    weatherType === 'BLIZZARD' ? 'text-sky-300' : weatherType === 'ACID_RAIN' ? 'text-lime-400' : weatherType === 'HEATWAVE' ? 'text-orange-400' : 'text-emerald-500'
                  }`}>
                    {weatherType}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentView('MAIN_MENU')}
                  className="px-3 py-1 bg-neutral-900 hover:bg-red-900/40 text-red-400 border border-red-900/50 hover:text-white font-bold rounded uppercase cursor-pointer transition"
                >
                  LEAVE
                </button>
              </div>
            </div>

            {/* Simulated peer warnings */}
            {coopMessage && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-2.5 rounded shadow-2xl font-mono text-xs font-bold border-2 border-emerald-300 z-40 animate-bounce">
                {coopMessage}
              </div>
            )}

            {/* Custom Interactive Canvas element */}
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black border border-emerald-900 rounded-xl relative shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleGameplayCanvasClick}
                className="w-full max-w-[800px] aspect-[4/3] block bg-black"
              />

              {/* Radial or selection menu overlay for placed towers */}
              {selectedActiveTower && (
                <div className="absolute bottom-4 left-4 bg-neutral-900 border-2 border-emerald-500 rounded-lg p-4 font-mono text-xs w-64 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-fade-in">
                  <h4 className="text-emerald-400 font-extrabold uppercase text-xs mb-1">{ELEMENTS_DATA[selectedActiveTower.type].name}</h4>
                  <div className="text-emerald-600 text-[10px] uppercase mb-2 font-bold">Tier {selectedActiveTower.level} Spire</div>

                  <div className="flex flex-col gap-1 text-[10px] border-t border-emerald-950 pt-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">DAMAGE:</span>
                      <strong className="text-cyan-400">{selectedActiveTower.damage}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">RANGE:</span>
                      <strong className="text-cyan-400">{selectedActiveTower.range}px</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={handleUpgradePlacedTower}
                      disabled={selectedActiveTower.level >= 5}
                      className="flex-1 py-1.5 bg-emerald-900 hover:bg-emerald-700 disabled:bg-neutral-950 disabled:text-emerald-800 disabled:border-emerald-950 border border-emerald-500 text-white font-bold uppercase rounded cursor-pointer transition text-center"
                    >
                      {selectedActiveTower.level >= 5 ? 'MAXED' : 'UPGRADE'}
                    </button>
                    <button
                      onClick={handleSellPlacedTower}
                      className="flex-1 py-1.5 bg-red-950 border border-red-900 text-red-400 font-bold uppercase rounded cursor-pointer transition hover:bg-red-900"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active gameplay controllers bottom footer */}
            <div className="flex justify-between items-center mt-3 bg-neutral-900/80 border border-emerald-900 p-3 rounded-lg font-mono text-xs shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <div className="flex gap-2">
                <button
                  onClick={handleSpawnNextWave}
                  disabled={isWaveActive}
                  className={`px-6 py-2.5 rounded font-bold uppercase cursor-pointer tracking-wider transition border ${
                    isWaveActive
                      ? 'bg-neutral-950 text-emerald-800 border-emerald-950 cursor-not-allowed'
                      : 'bg-emerald-900 hover:bg-emerald-700 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {isWaveActive ? `Wave ${currentWave} Running...` : `Spawn Wave ${currentWave + 1}`}
                </button>

                <button
                  onClick={() => setGameSpeed(prev => (prev === 1 ? 2 : 1))}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-emerald-950 border border-emerald-900 text-emerald-400 rounded font-bold uppercase cursor-pointer transition"
                >
                  SPEED: {gameSpeed}x
                </button>
              </div>

              {/* Mana ultimates casting triggers */}
              <div className="flex gap-2">
                {[
                  { key: 'METEOR', label: '☄️ Pyroclastic Meteor (60 Mana)', desc: 'Screen clear' },
                  { key: 'FREEZE', label: '❄️ Glacial Stasis (50 Mana)', desc: 'Slow all' },
                  { key: 'NUKE', label: '☢️ Tactical Nuke (80 Mana)', desc: 'High poison damage' },
                ].map(spell => (
                  <button
                    key={spell.key}
                    onClick={() => handleCastUltimate(spell.key as any)}
                    className="px-3 py-2 bg-purple-950/20 hover:bg-purple-900 border border-purple-900 text-purple-400 font-bold uppercase rounded cursor-pointer text-[10px] transition"
                    title={spell.desc}
                  >
                    {spell.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active side-selection tower drawer shop */}
          <div className="w-full lg:w-80 bg-neutral-950 border-l border-emerald-900 p-4 flex flex-col justify-between font-mono text-xs">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase border-b border-emerald-900 pb-2 mb-4">
                🛡 Arsenal Spire Deck
              </h2>

              {/* Placements listing */}
              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
                {saveData.unlockedTowers.map(type => {
                  const item = ELEMENTS_DATA[type];
                  if (!item) return null;

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedBuildType(type)}
                      className={`p-2.5 rounded border text-left transition cursor-pointer flex justify-between items-center ${
                        selectedBuildType === type
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : 'bg-neutral-900/40 border-emerald-950/60 text-emerald-600 hover:border-emerald-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <strong className="text-emerald-300 block text-[11px] font-bold truncate">{item.name}</strong>
                        <span className="text-[9px] text-emerald-700 leading-normal line-clamp-2 mt-1">{item.description}</span>
                      </div>
                      <span className="text-orange-400 font-bold ml-2 text-right text-[10px]">{item.cost}g</span>
                    </button>
                  );
                })}

                {/* Traps placement items */}
                <div className="border-t border-emerald-950/60 pt-3 mt-1.5">
                  <span className="text-[10px] text-emerald-600 block mb-2 uppercase font-bold">🗺 Lane Traps placement</span>
                  {[
                    { key: 'TRAP_SPIKES', name: 'Spiked pits traps', desc: 'Slashes and causes bleed damage.' },
                    { key: 'TRAP_TAR', name: 'Tar bogs mud block', desc: 'Slows cross speed.' },
                  ].map(trap => (
                    <button
                      key={trap.key}
                      onClick={() => setSelectedBuildType(trap.key as any)}
                      className={`p-2 rounded border text-left transition cursor-pointer flex justify-between items-center w-full mb-1 text-[10px] ${
                        selectedBuildType === trap.key
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : 'bg-neutral-900/40 border-emerald-950/60 text-emerald-600 hover:border-emerald-850'
                      }`}
                    >
                      <div>
                        <strong className="text-emerald-300 block font-bold">{trap.name}</strong>
                        <span className="text-[8px] text-emerald-700">{trap.desc}</span>
                      </div>
                      <span className="text-orange-400 font-bold">50g</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/10 border border-emerald-900 text-[10px] leading-relaxed text-emerald-600 mt-4 p-3 rounded">
              <HelpCircle className="w-4 h-4 text-emerald-500 inline-block mr-1 flex-shrink-0 animate-pulse" />
              <span>Select an element spire tower or a trap above, then click on a valid grid cell inside the active canvas arena field!</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Inter-wave Roguelike Draft Card selection modal popup */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50 backdrop-blur font-mono">
          <div className="bg-neutral-950 border-2 border-emerald-500 max-w-xl w-full rounded-xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-widest text-center mb-1 flex items-center justify-center gap-2">
              🌟 ROGUELIKE DRAFT MODIFIERS 🌟
            </h2>
            <p className="text-center text-[11px] text-emerald-600 mb-6">Choose one card. Balance powerful boons against their dark curses!</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {draftCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => {
                    // Apply booster metrics in simulation
                    if (card.title.includes('Solar')) {
                      setGameMana(prev => Math.min(200, prev + 50));
                    } else if (card.title.includes('Volcanic')) {
                      setGameGold(g => g + 150);
                    }
                    setShowDraftModal(false);
                    alert(`Draft Chosen: "${card.title}"! Stats modifiers updated inside active level.`);
                  }}
                  className="p-4 rounded-lg bg-neutral-900 border border-emerald-900 hover:border-emerald-400 text-left cursor-pointer transition flex flex-col justify-between"
                >
                  <strong className="text-emerald-300 block uppercase text-xs border-b border-emerald-950 pb-1 mb-2 font-bold">{card.title}</strong>
                  <div className="text-[10px] mb-3">
                    <div className="text-emerald-400 font-bold uppercase text-[8px]">BOON:</div>
                    <p className="text-emerald-500 leading-snug mt-0.5">{card.boon}</p>
                  </div>
                  <div className="text-[10px]">
                    <div className="text-red-400 font-bold uppercase text-[8px]">CURSE:</div>
                    <p className="text-red-500 leading-snug mt-0.5">{card.curse}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-900 border border-emerald-500 hover:bg-emerald-700 text-white px-2 py-1.5 font-bold rounded mt-4 text-center block tracking-widest transition">
                    CHOOSE CARD
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
