export type GameView =
  | 'MAIN_MENU'
  | 'STAGE_SELECT'
  | 'COMPENDIUM'
  | 'SUMMON_GATE'
  | 'BLACKSMITH'
  | 'GUILD_HQ'
  | 'AUCTION_HOUSE'
  | 'LEVEL_EDITOR'
  | 'NETWORK_LOBBY'
  | 'TROPHY_ROOM'
  | 'GAMEPLAY'
  | 'PARTICLE_STUDIO';

export type StageId = 'reck_grasslands' | 'obsidian_fissures' | 'necrotic_citadel' | 'infinite_rift' | 'custom_map';

export interface Stage {
  id: StageId;
  name: string;
  description: string;
  lanes: { x: number; y: number }[][]; // multiple lanes for dual-path maps
  mapGrid: number[][]; // 16x12 grid (0 = path, 1 = buildable, 2 = obstacle, 3 = portal, 4 = core)
  enemySpeedMultiplier: number;
  baseGold: number;
  baseMana: number;
}

export type ElementType =
  | 'FLAME'
  | 'FROST'
  | 'THUNDER'
  | 'POISON'
  | 'EARTH'
  | 'WIND'
  | 'WATER'
  | 'LIGHT'
  | 'DARK'
  | 'ARCANE'
  | 'NATURE_SUMMON'
  | 'CORPSE_SUMMON';

export interface TowerStats {
  type: ElementType;
  name: string;
  cost: number;
  range: number;
  cooldown: number; // in game frames or ms
  damage: number;
  upgradeName: string;
  description: string;
  bulletColor: string;
}

export interface TowerInstance {
  id: string;
  type: ElementType;
  x: number; // grid coordinates (0-15)
  y: number; // grid coordinates (0-11)
  px: number; // canvas pixel coordinates
  py: number;
  level: number;
  damage: number;
  range: number;
  cooldown: number;
  timer: number;
  isGodly: boolean;
  targetMode: 'FIRST' | 'LAST' | 'STRONG' | 'CLOSE' | 'SUMMON';
  animFrame: number;
  animTimer: number;
}

export interface EnemyStats {
  type: string;
  name: string;
  maxHp: number;
  dmg: number; // damage dealt to player core
  speed: 'SLOW' | 'NORMAL' | 'FAST' | 'VERY_FAST';
  speedVal: number;
  ability: string;
  isBoss?: boolean;
}

export interface EnemyInstance {
  id: string;
  type: string;
  name: string;
  hp: number;
  maxHp: number;
  dmg: number;
  speed: number;
  originalSpeed: number;
  ability: string;
  x: number; // pixel coords
  y: number;
  laneIndex: number;
  nodeIndex: number;
  distanceTraveled: number;
  isBoss: boolean;
  isStealth: boolean;
  stealthTimer: number;
  shieldHp: number;
  hitFlashTimer: number; // frames remaining for flash
  hitFlashColor: 'white' | 'red' | null;
  // Status effects
  burnDuration: number;
  burnDmg: number;
  slowDuration: number;
  slowMult: number;
  stunDuration: number;
  poisonDuration: number;
  poisonStacks: number;
  soakedDuration: number;
  vortexDuration: number;
  vortexCenter: { x: number; y: number };
  animFrame: number;
  animTimer: number;
  width: number;
  height: number;
}

export interface AllyInstance {
  id: string;
  name: string;
  type: 'FOREST_WARRIOR' | 'WILD_ARCHER' | 'DRUID_ADEPT' | 'SKELETON_WARRIOR' | 'SKELETON_ARCHER' | 'NECROMANCER_ACOLYTE' | 'TREANT' | 'DEATH_KNIGHT';
  hp: number;
  maxHp: number;
  damage: number;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  cooldown: number;
  timer: number;
  range: number;
  isNature: boolean;
  hitFlashTimer: number;
  animFrame: number;
  animTimer: number;
  targetEnemyId: string | null;
}

export interface Projectile {
  id: string;
  type: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetEnemyId: string | null;
  speed: number;
  damage: number;
  elementType: ElementType;
  color: string;
  bounceCount: number; // for chain lightning
  bouncedEnemyIds: string[];
  angle: number;
  size: number;
  trail: { x: number; y: number }[];
  isUltimate: boolean;
}

export interface TrapInstance {
  id: string;
  type: 'SPIKED_PIT' | 'TAR_BOG' | 'ARCANE_MINES';
  x: number; // grid
  y: number; // grid
  px: number; // pixel center
  py: number;
  cost: number;
  charges: number; // triggers left
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export type RelicId =
  | 'phoenix_ash'
  | 'glacial_core'
  | 'ancient_seed'
  | 'corrupted_ribcage'
  | 'storm_generator'
  | 'catalyst_crystal';

export interface Relic {
  id: RelicId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type WeatherType = 'CLEAR' | 'HEATWAVE' | 'BLIZZARD' | 'ACID_RAIN' | 'TEMPEST';

export interface WeatherCycle {
  current: WeatherType;
  timer: number; // ticks left (60 seconds)
}

export interface DraftCard {
  id: string;
  title: string;
  boonDesc: string;
  curseDesc: string;
  apply: (state: any) => void;
}

// Global persistence data structure
export interface SaveData {
  gold: number;
  gemmaShards: number;
  unlockedTowers: ElementType[];
  weaponLevels: Record<ElementType, number>;
  fusedTowers: Record<ElementType, boolean>;
  activeRelics: RelicId[];
  unlockedAchievements: string[];
  completedDailyQuests: string[];
  dailyLoginStreak: number;
  lastLoginDate: string;
  guildName: string;
  guildCrest: string; // JSON or base64 config
  guildDonatedGold: number;
  customMapJson: string;
  redeemedCodes?: string[];
}
