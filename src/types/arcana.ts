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
export type TaskPriority = 'A' | 'B' | 'C';
export type LifeDomain = 'Knowledge' | 'Strength' | 'Discipline' | 'Mindfulness';
export type TabId = 'habits' | 'todos' | 'rewards' | 'realm';
export type SeasonTheme = 'fall' | 'christmas';
export type AppLanguage = 'en' | 'de';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'any';

export type RealmSection =
  | ''
  | 'Profile'
  | 'Stats'
  | 'Skills'
  | 'Skill Tree'
  | 'World Map'
  | 'My Home'
  | 'Analytics'
  | 'Weekly Review'
  | 'Equipment'
  | 'Pets'
  | 'Boss'
  | 'Challenges'
  | 'Market'
  | 'Customization Shop'
  | 'Seasonal Shop'
  | 'Time Traveler Shop'
  | 'Achievements'
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
  priority?: TaskPriority;
  domain?: LifeDomain;
  timeOfDay?: TimeOfDay;
  pinnedToBoard?: boolean;
  createdDate: string;
  doneDates: string[];
  slips: string[];
  streak: number;
}

export interface TodoItem {
  id: string;
  title: string;
  dueDate: string;
  priority?: TaskPriority;
  domain?: LifeDomain;
  pinnedToBoard?: boolean;
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
  nickname?: string;
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

export interface DailyQuestEntry {
  id: string;
  refType: 'habit' | 'todo';
  refId: string;
  title: string;
  priority: TaskPriority;
  domain: LifeDomain;
  xpReward: number;
  goldReward: number;
  done: boolean;
  pinned?: boolean;
}

export interface DailyQuestBoard {
  date: string;
  quests: DailyQuestEntry[];
  bonusClaimed: boolean;
}

export interface WorldState {
  currentRegionId: string;
  exploredRegions: string[];
  claimedChests: string[];
  lastEncounterByRegion?: Record<string, string>;
  regionMastery?: Record<string, number>;
  merchantDiscountPct?: number;
}

export interface SkillTreeState {
  domainXp: Record<LifeDomain, number>;
  domainLevel: Record<LifeDomain, number>;
  skillPoints: number;
  unlockedNodes: string[];
}

export interface WeeklyBossState {
  weekKey: string;
  bossIndex: number;
  maxHp: number;
  hp: number;
  damageDealt: number;
  specialStrikes: number;
  habitsHit: number;
  evaluated: boolean;
  affinityDomain?: LifeDomain;
}

export type HomeRoomId = 'living' | 'library' | 'training' | 'garden' | 'trophy';

export interface HomeState {
  houseName: string;
  rooms: Record<HomeRoomId, number>;
  furniture: string[];
  trophies: string[];
}

export interface ActiveFocusSession {
  durationMin: 25 | 50 | 90;
  startedAt: number;
  questRefType: 'habit' | 'todo' | 'free';
  questRefId: string;
  questTitle: string;
  domain: LifeDomain;
}

export interface FocusHistoryEntry {
  id: string;
  date: string;
  minutes: number;
  domain: LifeDomain;
  questTitle: string;
  xp: number;
}

export interface FocusSessionState {
  active: ActiveFocusSession | null;
  totalMinutes: number;
  sessionsCompleted: number;
  history: FocusHistoryEntry[];
}

export interface DailyStatsRecord {
  date: string;
  completedTasks: number;
  focusMinutes: number;
  xpEarned: number;
  hpLost: number;
  cleanDay: boolean;
}

export interface WeeklyReviewHistory {
  weekKey: string;
  questsDone: number;
  focusMinutes: number;
  hpLost: number;
  bossDmg: number;
  goals: string[];
}

export interface WeeklyReviewState {
  lastReviewedWeek: string;
  nextWeekGoals: string[];
  pastReviews: WeeklyReviewHistory[];
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
  dailyBoard: DailyQuestBoard;
  world: WorldState;
  skillTree: SkillTreeState;
  weeklyBoss: WeeklyBossState;
  home: HomeState;
  focus: FocusSessionState;
  dailyHistory: Record<string, DailyStatsRecord>;
  weeklyReview: WeeklyReviewState;
  language?: AppLanguage;
  routineCombosDate?: string;
  routineCombosDone?: ('morning' | 'day' | 'evening')[];
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
  {
    id: 'focus',
    name: 'The Focus Trials',
    badgeName: 'Focus Emblem',
    desc: 'Complete 5 good habit check-offs.',
    target: 5,
    kind: 'habit',
    joinGold: 20,
    completionGold: 55,
    completionXP: 75,
    color: '#a48aff',
  },
  {
    id: 'quests',
    name: 'The Questkeeper',
    badgeName: 'Questkeeper Seal',
    desc: 'Finish 3 one-time To-Dos.',
    target: 3,
    kind: 'todo',
    joinGold: 20,
    completionGold: 45,
    completionXP: 60,
    color: '#e4b77d',
  },
  {
    id: 'streak',
    name: 'Seven-Day Oath',
    badgeName: 'Oath Flame Crest',
    desc: 'Finish daily rollover with a clean day 5 times.',
    target: 5,
    kind: 'clean',
    joinGold: 20,
    completionGold: 70,
    completionXP: 90,
    color: '#73cea5',
  },
  {
    id: 'boss',
    name: 'Wyrm Hunter',
    badgeName: 'Wyrmslayer Medallion',
    desc: 'Defeat 1 raid boss.',
    target: 1,
    kind: 'boss',
    joinGold: 20,
    completionGold: 65,
    completionXP: 90,
    color: '#e38496',
  },
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
  {
    id: 'mystery-chest',
    name: "Merlin's Mystery Chest",
    cost: 100,
    desc: 'Unlock a random unowned gear item (or +1 Pet Egg & +35 XP if all gear owned)',
    category: 'Chest',
    featured: true,
    pinned: true,
  },
  {
    id: 'healing-elixir',
    name: 'Healing Elixir',
    cost: 28,
    desc: 'Restore 12 HP immediately',
    category: 'Potion',
    featured: true,
    pinned: false,
  },
  {
    id: 'pet-treats',
    name: '3x Pet Treats',
    cost: 15,
    desc: 'Feed your summoned pets to level them up',
    category: 'Companion',
    featured: true,
    pinned: false,
  },
  {
    id: 'bounty-writ',
    name: "Merlin's Bounty Writ",
    cost: 10,
    desc: 'Queue +10 Boss DMG and gain +6 XP immediately',
    category: 'Scroll',
    featured: true,
    pinned: false,
  },
  {
    id: 'scroll-damage',
    name: 'Attack Scroll',
    cost: 32,
    desc: 'Queue +15 boss damage for the next battle',
    category: 'Scroll',
    featured: false,
    pinned: false,
  },
  {
    id: 'mana-tonic',
    name: 'Mana Tonic',
    cost: 22,
    desc: 'Restore 8 MP immediately',
    category: 'Potion',
    featured: false,
    pinned: false,
  },
] as const;

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

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; short: string; xpMult: number; goldMult: number; dmgMult: number; color: string; bg: string }
> = {
  A: {
    label: 'Priority A · High Impact',
    short: 'A',
    xpMult: 1.5,
    goldMult: 1.5,
    dmgMult: 1.6,
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.16)',
  },
  B: {
    label: 'Priority B · Standard',
    short: 'B',
    xpMult: 1.0,
    goldMult: 1.0,
    dmgMult: 1.0,
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.14)',
  },
  C: {
    label: 'Priority C · Light',
    short: 'C',
    xpMult: 0.75,
    goldMult: 0.75,
    dmgMult: 0.75,
    color: '#9c9cb0',
    bg: 'rgba(156, 156, 176, 0.14)',
  },
};

export const LIFE_DOMAINS: LifeDomain[] = ['Knowledge', 'Strength', 'Discipline', 'Mindfulness'];

export const DOMAIN_META: Record<
  LifeDomain,
  { color: string; desc: string; examples: string }
> = {
  Knowledge: {
    color: '#60a5fa',
    desc: 'Reading, studying, writing, coding & deep learning.',
    examples: 'Study, Read, Course, Code',
  },
  Strength: {
    color: '#f87171',
    desc: 'Workouts, running, sports, mobility & physical vitality.',
    examples: 'Gym, Run, Pushups, Walk',
  },
  Discipline: {
    color: '#fbbf24',
    desc: 'Routines, chores, planning, budgeting & consistency.',
    examples: 'Clean, Plan, No Sugar, Budget',
  },
  Mindfulness: {
    color: '#5ce09e',
    desc: 'Meditation, journaling, sleep, breathwork & reflection.',
    examples: 'Meditate, Journal, Sleep',
  },
};

export interface WorldRegionDef {
  id: string;
  name: string;
  biome: 'Forest' | 'Village' | 'Dungeon' | 'Castle' | 'Sanctuary' | 'Citadel';
  difficulty: 'Safe' | 'Guarded' | 'Perilous' | 'Deadly' | 'Mythic' | 'Abyssal';
  desc: string;
  lore: string;
  reqLevel: number;
  reqChecks: number;
  reqFocusMin: number;
  reqBossWins: number;
  reqStreak?: number;
  reqStatSum?: number;
  reqDomainLv?: number;
  trialLabelEn: string;
  trialLabelDe: string;
  rewardXp: number;
  rewardGold: number;
  rewardEgg?: boolean;
  mapX: number;
  mapY: number;
  color: string;
}

export const WORLD_REGIONS: WorldRegionDef[] = [
  {
    id: 'whispering-woods',
    name: 'Whispering Woods',
    biome: 'Forest',
    difficulty: 'Safe',
    desc: 'Sunlit pine trails where every lone adventurer tests their first daily rhythm.',
    lore: 'Ancient moss stones hum softly whenever you check off a habit at dawn.',
    reqLevel: 1,
    reqChecks: 0,
    reqFocusMin: 0,
    reqBossWins: 0,
    trialLabelEn: 'Starter Sanctuary',
    trialLabelDe: 'Start-Zuflucht',
    rewardXp: 25,
    rewardGold: 20,
    mapX: 16,
    mapY: 66,
    color: '#5ce09e',
  },
  {
    id: 'oakhaven-village',
    name: 'Oakhaven Village',
    biome: 'Village',
    difficulty: 'Guarded',
    desc: 'A lantern-lit river port welcoming disciplined solo travelers.',
    lore: 'Timber workshops, river docks, and hearth smoke mark the heart of the valley.',
    reqLevel: 2,
    reqChecks: 5,
    reqFocusMin: 0,
    reqBossWins: 0,
    reqStreak: 2,
    trialLabelEn: '2-Day Habit Streak',
    trialLabelDe: '2-Tage-Streak',
    rewardXp: 45,
    rewardGold: 40,
    mapX: 34,
    mapY: 44,
    color: '#e8b84b',
  },
  {
    id: 'moss-catacombs',
    name: 'Moss Catacombs',
    biome: 'Dungeon',
    difficulty: 'Perilous',
    desc: 'Subterranean vaults where procrastination shadows ambush lone scouts.',
    lore: 'Torches flare brighter with every streak you defend in battle.',
    reqLevel: 4,
    reqChecks: 15,
    reqFocusMin: 0,
    reqBossWins: 1,
    reqStreak: 4,
    trialLabelEn: '4-Day Habit Streak',
    trialLabelDe: '4-Tage-Streak',
    rewardXp: 75,
    rewardGold: 60,
    rewardEgg: true,
    mapX: 52,
    mapY: 68,
    color: '#a78bfa',
  },
  {
    id: 'sunspire-keep',
    name: 'Sunspire Keep',
    biome: 'Castle',
    difficulty: 'Deadly',
    desc: 'High limestone battlements guarding the arid eastern plateau.',
    lore: 'Only solo heroes tempered in gear and battle stats hold its banners.',
    reqLevel: 6,
    reqChecks: 28,
    reqFocusMin: 0,
    reqBossWins: 2,
    reqStatSum: 26,
    trialLabelEn: '26+ Total Hero Stats',
    trialLabelDe: '26+ Gesamt-Attribute',
    rewardXp: 105,
    rewardGold: 85,
    mapX: 68,
    mapY: 36,
    color: '#60a5fa',
  },
  {
    id: 'astral-observatory',
    name: 'Astral Observatory',
    biome: 'Sanctuary',
    difficulty: 'Mythic',
    desc: 'A snow-peaked crystal dome tuned to deep mastery and inner poise.',
    lore: 'Starlight lenses chart your skill-tree progress across the northern sky.',
    reqLevel: 8,
    reqChecks: 42,
    reqFocusMin: 0,
    reqBossWins: 3,
    reqDomainLv: 3,
    trialLabelEn: 'Any Skill Lv. 3+',
    trialLabelDe: 'Ein Skill Lv. 3+',
    rewardXp: 140,
    rewardGold: 110,
    rewardEgg: true,
    mapX: 84,
    mapY: 62,
    color: '#38bdf8',
  },
  {
    id: 'obsidian-citadel',
    name: 'Obsidian Citadel',
    biome: 'Citadel',
    difficulty: 'Abyssal',
    desc: 'The volcanic throne where Raid Bosses forge their storms against solo champions.',
    lore: 'Its iron gates yield only to unwavering streaks, battle power, and boss victories.',
    reqLevel: 10,
    reqChecks: 60,
    reqFocusMin: 0,
    reqBossWins: 5,
    reqStreak: 7,
    reqStatSum: 42,
    trialLabelEn: '7-Day Streak & 42+ Stats',
    trialLabelDe: '7-Tage-Streak & 42+ Stats',
    rewardXp: 200,
    rewardGold: 160,
    rewardEgg: true,
    mapX: 86,
    mapY: 22,
    color: '#fb923c',
  },
];

export interface SkillNodeDef {
  id: string;
  domain: LifeDomain;
  tier: 1 | 2 | 3;
  name: string;
  effect: string;
  cost: number;
  requires?: string;
}

export const SKILL_TREE_NODES: SkillNodeDef[] = [
  { id: 'know-1', domain: 'Knowledge', tier: 1, name: "Scholar's Spark", effect: '+15% XP from completed quests', cost: 1 },
  { id: 'know-2', domain: 'Knowledge', tier: 2, name: 'Arcane Flow', effect: '+2 INT & +1 MP per habit check', cost: 1, requires: 'know-1' },
  { id: 'know-3', domain: 'Knowledge', tier: 3, name: 'Master Thesis', effect: '+4 XP on Priority A & B quests', cost: 2, requires: 'know-2' },

  { id: 'str-1', domain: 'Strength', tier: 1, name: 'Iron Form', effect: '+3 Boss DMG per completed quest', cost: 1 },
  { id: 'str-2', domain: 'Strength', tier: 2, name: 'Titan Grip', effect: '+2 STR & +30% Special Attack DMG', cost: 1, requires: 'str-1' },
  { id: 'str-3', domain: 'Strength', tier: 3, name: 'Dragonbreaker', effect: '+8 Boss DMG on every quest', cost: 2, requires: 'str-2' },

  { id: 'disc-1', domain: 'Discipline', tier: 1, name: 'Steady Pace', effect: '+2 Gold per completed quest', cost: 1 },
  { id: 'disc-2', domain: 'Discipline', tier: 2, name: 'Ironclad Will', effect: '+2 DEF & block 2 missed-habit DMG', cost: 1, requires: 'disc-1' },
  { id: 'disc-3', domain: 'Discipline', tier: 3, name: 'Unbroken Oath', effect: '+25% Gold from Daily Board & Bosses', cost: 2, requires: 'disc-2' },

  { id: 'mind-1', domain: 'Mindfulness', tier: 1, name: 'Calm Breath', effect: '+2 HP healed on clean day rollover', cost: 1 },
  { id: 'mind-2', domain: 'Mindfulness', tier: 2, name: 'Deep Presence', effect: '+2 XP per quest & +1 AGI', cost: 1, requires: 'mind-1' },
  { id: 'mind-3', domain: 'Mindfulness', tier: 3, name: 'Inner Sanctuary', effect: 'Bad habit slips deal 3 HP instead of 5', cost: 2, requires: 'mind-2' },
];

export const HOME_ROOMS: {
  id: HomeRoomId;
  name: string;
  desc: string;
  baseCost: number;
  maxLevel: number;
}[] = [
  { id: 'living', name: 'Hearth & Living Hall', desc: '+2 Gold per completed quest per level', baseCost: 40, maxLevel: 5 },
  { id: 'library', name: 'Study Library', desc: '+2 XP per completed quest per level', baseCost: 45, maxLevel: 5 },
  { id: 'training', name: 'Training Room', desc: '+1 STR & +2 Boss DMG per level', baseCost: 45, maxLevel: 5 },
  { id: 'garden', name: 'Herb Garden', desc: 'Restore +1 HP on clean day rollover per level', baseCost: 35, maxLevel: 5 },
  { id: 'trophy', name: 'Trophy Alcove', desc: '+1 DEF per level (+1 All Stats at Lv. 3+)', baseCost: 50, maxLevel: 5 },
];

export const HOME_FURNITURE: {
  id: string;
  name: string;
  room: HomeRoomId;
  cost: number;
  perk: string;
}[] = [
  { id: 'oak-hearth', name: 'Crackling Hearth', room: 'living', cost: 45, perk: '+1 HP healed on clean days' },
  { id: 'woven-rug', name: 'Embroidered Tapestry Rug', room: 'living', cost: 55, perk: '+2 Gold on Daily Board bonus' },
  { id: 'scholar-desk', name: 'Rune-Carved Desk', room: 'library', cost: 60, perk: '+1 INT permanently' },
  { id: 'star-telescope', name: 'Brass Astrolabe', room: 'library', cost: 85, perk: '+15% Quest XP' },
  { id: 'iron-dummy', name: 'Sparring Automaton', room: 'training', cost: 65, perk: '+3 Boss DMG per quest' },
  { id: 'moon-planter', name: 'Moonflower Planter', room: 'garden', cost: 50, perk: '+1 AGI permanently' },
];

export const HOME_TROPHIES: Record<string, { name: string; desc: string; color: string }> = {
  'first-weekly-boss': { name: 'Warden Banner', desc: 'Defeated or survived your first Weekly Boss.', color: '#fb923c' },
  'boss-slayer': { name: 'Wyrmfang Crest', desc: 'Vanquished a Raid Boss.', color: '#e25f5f' },
  'focus-adept': { name: 'Hourglass Relic', desc: 'Completed 25 Habits & To-Dos.', color: '#60a5fa' },
  'world-explorer': { name: 'Cartographer Compass', desc: 'Explored 3 regions of the RPG World.', color: '#5ce09e' },
  'board-master': { name: 'Golden Seal', desc: 'Completed a full Daily Quest Board.', color: '#e8b84b' },
};

export const WEEKLY_BOSSES = [
  { name: 'THE IRON LEVIATHAN', title: 'Breaker of Routines', baseHp: 350, color: '#e05f72', art: 'wyrm' as const },
  { name: 'THE CHRONO WARDEN', title: 'Lord of Drifting Hours', baseHp: 420, color: '#60a5fa', art: 'golem' as const },
  { name: 'THE ECLIPSE HYDRA', title: 'Threefold Shadow of Doubt', baseHp: 500, color: '#a78bfa', art: 'hydra' as const },
];

