export type ClassName = 'Knight' | 'Mage' | 'Healer' | 'Rogue' | 'Bowman';

export type EquipSlot =
  | 'Weapon'
  | 'Off-hand'
  | 'Head'
  | 'Armor'
  | 'Back'
  | 'Eyewear'
  | 'Accessory';

export type HabitKind = 'good' | 'bad';
export type HabitRhythm = 'daily' | 'every' | 'monthly' | 'weekdays';
export type TabId = 'habits' | 'todos' | 'rewards' | 'realm';
export type SeasonTheme = 'fall' | 'christmas';

export type RealmSection =
  | ''
  | 'Profile'
  | 'Stats'
  | 'Skills'
  | 'Equipment'
  | 'Pets'
  | 'Boss'
  | 'Challenges'
  | 'Guild'
  | 'Market'
  | 'Quest Shop'
  | 'Customization Shop'
  | 'Seasonal Shop'
  | 'Time Traveler Shop'
  | 'Friends'
  | 'Achievements'
  | 'Focus'
  | 'Settings';

export interface AvatarConfig {
  skin: number;
  hair: number;
  hairColor: number;
  eyes: number;
  eyeColor: number;
  glasses: number;
  top: number;
  pants: number;
  accessory: number;
  bg: number;
}

export interface StatBlock {
  str: number;
  def: number;
  int: number;
  agi: number;
}

export interface HabitItem {
  id: string;
  title: string;
  kind: HabitKind;
  rhythm: HabitRhythm;
  everyDays?: number;
  weekdays: number[];
  createdDate: string;
  doneDates: string[];
  slips: string[];
  streak: number;
}

export interface TodoItem {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  minutes: number;
  cost: number;
}

export type PetSpriteId =
  | 'slime'
  | 'crab'
  | 'squirrel'
  | 'frog'
  | 'fox'
  | 'tortoise'
  | 'moth'
  | 'cat'
  | 'owl'
  | 'bunny'
  | 'beetle'
  | 'pup'
  | 'axolotl'
  | 'griffin'
  | 'wyrm'
  | 'phoenix';

export type PetRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface PetRarityStyle {
  label: PetRarity;
  hex: string;
  tagBg: string;
  tagBorder: string;
  cardBorder: string;
  cardBg: string;
  cardGlow: string;
  spriteGlow: string;
  auraBg: string;
}

export const PET_RARITY_STYLES: Record<PetRarity, PetRarityStyle> = {
  Common: {
    label: 'Common',
    hex: '#f5f5f9',
    tagBg: 'rgba(245, 245, 249, 0.10)',
    tagBorder: 'rgba(245, 245, 249, 0.28)',
    cardBorder: 'rgba(245, 245, 249, 0.18)',
    cardBg: 'rgba(245, 245, 249, 0.03)',
    cardGlow: '0 0 14px rgba(245, 245, 249, 0.10)',
    spriteGlow: 'drop-shadow(0 0 2px rgba(245, 245, 249, 0.45))',
    auraBg: 'radial-gradient(circle, rgba(245,245,249,0.14) 0%, transparent 72%)',
  },
  Uncommon: {
    label: 'Uncommon',
    hex: '#5ce09e',
    tagBg: 'rgba(92, 224, 158, 0.13)',
    tagBorder: 'rgba(92, 224, 158, 0.36)',
    cardBorder: 'rgba(92, 224, 158, 0.26)',
    cardBg: 'rgba(92, 224, 158, 0.04)',
    cardGlow: '0 0 16px rgba(92, 224, 158, 0.14)',
    spriteGlow: 'drop-shadow(0 0 3px rgba(92, 224, 158, 0.55))',
    auraBg: 'radial-gradient(circle, rgba(92,224,158,0.18) 0%, transparent 72%)',
  },
  Rare: {
    label: 'Rare',
    hex: '#60a5fa',
    tagBg: 'rgba(96, 165, 250, 0.15)',
    tagBorder: 'rgba(96, 165, 250, 0.44)',
    cardBorder: 'rgba(96, 165, 250, 0.34)',
    cardBg: 'rgba(96, 165, 250, 0.06)',
    cardGlow: '0 0 18px rgba(96, 165, 250, 0.22)',
    spriteGlow: 'drop-shadow(0 0 3px rgba(96, 165, 250, 0.68))',
    auraBg: 'radial-gradient(circle, rgba(96,165,250,0.24) 0%, transparent 72%)',
  },
  Epic: {
    label: 'Epic',
    hex: '#c084fc',
    tagBg: 'rgba(192, 132, 252, 0.16)',
    tagBorder: 'rgba(192, 132, 252, 0.48)',
    cardBorder: 'rgba(192, 132, 252, 0.40)',
    cardBg: 'rgba(192, 132, 252, 0.07)',
    cardGlow: '0 0 22px rgba(192, 132, 252, 0.28)',
    spriteGlow: 'drop-shadow(0 0 4px rgba(192, 132, 252, 0.78))',
    auraBg: 'radial-gradient(circle, rgba(192,132,252,0.28) 0%, transparent 72%)',
  },
  Legendary: {
    label: 'Legendary',
    hex: '#fb923c',
    tagBg: 'rgba(251, 146, 60, 0.18)',
    tagBorder: 'rgba(251, 146, 60, 0.54)',
    cardBorder: 'rgba(251, 146, 60, 0.46)',
    cardBg: 'rgba(251, 146, 60, 0.08)',
    cardGlow: '0 0 24px rgba(251, 146, 60, 0.34)',
    spriteGlow: 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.85))',
    auraBg: 'radial-gradient(circle, rgba(251,146,60,0.32) 0%, transparent 72%)',
  },
};

export function getPetRarityStyle(rarity: string): PetRarityStyle {
  if (rarity in PET_RARITY_STYLES) {
    return PET_RARITY_STYLES[rarity as PetRarity];
  }
  return PET_RARITY_STYLES.Common;
}

export interface PetPerk {
  title: string;
  stats?: Partial<StatBlock>;
  bonusXp?: number;
  bonusGold?: number;
  bonusBossDmg?: number;
  bonusMp?: number;
  cleanHealHp?: number;
  rolloverBlock?: number;
}

export const PET_PERKS: Record<PetSpriteId, PetPerk> = {
  slime: { title: 'Dewy Vitality', stats: { def: 1 }, cleanHealHp: 1 },
  crab: { title: 'Shell Guard', stats: { def: 1 }, bonusBossDmg: 2 },
  squirrel: { title: "Forager's Cheek", stats: { agi: 1 }, bonusGold: 1 },
  frog: { title: 'Spring Leap', stats: { int: 1 }, bonusXp: 2 },
  fox: { title: 'Lunar Grace', stats: { int: 2 }, bonusXp: 3 },
  tortoise: { title: 'Ancient Carapace', stats: { def: 2 }, rolloverBlock: 1 },
  moth: { title: 'Guiding Glow', stats: { int: 1, agi: 1 }, bonusGold: 2 },
  cat: { title: 'Midnight Pounce', stats: { agi: 2 }, bonusBossDmg: 4 },
  owl: { title: 'Arcane Insight', stats: { int: 3 }, bonusXp: 5, bonusMp: 1 },
  bunny: { title: 'Winter Stride', stats: { agi: 3 }, bonusGold: 3 },
  beetle: { title: 'Gearwork Bastion', stats: { str: 2, def: 2 }, bonusBossDmg: 5 },
  pup: { title: 'Blazing Fang', stats: { str: 4 }, bonusBossDmg: 8 },
  axolotl: { title: 'Tidal Mending', stats: { int: 3, def: 2 }, cleanHealHp: 3 },
  griffin: { title: 'Gale Surge', stats: { str: 3, agi: 3 }, bonusGold: 4, bonusXp: 5 },
  wyrm: { title: 'Starforged Might', stats: { str: 4, int: 4 }, bonusBossDmg: 12, bonusXp: 8 },
  phoenix: { title: 'Sunfire Rebirth', stats: { def: 3, agi: 4, int: 3 }, bonusGold: 5, bonusXp: 6, cleanHealHp: 4 },
};

export interface OwnedPet {
  id: string;
  name: string;
  rarity: PetRarity | string;
  sprite: PetSpriteId;
  color: string;
  hatched: string;
  level?: number;
  feedCount?: number;
}

export interface CombatEntry {
  id: string;
  day: string;
  text: string;
  type: 'hit' | 'hurt' | 'victory' | 'heal';
}

export interface ChallengeProgress {
  joined: string;
  progress: number;
  done: boolean;
  claimed: boolean;
}

export interface GuildState {
  name: string;
  xp: number;
  buildings: Record<string, number>;
  members: string[];
}

export interface HistoryEntry {
  id: string;
  at: string;
  text: string;
}

export interface HeroSave {
  version: number;
  name: string;
  className: ClassName;
  avatar: AvatarConfig;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  mp: number;
  lastDay: string;
  habits: HabitItem[];
  todos: TodoItem[];
  rewards: RewardItem[];
  rewardMinutes: number;
  slips: string[];
  damageQueued: number;
  protection: number;
  bossWins: number;
  bossHp: number;
  combatLog: CombatEntry[];
  eggs: number;
  petFood: number;
  petsFedCount: number;
  pets: OwnedPet[];
  activePetId: string | null;
  owned: string[];
  gearPurchasedCount: number;
  equipped: Partial<Record<EquipSlot, string>>;
  costumeMode: boolean;
  costume: Partial<Record<EquipSlot, string>>;
  classProgress: Record<ClassName, number>;
  guild: GuildState;
  challenges: Record<string, ChallengeProgress>;
  habitChecks: number;
  todoChecks: number;
  cleanDays: number;
  history: HistoryEntry[];
  blockedSites: string[];
  restrictedMode: boolean;
  selectedRestrictions: string[];
  ownedCosmetics: string[];
  activeCosmetics: Partial<Record<'Frame' | 'Badge', string>>;
  friends: string[];
  soundEnabled: boolean;
  faintCount: number;
  welcomeShown: boolean;
  onboardingRewardClaimed: boolean;
}

export type GearSpriteId =
  | 'sword'
  | 'copper-sword'
  | 'moonblade'
  | 'greataxe'
  | 'staff'
  | 'wand'
  | 'dagger'
  | 'katana'
  | 'bow'
  | 'scythe'
  | 'candycane'
  | 'froststaff'
  | 'shield'
  | 'buckler'
  | 'dragonshield'
  | 'book'
  | 'orb'
  | 'lantern'
  | 'helm'
  | 'paladinhelm'
  | 'hood'
  | 'rangerhat'
  | 'crown'
  | 'pumpkinhelm'
  | 'witchhat'
  | 'santahat'
  | 'armor'
  | 'steelplate'
  | 'starrobe'
  | 'shadowleather'
  | 'verdanthide'
  | 'autumncoat'
  | 'holidaycoat'
  | 'cape'
  | 'crimsonmantle'
  | 'wings'
  | 'batcloak'
  | 'frostcloak'
  | 'glasses'
  | 'monocle'
  | 'visor'
  | 'gem'
  | 'ruby'
  | 'clover'
  | 'bell';

export interface GearItem {
  id: string;
  name: string;
  slot: EquipSlot;
  cost: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Seasonal';
  stats: Partial<StatBlock>;
  sprite: GearSpriteId;
  seasonal?: SeasonTheme;
}

export const STORE_KEY = 'arcana-v2-save';
export const OLD_STORE_KEY = 'arcana-habits-v1';

export function getActiveSeason(date = new Date()): SeasonTheme {
  const month = date.getMonth(); // 0=Jan ... 10=Nov, 11=Dec
  if (month === 11 || month === 0 || month === 1) return 'christmas';
  return 'fall';
}

export const CLASSES: ClassName[] = ['Knight', 'Mage', 'Healer', 'Rogue', 'Bowman'];

export const CLASS_COLORS: Record<ClassName, string> = {
  Knight: '#84b3ff',
  Mage: '#c196ff',
  Healer: '#63d6a6',
  Rogue: '#f5a36b',
  Bowman: '#d5d97e',
};

export const CLASS_GLYPHS: Record<ClassName, string> = {
  Knight: '♜',
  Mage: '✦',
  Healer: '✚',
  Rogue: '◈',
  Bowman: '➶',
};

export const CLASS_DESCRIPTIONS: Record<ClassName, string> = {
  Knight: 'Steel-clad frontliner with shielded resolve and heavy strikes.',
  Mage: 'Runic caster with starbound robes and high-impact arcane focus.',
  Healer: 'Sacred guardian wrapped in emerald light and restorative blessings.',
  Rogue: 'Masked skirmisher who lands swift ambushes from the shadows.',
  Bowman: 'Precision marksman trained in longbow focus and steady aim.',
};

export const CLASS_SKILLS: Record<ClassName, [string, number, string][]> = {
  Knight: [
    ['Iron Guard', 5, 'Prevent 8 HP damage on the next rollover'],
    ['Valor Strike', 6, 'Add 20+ boss damage based on STR'],
  ],
  Mage: [
    ['Starfall', 7, 'Add 32+ boss damage based on INT'],
    ['Meditation', 4, 'Recover 8 MP immediately'],
  ],
  Healer: [
    ['Sanctuary', 5, 'Heal 14+ HP based on INT'],
    ['Guardian Light', 6, 'Prevent 10 HP damage on the next rollover'],
  ],
  Rogue: [
    ['Shadow Ambush', 5, 'Add 25+ boss damage based on AGI'],
    ['Lucky Hand', 5, 'Earn 10 Gold immediately'],
  ],
  Bowman: [
    ['Deadeye', 5, 'Add 24+ boss damage based on AGI'],
    ['Steady Aim', 4, 'Add 14 boss damage and 2 XP'],
  ],
};

export const CLASS_BONUS: Record<ClassName, StatBlock> = {
  Knight: { str: 4, def: 3, int: 0, agi: 0 },
  Mage: { str: 0, def: 0, int: 5, agi: 1 },
  Healer: { str: 0, def: 2, int: 4, agi: 0 },
  Rogue: { str: 1, def: 0, int: 0, agi: 5 },
  Bowman: { str: 3, def: 0, int: 0, agi: 3 },
};

export const BG_NAMES = [
  'Moonmist Woods',
  'Sun Meadow',
  'Arcane Hall',
  'Twilight Ruins',
  'Frost Garden',
];

export const AVATAR_DEFAULT: AvatarConfig = {
  skin: 0,
  hair: 0,
  hairColor: 0,
  eyes: 0,
  eyeColor: 0,
  glasses: 0,
  top: 0,
  pants: 0,
  accessory: 0,
  bg: 0,
};

export const AVATAR_OPTIONS: Record<keyof AvatarConfig, string[]> = {
  skin: ['Porcelain', 'Honey', 'Copper', 'Warm Bronze', 'Deep Bronze', 'Olive', 'Caramel', 'Rose'],
  hair: ['Short', 'Wave', 'Messy', 'Spiky', 'Curly', 'Ponytail', 'Side Part', 'Long', 'Braids', 'Fringe'],
  hairColor: ['Raven', 'Chestnut', 'Honey', 'Silver', 'Rose', 'Violet', 'Cobalt', 'Blossom', 'Crimson', 'Moss'],
  eyes: ['Heroic', 'Sharp', 'Bright', 'Calm', 'Sleepy'],
  eyeColor: ['Obsidian', 'Sapphire', 'Emerald', 'Amber', 'Amethyst', 'Ruby'],
  glasses: ['None', 'Round', 'Gold Rimmed', 'Shades'],
  top: ['Cobalt Tunic', 'Crimson Jacket', 'Brigandine', 'Astral Robe', 'Ranger Jerkin', 'Shadow Coat', 'Scholar Vest', 'Traveler Cloak'],
  pants: ['Leather', 'Iron Greaves', 'Obsidian', 'Forest', 'Sand', 'Royal'],
  accessory: ['None', 'Traveler Cape', 'Gold Pendant', 'Explorer Scarf', 'Crimson Band', 'Leather Satchel'],
  bg: BG_NAMES,
};

export const PALETTES = {
  skin: ['#f4cba7', '#dfab80', '#c88c62', '#a2674b', '#754b37', '#dbc098', '#a96a47', '#e8ad94'],
  hair: ['#1f1d28', '#56362b', '#b5814a', '#dedce6', '#b16578', '#7552b2', '#2f6d8c', '#dc95bc', '#c9463d', '#6e8c54'],
  eye: ['#1c1926', '#2e72b8', '#2c9b6e', '#c9842b', '#8753c4', '#c23f58'],
  top: ['#4e6cc7', '#be4a62', '#6483a3', '#845ec2', '#577c4e', '#46455a', '#9c7e5a', '#7c5369'],
  pants: ['#6b523c', '#575b78', '#353642', '#476550', '#9c7f58', '#57466e'],
};

export const ITEMS: GearItem[] = [
  // Weapons
  { id: 'training-sword', name: 'Training Sword', slot: 'Weapon', cost: 0, rarity: 'Common', stats: { str: 1 }, sprite: 'sword' },
  { id: 'copper-broadsword', name: 'Copper Broadsword', slot: 'Weapon', cost: 28, rarity: 'Common', stats: { str: 3 }, sprite: 'copper-sword' },
  { id: 'moonblade', name: 'Moonsteel Blade', slot: 'Weapon', cost: 65, rarity: 'Rare', stats: { str: 5, agi: 1 }, sprite: 'moonblade' },
  { id: 'runestaff', name: 'Runebound Staff', slot: 'Weapon', cost: 75, rarity: 'Rare', stats: { int: 6 }, sprite: 'staff' },
  { id: 'shadowdagger', name: 'Shadow Fang', slot: 'Weapon', cost: 78, rarity: 'Rare', stats: { agi: 5, str: 1 }, sprite: 'dagger' },
  { id: 'huntingbow', name: 'Duskwood Bow', slot: 'Weapon', cost: 68, rarity: 'Rare', stats: { str: 3, agi: 3 }, sprite: 'bow' },
  { id: 'sunflare-axe', name: 'Sunflare Greataxe', slot: 'Weapon', cost: 115, rarity: 'Epic', stats: { str: 7, def: 1 }, sprite: 'greataxe' },
  { id: 'celestial-wand', name: 'Celestial Wand', slot: 'Weapon', cost: 110, rarity: 'Epic', stats: { int: 7, agi: 2 }, sprite: 'wand' },
  { id: 'crimson-katana', name: 'Crimson Katana', slot: 'Weapon', cost: 120, rarity: 'Epic', stats: { agi: 5, str: 4 }, sprite: 'katana' },

  // Off-hand
  { id: 'oakshield', name: 'Oak Shield', slot: 'Off-hand', cost: 30, rarity: 'Common', stats: { def: 3 }, sprite: 'shield' },
  { id: 'iron-buckler', name: 'Aegis Buckler', slot: 'Off-hand', cost: 52, rarity: 'Uncommon', stats: { def: 4, str: 1 }, sprite: 'buckler' },
  { id: 'wardbook', name: 'Tome of Stars', slot: 'Off-hand', cost: 45, rarity: 'Uncommon', stats: { int: 3 }, sprite: 'book' },
  { id: 'crystal-orb', name: 'Aether Crystal Orb', slot: 'Off-hand', cost: 82, rarity: 'Rare', stats: { int: 5, agi: 1 }, sprite: 'orb' },
  { id: 'dragon-kite', name: 'Wyrmguard Shield', slot: 'Off-hand', cost: 105, rarity: 'Epic', stats: { def: 6, str: 2 }, sprite: 'dragonshield' },

  // Head
  { id: 'ironhelm', name: 'Iron Circlet', slot: 'Head', cost: 35, rarity: 'Common', stats: { def: 2 }, sprite: 'helm' },
  { id: 'ranger-hat', name: 'Featherwood Hat', slot: 'Head', cost: 46, rarity: 'Uncommon', stats: { agi: 3, str: 1 }, sprite: 'rangerhat' },
  { id: 'silkhood', name: 'Astral Hood', slot: 'Head', cost: 48, rarity: 'Uncommon', stats: { int: 3, def: 1 }, sprite: 'hood' },
  { id: 'paladin-helm', name: 'Paladin Greathelm', slot: 'Head', cost: 84, rarity: 'Rare', stats: { def: 5, str: 2 }, sprite: 'paladinhelm' },
  { id: 'gold-crown', name: 'Sovereign Crown', slot: 'Head', cost: 130, rarity: 'Epic', stats: { int: 4, agi: 3, def: 2 }, sprite: 'crown' },

  // Armor
  { id: 'wandercoat', name: 'Wanderer Coat', slot: 'Armor', cost: 48, rarity: 'Uncommon', stats: { def: 4 }, sprite: 'armor' },
  { id: 'emerald-tunic', name: 'Verdant Brigandine', slot: 'Armor', cost: 54, rarity: 'Uncommon', stats: { def: 3, agi: 2 }, sprite: 'verdanthide' },
  { id: 'steelplate', name: 'Knightly Steelplate', slot: 'Armor', cost: 88, rarity: 'Rare', stats: { def: 6, str: 2 }, sprite: 'steelplate' },
  { id: 'star-robe', name: 'Archmage Vestments', slot: 'Armor', cost: 85, rarity: 'Rare', stats: { int: 5, def: 3 }, sprite: 'starrobe' },
  { id: 'shadow-leathers', name: 'Shadowstalker Vest', slot: 'Armor', cost: 86, rarity: 'Rare', stats: { agi: 5, def: 3 }, sprite: 'shadowleather' },

  // Back
  { id: 'nightcloak', name: 'Nightfall Cape', slot: 'Back', cost: 42, rarity: 'Uncommon', stats: { agi: 2 }, sprite: 'cape' },
  { id: 'crimson-mantle', name: 'Royal Velvet Mantle', slot: 'Back', cost: 74, rarity: 'Rare', stats: { str: 2, def: 3 }, sprite: 'crimsonmantle' },
  { id: 'feather-wings', name: 'Seraph Wings', slot: 'Back', cost: 135, rarity: 'Epic', stats: { agi: 5, int: 3 }, sprite: 'wings' },

  // Eyewear
  { id: 'glasses', name: 'Scholar Lenses', slot: 'Eyewear', cost: 30, rarity: 'Common', stats: { int: 2 }, sprite: 'glasses' },
  { id: 'monocle', name: 'Gilded Monocle', slot: 'Eyewear', cost: 44, rarity: 'Uncommon', stats: { int: 2, agi: 2 }, sprite: 'monocle' },
  { id: 'arcane-visor', name: 'Rune Visor', slot: 'Eyewear', cost: 72, rarity: 'Rare', stats: { int: 4, str: 2 }, sprite: 'visor' },

  // Accessory
  { id: 'lucky-clover', name: 'Four-Leaf Charm', slot: 'Accessory', cost: 38, rarity: 'Uncommon', stats: { agi: 3 }, sprite: 'clover' },
  { id: 'moonpendant', name: 'Moon Pendant', slot: 'Accessory', cost: 58, rarity: 'Rare', stats: { int: 2, agi: 2 }, sprite: 'gem' },
  { id: 'ruby-amulet', name: 'Heartfire Amulet', slot: 'Accessory', cost: 68, rarity: 'Rare', stats: { str: 3, def: 2 }, sprite: 'ruby' },

  // Seasonal: Fall & Halloween (Active Oct–Nov)
  { id: 'pumpkin-helm', name: "Jack-o'-Lantern Helm", slot: 'Head', cost: 65, rarity: 'Seasonal', stats: { def: 4, str: 2 }, sprite: 'pumpkinhelm', seasonal: 'fall' },
  { id: 'witch-hat', name: 'Harvest Witch Hat', slot: 'Head', cost: 70, rarity: 'Seasonal', stats: { int: 5, agi: 1 }, sprite: 'witchhat', seasonal: 'fall' },
  { id: 'reaper-scythe', name: 'Twilight Harvester Scythe', slot: 'Weapon', cost: 95, rarity: 'Seasonal', stats: { str: 5, agi: 4 }, sprite: 'scythe', seasonal: 'fall' },
  { id: 'pumpkin-lantern', name: 'Wisp Jack-o-Lantern', slot: 'Off-hand', cost: 55, rarity: 'Seasonal', stats: { int: 4, def: 1 }, sprite: 'lantern', seasonal: 'fall' },
  { id: 'bat-cloak', name: 'Midnight Batwing Cloak', slot: 'Back', cost: 75, rarity: 'Seasonal', stats: { agi: 4, int: 2 }, sprite: 'batcloak', seasonal: 'fall' },
  { id: 'autumn-cloak', name: 'Amber Leaf Coat', slot: 'Armor', cost: 72, rarity: 'Seasonal', stats: { def: 4, agi: 3 }, sprite: 'autumncoat', seasonal: 'fall' },

  // Seasonal: Christmas / Winter (Unlocks December 1)
  { id: 'santa-hat', name: 'Festive Crimson Hat', slot: 'Head', cost: 65, rarity: 'Seasonal', stats: { agi: 3, def: 3 }, sprite: 'santahat', seasonal: 'christmas' },
  { id: 'candycane-blade', name: 'Peppermint Edge', slot: 'Weapon', cost: 85, rarity: 'Seasonal', stats: { str: 6, agi: 2 }, sprite: 'candycane', seasonal: 'christmas' },
  { id: 'frost-staff', name: 'Northstar Scepter', slot: 'Weapon', cost: 95, rarity: 'Seasonal', stats: { int: 7, def: 1 }, sprite: 'froststaff', seasonal: 'christmas' },
  { id: 'holiday-coat', name: 'Wintertide Fur Coat', slot: 'Armor', cost: 78, rarity: 'Seasonal', stats: { def: 5, int: 2 }, sprite: 'holidaycoat', seasonal: 'christmas' },
  { id: 'frost-cloak', name: 'Snowfall Cape', slot: 'Back', cost: 72, rarity: 'Seasonal', stats: { agi: 3, def: 3 }, sprite: 'frostcloak', seasonal: 'christmas' },
  { id: 'gift-charm', name: 'Golden Bell Charm', slot: 'Accessory', cost: 60, rarity: 'Seasonal', stats: { int: 3, agi: 3 }, sprite: 'bell', seasonal: 'christmas' },
];

export const EQUIP_SLOTS: EquipSlot[] = [
  'Weapon',
  'Off-hand',
  'Head',
  'Armor',
  'Back',
  'Eyewear',
  'Accessory',
];

export const CHALLENGES = [
  { id: 'focus', name: 'The Focus Trials', desc: 'Complete 5 good habit check-offs.', target: 5, kind: 'habit', joinGold: 20, completionGold: 55, completionXP: 75, color: '#a48aff' },
  { id: 'quests', name: 'The Questkeeper', desc: 'Finish 3 one-time To-Dos.', target: 3, kind: 'todo', joinGold: 20, completionGold: 45, completionXP: 60, color: '#e4b77d' },
  { id: 'streak', name: 'Seven-Day Oath', desc: 'Finish daily rollover with a clean day 5 times.', target: 5, kind: 'clean', joinGold: 20, completionGold: 70, completionXP: 90, color: '#73cea5' },
  { id: 'boss', name: 'Wyrm Hunter', desc: 'Defeat 1 raid boss.', target: 1, kind: 'boss', joinGold: 20, completionGold: 65, completionXP: 90, color: '#e38496' },
] as const;

export const CITY_BUILDINGS = [
  { id: 'hall', name: 'Guild Hall', icon: '♜', desc: '+1 bonus Gold on completed quests per level', base: 35 },
  { id: 'forge', name: 'Moon Forge', icon: '⚒', desc: '+1 STR attribute per level', base: 30 },
  { id: 'library', name: 'Rune Library', icon: '✧', desc: '+1 INT & +2 XP per completed quest per level', base: 30 },
  { id: 'garden', name: 'Healing Garden', icon: '❀', desc: 'Restore +1 HP on clean day rollover per level', base: 25 },
] as const;

export const COSMETICS = [
  { id: 'frame-violet', name: 'Moonlit Frame', type: 'Frame' as const, cost: 45, icon: '✧', shop: 'Customization Shop' as const },
  { id: 'frame-gold', name: 'Royal Frame', type: 'Frame' as const, cost: 75, icon: '✦', shop: 'Customization Shop' as const },
  { id: 'badge-comet', name: 'Comet Crest', type: 'Badge' as const, cost: 45, icon: '✶', shop: 'Customization Shop' as const },
  { id: 'autumn-wisp', name: 'Harvest Wisp', type: 'Badge' as const, cost: 85, icon: '❧', shop: 'Seasonal Shop' as const, seasonal: 'fall' as SeasonTheme },
  { id: 'winter-crown', name: 'Frost Crown', type: 'Badge' as const, cost: 80, icon: '❄', shop: 'Seasonal Shop' as const, seasonal: 'christmas' as SeasonTheme },
  { id: 'time-rune', name: 'Ancient Rune', type: 'Frame' as const, cost: 140, icon: '◇', shop: 'Time Traveler Shop' as const },
];

export const QUEST_SHOP = [
  { id: 'scroll-damage', name: 'Attack Scroll', cost: 32, desc: 'Queue +15 boss damage for the next battle' },
  { id: 'healing-elixir', name: 'Healing Elixir', cost: 28, desc: 'Restore 12 HP immediately' },
  { id: 'mana-tonic', name: 'Mana Tonic', cost: 22, desc: 'Restore 8 MP immediately' },
  { id: 'pet-treats', name: '3x Pet Treats', cost: 15, desc: 'Feed your summoned pets to level them up' },
];

export const PETS: { name: string; rarity: PetRarity; weight: number; color: string; sprite: PetSpriteId }[] = [
  // Common (48%)
  { name: 'Sprout Slime', rarity: 'Common', weight: 14, color: '#6fd8a8', sprite: 'slime' },
  { name: 'Pebble Crab', rarity: 'Common', weight: 12, color: '#e07a5f', sprite: 'crab' },
  { name: 'Acorn Squirrel', rarity: 'Common', weight: 11, color: '#cc8852', sprite: 'squirrel' },
  { name: 'Dewdrop Frog', rarity: 'Common', weight: 11, color: '#78cc66', sprite: 'frog' },
  // Uncommon (28%)
  { name: 'Moon Fox', rarity: 'Uncommon', weight: 8, color: '#cfa8fa', sprite: 'fox' },
  { name: 'Moss Tortoise', rarity: 'Uncommon', weight: 7, color: '#6eb583', sprite: 'tortoise' },
  { name: 'Lantern Moth', rarity: 'Uncommon', weight: 7, color: '#f2cc6b', sprite: 'moth' },
  { name: 'Shadow Cat', rarity: 'Uncommon', weight: 6, color: '#8683a8', sprite: 'cat' },
  // Rare (14%)
  { name: 'Rune Owl', rarity: 'Rare', weight: 5, color: '#75cde6', sprite: 'owl' },
  { name: 'Frost Bunny', rarity: 'Rare', weight: 5, color: '#b8e8ff', sprite: 'bunny' },
  { name: 'Clockwork Beetle', rarity: 'Rare', weight: 4, color: '#d9a452', sprite: 'beetle' },
  // Epic (8%)
  { name: 'Ember Pup', rarity: 'Epic', weight: 3, color: '#ff9d5c', sprite: 'pup' },
  { name: 'Abyssal Axolotl', rarity: 'Epic', weight: 3, color: '#f58eb8', sprite: 'axolotl' },
  { name: 'Storm Griffin', rarity: 'Epic', weight: 2, color: '#8fb2f5', sprite: 'griffin' },
  // Legendary (2%)
  { name: 'Astral Wyrmling', rarity: 'Legendary', weight: 1, color: '#f5d57a', sprite: 'wyrm' },
  { name: 'Solar Phoenix', rarity: 'Legendary', weight: 1, color: '#ff7447', sprite: 'phoenix' },
];

export const BOSSES = [
  { name: 'THE HOLLOW WYRM', subtitle: 'The hunger beneath unfinished plans', hp: 220, color: '#d37479', art: 'wyrm' as const },
  { name: 'THE OBSIDIAN ARCHIVIST', subtitle: 'A keeper of unanswered promises', hp: 320, color: '#91a7e2', art: 'golem' as const },
  { name: 'THE NIGHTSHADE SOVEREIGN', subtitle: 'The shadow that grows when time is lost', hp: 430, color: '#a887d4', art: 'hydra' as const },
];
