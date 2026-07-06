// Procedural Pixel Art Graphics Engine
// Defines retro pixel palettes and grids for all characters, towers, and visual assets.

type PixelGrid = string[][];

// Color Palettes
export const PALETTE = {
  greenSkin: '#4CAF50',
  darkGreenSkin: '#2E7D32',
  leather: '#795548',
  darkLeather: '#4E342E',
  ivory: '#E8F5E9',
  boneShadow: '#90A4AE',
  violetRobe: '#673AB7',
  darkViolet: '#4527A0',
  glowingYellow: '#FFEB3B',
  steelArmor: '#78909C',
  darkSteel: '#37474F',
  gold: '#FFC107',
  accentRed: '#F44336',
  cyanIce: '#4DD0E1',
  deepBlueWater: '#1E88E5',
  woodBrown: '#A1887F',
  poisonGreen: '#00E676',
  purpleDark: '#AB47BC',
  neonPink: '#E040FB',
  mossGreen: '#81C784',
  necromancyPurple: '#D1C4E9',
  fireOrange: '#FF5722',
  fireYellow: '#FFC107',
  voidBlack: '#212121',
  white: '#FFFFFF',
};

// Procedurally design pixel arrays (12x12 or 16x16 grids)
const SPRITES: Record<string, PixelGrid> = {
  // --- ENEMIES ---
  goblin: [
    ['.', '.', 'G', 'G', 'G', 'G', '.', '.'],
    ['.', 'G', 'G', 'Y', 'Y', 'G', 'G', '.'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['.', 'L', 'L', 'L', 'L', 'L', 'L', '.'],
    ['.', 'G', 'L', 'L', 'L', 'L', 'G', '.'],
    ['.', 'G', 'G', 'G', 'G', 'G', 'G', '.'],
    ['.', 'L', '.', 'L', 'L', '.', 'L', '.'],
    ['.', 'G', '.', '.', '.', '.', 'G', '.'],
  ].map(row => row.map(char => (char === 'G' ? PALETTE.greenSkin : char === 'Y' ? PALETTE.glowingYellow : char === 'L' ? PALETTE.leather : '#00000000'))),

  skeleton: [
    ['.', '.', 'B', 'B', 'B', 'B', '.', '.'],
    ['.', 'B', 'S', 'B', 'B', 'S', 'B', '.'],
    ['.', '.', 'B', 'B', 'B', 'B', '.', '.'],
    ['.', 'S', 'B', 'B', 'B', 'B', 'S', '.'],
    ['S', 'B', 'B', 'B', 'B', 'B', 'B', 'S'],
    ['.', '.', 'B', 'B', 'B', 'B', '.', '.'],
    ['.', 'B', 'B', '.', '.', 'B', 'B', '.'],
    ['B', 'B', '.', '.', '.', '.', 'B', 'B'],
  ].map(row => row.map(char => (char === 'B' ? PALETTE.ivory : char === 'S' ? PALETTE.boneShadow : '#00000000'))),

  dark_mage: [
    ['.', '.', 'V', 'V', 'V', 'V', '.', '.'],
    ['.', 'V', 'Y', 'V', 'V', 'Y', 'V', '.'],
    ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V'],
    ['V', 'D', 'V', 'V', 'V', 'V', 'D', 'V'],
    ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V'],
    ['.', 'V', 'V', 'V', 'V', 'V', 'V', '.'],
    ['.', 'D', 'D', '.', '.', 'D', 'D', '.'],
    ['V', 'V', '.', '.', '.', '.', 'V', 'V'],
  ].map(row => row.map(char => (char === 'V' ? PALETTE.violetRobe : char === 'D' ? PALETTE.darkViolet : char === 'Y' ? PALETTE.glowingYellow : '#00000000'))),

  goblin_chief: [
    ['.', '.', 'G', 'G', 'G', 'G', 'G', 'G', '.', '.'],
    ['.', 'G', 'G', 'Y', 'Y', 'Y', 'G', 'G', 'G', '.'],
    ['G', 'G', 'S', 'S', 'S', 'S', 'S', 'G', 'G', 'G'],
    ['G', 'S', 'S', 'S', 'R', 'S', 'S', 'S', 'G', 'G'],
    ['S', 'S', 'L', 'L', 'L', 'L', 'L', 'S', 'S', 'W'],
    ['S', 'G', 'L', 'L', 'L', 'L', 'L', 'G', 'S', 'W'],
    ['.', 'G', 'G', 'S', 'S', 'S', 'G', 'G', '.', 'W'],
    ['.', 'L', 'L', 'S', '.', 'S', 'L', 'L', '.', 'W'],
    ['.', 'G', 'G', '.', '.', '.', 'G', 'G', '.', '.'],
  ].map(row => row.map(char => (char === 'G' ? PALETTE.darkGreenSkin : char === 'Y' ? PALETTE.glowingYellow : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.leather : char === 'R' ? PALETTE.accentRed : char === 'W' ? PALETTE.woodBrown : '#00000000'))),

  orc_warrior: [
    ['.', '.', 'G', 'G', 'G', 'G', '.', '.'],
    ['.', 'G', 'S', 'G', 'G', 'S', 'G', '.'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['.', 'S', 'S', 'S', 'S', 'S', 'S', '.'],
    ['S', 'S', 'L', 'L', 'L', 'L', 'S', 'S'],
    ['.', 'G', 'L', 'L', 'L', 'L', 'G', '.'],
    ['.', 'S', 'S', '.', '.', 'S', 'S', '.'],
    ['S', 'S', '.', '.', '.', '.', 'S', 'S'],
  ].map(row => row.map(char => (char === 'G' ? PALETTE.darkGreenSkin : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.leather : '#00000000'))),

  undead_archer: [
    ['.', '.', 'B', 'B', 'B', 'B', '.', '.'],
    ['.', 'B', 'S', 'B', 'B', 'S', 'B', '.'],
    ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'W'],
    ['.', 'B', 'S', 'S', 'S', 'B', '.', 'W'],
    ['B', 'B', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['.', 'B', 'S', 'S', 'S', 'B', '.', 'W'],
    ['.', 'B', 'B', '.', '.', 'B', 'B', '.'],
    ['B', 'B', '.', '.', '.', '.', 'B', 'B'],
  ].map(row => row.map(char => (char === 'B' ? PALETTE.ivory : char === 'S' ? PALETTE.boneShadow : char === 'W' ? PALETTE.woodBrown : '#00000000'))),

  shadow_assassin: [
    ['.', '.', 'K', 'K', 'K', 'K', '.', '.'],
    ['.', 'K', 'P', 'K', 'K', 'P', 'K', '.'],
    ['K', 'K', 'K', 'K', 'K', 'K', 'K', 'K'],
    ['.', 'K', 'K', 'K', 'K', 'K', 'K', '.'],
    ['.', 'K', 'P', 'P', 'P', 'P', 'K', '.'],
    ['K', 'K', 'P', 'P', 'P', 'P', 'K', 'K'],
    ['.', 'K', 'K', '.', '.', 'K', 'K', '.'],
    ['K', 'K', '.', '.', '.', '.', 'K', 'K'],
  ].map(row => row.map(char => (char === 'K' ? PALETTE.voidBlack : char === 'P' ? PALETTE.purpleDark : '#00000000'))),

  death_knight: [
    ['.', '.', 'K', 'K', 'K', 'K', 'K', 'K', '.', '.'],
    ['.', 'K', 'K', 'P', 'P', 'P', 'K', 'K', 'K', '.'],
    ['K', 'K', 'S', 'S', 'S', 'S', 'S', 'K', 'K', 'V'],
    ['K', 'S', 'S', 'S', 'R', 'S', 'S', 'S', 'K', 'V'],
    ['S', 'S', 'K', 'K', 'K', 'K', 'K', 'S', 'S', 'V'],
    ['S', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'S', 'V'],
    ['.', 'K', 'K', 'S', 'S', 'S', 'K', 'K', '.', 'V'],
    ['.', 'K', 'K', 'S', '.', 'S', 'K', 'K', '.', '.'],
    ['K', 'K', 'S', '.', '.', '.', 'S', 'K', 'K', '.'],
  ].map(row => row.map(char => (char === 'K' ? PALETTE.voidBlack : char === 'P' ? PALETTE.necromancyPurple : char === 'S' ? PALETTE.darkSteel : char === 'R' ? PALETTE.accentRed : char === 'V' ? PALETTE.purpleDark : '#00000000'))),

  ogre_brute: [
    ['.', '.', 'W', 'W', 'W', 'W', 'W', 'W', '.', '.'],
    ['.', 'W', 'W', 'Y', 'Y', 'Y', 'W', 'W', 'W', '.'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'L'],
    ['W', 'W', 'L', 'L', 'L', 'L', 'L', 'W', 'W', 'L'],
    ['L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L'],
    ['L', 'W', 'L', 'L', 'L', 'L', 'L', 'W', 'L', 'L'],
    ['.', 'W', 'W', 'L', 'L', 'L', 'W', 'W', '.', 'L'],
    ['.', 'L', 'L', 'L', '.', 'L', 'L', 'L', '.', '.'],
    ['L', 'L', 'L', '.', '.', '.', 'L', 'L', 'L', '.'],
  ].map(row => row.map(char => (char === 'W' ? PALETTE.woodBrown : char === 'Y' ? PALETTE.glowingYellow : char === 'L' ? PALETTE.darkLeather : '#00000000'))),

  bone_wizard: [
    ['.', '.', 'B', 'B', 'B', 'B', '.', '.'],
    ['.', 'B', 'G', 'B', 'B', 'G', 'B', '.'],
    ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'P'],
    ['.', 'B', 'P', 'P', 'P', 'B', '.', 'P'],
    ['B', 'B', 'P', 'P', 'P', 'P', 'B', 'P'],
    ['.', 'B', 'P', 'P', 'P', 'B', '.', 'P'],
    ['.', 'B', 'B', '.', '.', 'B', 'B', '.'],
    ['B', 'B', '.', '.', '.', '.', 'B', 'B'],
  ].map(row => row.map(char => (char === 'B' ? PALETTE.ivory : char === 'G' ? PALETTE.poisonGreen : char === 'P' ? PALETTE.darkViolet : '#00000000'))),

  void_stalker: [
    ['.', '.', 'K', 'K', 'K', 'K', '.', '.'],
    ['.', 'K', 'P', 'K', 'K', 'P', 'K', '.'],
    ['K', 'K', 'K', 'K', 'K', 'K', 'K', 'K'],
    ['K', 'P', 'P', 'P', 'P', 'P', 'P', 'K'],
    ['.', 'P', 'P', 'P', 'P', 'P', 'P', '.'],
    ['K', 'K', 'P', 'P', 'P', 'P', 'K', 'K'],
    ['K', '.', 'K', '.', '.', 'K', '.', 'K'],
    ['P', '.', 'P', '.', '.', 'P', '.', 'P'],
  ].map(row => row.map(char => (char === 'K' ? PALETTE.voidBlack : char === 'P' ? PALETTE.neonPink : '#00000000'))),

  dread_lord: [
    ['.', '.', 'K', 'K', 'K', 'K', 'K', 'K', '.', '.'],
    ['.', 'K', 'K', 'R', 'R', 'R', 'K', 'K', 'K', '.'],
    ['K', 'K', 'P', 'P', 'P', 'P', 'P', 'K', 'K', 'K'],
    ['K', 'P', 'P', 'P', 'R', 'P', 'P', 'P', 'K', 'K'],
    ['P', 'P', 'K', 'K', 'K', 'K', 'K', 'P', 'P', 'K'],
    ['P', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'P', 'K'],
    ['K', 'K', 'K', 'P', 'P', 'P', 'K', 'K', 'K', 'K'],
    ['K', 'K', 'K', 'P', '.', 'P', 'K', 'K', 'K', 'K'],
    ['P', 'P', 'K', '.', '.', '.', 'K', 'P', 'P', '.'],
  ].map(row => row.map(char => (char === 'K' ? PALETTE.voidBlack : char === 'R' ? PALETTE.accentRed : char === 'P' ? PALETTE.purpleDark : '#00000000'))),


  // --- ALLY SUMMONS ---
  forest_warrior: [
    ['.', '.', 'M', 'M', 'M', 'M', '.', '.'],
    ['.', 'M', 'M', 'L', 'L', 'M', 'M', '.'],
    ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'W'],
    ['.', 'L', 'L', 'L', 'L', 'L', 'L', 'W'],
    ['.', 'M', 'L', 'L', 'L', 'L', 'M', '.'],
    ['.', 'M', 'M', 'M', 'M', 'M', 'M', '.'],
    ['.', 'L', '.', 'L', 'L', '.', 'L', '.'],
    ['.', 'M', '.', '.', '.', '.', 'M', '.'],
  ].map(row => row.map(char => (char === 'M' ? PALETTE.mossGreen : char === 'L' ? PALETTE.leather : char === 'W' ? PALETTE.woodBrown : '#00000000'))),

  wild_archer: [
    ['.', '.', 'M', 'M', 'M', 'M', '.', '.'],
    ['.', 'M', 'S', 'M', 'M', 'S', 'M', '.'],
    ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'W'],
    ['.', 'M', 'L', 'L', 'L', 'L', '.', 'W'],
    ['M', 'M', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['.', 'M', 'L', 'L', 'L', 'L', '.', 'W'],
    ['.', 'M', 'M', '.', '.', 'M', 'M', '.'],
    ['M', 'M', '.', '.', '.', '.', 'M', 'M'],
  ].map(row => row.map(char => (char === 'M' ? PALETTE.mossGreen : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.leather : char === 'W' ? PALETTE.woodBrown : '#00000000'))),

  druid_adept: [
    ['.', '.', 'M', 'M', 'M', 'M', '.', '.'],
    ['.', 'M', 'Y', 'M', 'M', 'Y', 'M', '.'],
    ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'G'],
    ['M', 'L', 'M', 'M', 'M', 'M', 'L', 'G'],
    ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'G'],
    ['.', 'M', 'M', 'M', 'M', 'M', 'M', '.'],
    ['.', 'L', 'L', '.', '.', 'L', 'L', '.'],
    ['M', 'M', '.', '.', '.', '.', 'M', 'M'],
  ].map(row => row.map(char => (char === 'M' ? PALETTE.mossGreen : char === 'Y' ? PALETTE.glowingYellow : char === 'L' ? PALETTE.darkLeather : char === 'G' ? PALETTE.poisonGreen : '#00000000'))),


  // --- TOWERS (10 Primary + 2 Summoners) ---
  FLAME: [
    ['.', '.', 'S', 'F', 'F', 'S', '.', '.'],
    ['.', 'S', 'F', 'F', 'F', 'F', 'S', '.'],
    ['.', 'S', 'S', 'S', 'S', 'S', 'S', '.'],
    ['S', 'S', 'L', 'L', 'L', 'L', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'S' ? PALETTE.darkSteel : char === 'F' ? PALETTE.fireOrange : char === 'L' ? PALETTE.steelArmor : '#00000000'))),

  FROST: [
    ['.', '.', 'C', 'C', 'C', 'C', '.', '.'],
    ['.', 'C', 'C', 'I', 'I', 'C', 'C', '.'],
    ['.', 'S', 'I', 'I', 'I', 'I', 'S', '.'],
    ['S', 'S', 'I', 'I', 'I', 'I', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'C' ? PALETTE.cyanIce : char === 'I' ? PALETTE.white : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  THUNDER: [
    ['.', '.', 'Y', 'Y', 'Y', 'Y', '.', '.'],
    ['.', 'Y', 'S', 'Y', 'Y', 'S', 'Y', '.'],
    ['.', 'S', 'G', 'G', 'G', 'G', 'S', '.'],
    ['S', 'S', 'G', 'G', 'G', 'G', 'S', 'S'],
    ['S', 'S', 'L', 'L', 'L', 'L', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'Y' ? PALETTE.glowingYellow : char === 'G' ? PALETTE.gold : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  POISON: [
    ['.', '.', 'P', 'P', 'P', 'P', '.', '.'],
    ['.', 'P', 'P', 'N', 'N', 'P', 'P', '.'],
    ['.', 'S', 'N', 'N', 'N', 'N', 'S', '.'],
    ['S', 'S', 'N', 'N', 'N', 'N', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'P' ? PALETTE.poisonGreen : char === 'N' ? PALETTE.darkGreenSkin : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  EARTH: [
    ['.', '.', 'W', 'W', 'W', 'W', '.', '.'],
    ['.', 'W', 'W', 'L', 'L', 'W', 'W', '.'],
    ['.', 'S', 'L', 'L', 'L', 'L', 'S', '.'],
    ['S', 'S', 'L', 'L', 'L', 'L', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'W' ? PALETTE.woodBrown : char === 'L' ? PALETTE.leather : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  WIND: [
    ['.', '.', 'A', 'A', 'A', 'A', '.', '.'],
    ['.', 'A', 'A', 'C', 'C', 'A', 'A', '.'],
    ['.', 'S', 'C', 'C', 'C', 'C', 'S', '.'],
    ['S', 'S', 'C', 'C', 'C', 'C', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'A' ? PALETTE.cyanIce : char === 'C' ? PALETTE.white : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  WATER: [
    ['.', '.', 'D', 'D', 'D', 'D', '.', '.'],
    ['.', 'D', 'D', 'C', 'C', 'D', 'D', '.'],
    ['.', 'S', 'C', 'C', 'C', 'C', 'S', '.'],
    ['S', 'S', 'C', 'C', 'C', 'C', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'D' ? PALETTE.deepBlueWater : char === 'C' ? PALETTE.cyanIce : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  LIGHT: [
    ['.', '.', 'G', 'G', 'G', 'G', '.', '.'],
    ['.', 'G', 'G', 'I', 'I', 'G', 'G', '.'],
    ['.', 'S', 'I', 'I', 'I', 'I', 'S', '.'],
    ['S', 'S', 'I', 'I', 'I', 'I', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'G' ? PALETTE.gold : char === 'I' ? PALETTE.white : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  DARK: [
    ['.', '.', 'P', 'P', 'P', 'P', '.', '.'],
    ['.', 'P', 'P', 'K', 'K', 'P', 'P', '.'],
    ['.', 'S', 'K', 'K', 'K', 'K', 'S', '.'],
    ['S', 'S', 'K', 'K', 'K', 'K', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'P' ? PALETTE.purpleDark : char === 'K' ? PALETTE.voidBlack : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  ARCANE: [
    ['.', '.', 'N', 'N', 'N', 'N', '.', '.'],
    ['.', 'N', 'N', 'P', 'P', 'N', 'N', '.'],
    ['.', 'S', 'P', 'P', 'P', 'P', 'S', '.'],
    ['S', 'S', 'P', 'P', 'P', 'P', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'N' ? PALETTE.neonPink : char === 'P' ? PALETTE.purpleDark : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  NATURE_SUMMON: [
    ['.', '.', 'M', 'M', 'M', 'M', '.', '.'],
    ['.', 'M', 'M', 'P', 'P', 'M', 'M', '.'],
    ['.', 'S', 'P', 'P', 'P', 'P', 'S', '.'],
    ['S', 'S', 'P', 'P', 'P', 'P', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'M' ? PALETTE.mossGreen : char === 'P' ? PALETTE.poisonGreen : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),

  CORPSE_SUMMON: [
    ['.', '.', 'P', 'P', 'P', 'P', '.', '.'],
    ['.', 'P', 'P', 'K', 'K', 'P', 'P', '.'],
    ['.', 'S', 'K', 'K', 'K', 'K', 'S', '.'],
    ['S', 'S', 'K', 'K', 'K', 'K', 'S', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'L', 'L', 'L', 'L', 'L', 'L', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ].map(row => row.map(char => (char === 'P' ? PALETTE.necromancyPurple : char === 'K' ? PALETTE.purpleDark : char === 'S' ? PALETTE.steelArmor : char === 'L' ? PALETTE.darkSteel : '#00000000'))),
};

/**
 * Draws a pixelated sprite on the canvas using our custom retro grid maps.
 * Handles continuous breathing, stepping offsets, and flash overlays on hit!
 */
export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number, // canvas horizontal center
  y: number, // canvas vertical bottom
  size: number = 32, // target bounds size
  direction: 1 | -1 = 1, // face left (-1) or right (1)
  frame: number = 0, // animation loop frame tick
  hitFlashTimer: number = 0, // >0 triggers a white/red override
  hitFlashColor: 'white' | 'red' | null = null,
  isFlying: boolean = false
) {
  const grid = SPRITES[type] || SPRITES['goblin'];
  const gridW = grid[0].length;
  const gridH = grid.length;
  const pixelW = size / gridW;
  const pixelH = size / gridH;

  // Calculate breathing compression
  // Alternates compress loop over 30 ticks
  const breathingPeriod = 30;
  const breathingOffset = Math.sin((frame / breathingPeriod) * Math.PI) * 1.2;

  // Calculate stepping foot offset
  let stepY = 0;
  if (!isFlying && type !== 'FLAME' && type !== 'FROST' && type !== 'THUNDER' && type !== 'POISON' && type !== 'EARTH' && type !== 'WIND' && type !== 'WATER' && type !== 'LIGHT' && type !== 'DARK' && type !== 'ARCANE' && type !== 'NATURE_SUMMON' && type !== 'CORPSE_SUMMON') {
    // Bobbing for character walks
    stepY = Math.sin((frame / 8) * Math.PI) * 2;
  } else if (isFlying) {
    stepY = Math.sin((frame / 12) * Math.PI) * 3; // Float bobbing
  }

  ctx.save();
  // Translate to center bottom
  ctx.translate(x, y);

  // Apply horizontal facing scale
  ctx.scale(direction, 1);

  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      let color = grid[r][c];
      if (color === '#00000000') continue;

      // Handle on-hit damage flash overrides (white or red)
      if (hitFlashTimer > 0 && hitFlashColor) {
        color = hitFlashColor === 'white' ? '#FFFFFF' : '#FF1744';
      }

      // Calculate pixel drawing boundaries
      // Scale heights of top rows slightly to achieve vertical "breathing" squish
      let currentPixelH = pixelH;
      let drawY = -size + r * pixelH + stepY;

      if (r < gridH / 2) {
        // Compress top half slightly
        currentPixelH = pixelH + breathingOffset / (gridH / 2);
        drawY = -size + r * currentPixelH + stepY;
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        -size / 2 + c * pixelW,
        drawY,
        Math.ceil(pixelW) + 0.5,
        Math.ceil(currentPixelH) + 0.5
      );
    }
  }

  ctx.restore();
}
