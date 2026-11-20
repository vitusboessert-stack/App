import {
  AVATAR_DEFAULT,
  BOSSES,
  CHALLENGES,
  CITY_BUILDINGS,
  CLASS_BONUS,
  CLASS_SKILLS,
  CLASSES,
  COSMETICS,
  EQUIP_SLOTS,
  getActiveSeason,
  HOME_FURNITURE,
  HOME_ROOMS,
  ITEMS,
  LIFE_DOMAINS,
  OLD_STORE_KEY,
  PET_PERKS,
  PETS,
  PRIORITY_CONFIG,
  QUEST_SHOP,
  SKILL_TREE_NODES,
  STORE_KEY,
  WEEKLY_BOSSES,
  WORLD_REGIONS,
  type AvatarConfig,
  type AppLanguage,
  type ClassName,
  type DailyQuestBoard,
  type DailyQuestEntry,
  type DailyStatsRecord,
  type FocusSessionState,
  type HabitItem,
  type HabitKind,
  type HabitRhythm,
  type HeroSave,
  type HomeRoomId,
  type HomeState,
  type LifeDomain,
  type OwnedPet,
  type PetSpriteId,
  type SkillTreeState,
  type StatBlock,
  type TaskPriority,
  type TimeOfDay,
  type TodoItem,
  type WeeklyBossState,
  type WeeklyReviewState,
  type WorldRegionDef,
  type WorldState,
} from '../types/arcana';

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function shiftDate(s: string, n: number): string {
  const d = new Date(`${s}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dayBetween(s: string, e: string): number {
  return Math.round((new Date(`${e}T12:00:00`).getTime() - new Date(`${s}T12:00:00`).getTime()) / 86400000);
}

export function getIsoWeekKey(dateStr = today()): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function isSunday(dateStr = today()): boolean {
  return new Date(`${dateStr}T12:00:00`).getDay() === 0;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const maxHp = (level: number) => 50 + 2 * Math.floor(level / 5);
export const maxMp = (level: number) => 20 + 2 * Math.floor(level / 5);
export const xpNeeded = (level: number) => 50 + level * 25;

export function getBossForWins(wins: number) {
  return BOSSES[wins % BOSSES.length];
}

export function getBossMaxHp(wins: number): number {
  const boss = getBossForWins(wins);
  return boss.hp + Math.floor(wins / 3) * 35;
}

export function inferDomain(title: string): LifeDomain {
  const t = title.toLowerCase();
  if (/(read|study|learn|book|code|write|course|vocab|math|essay|research)/.test(t)) return 'Knowledge';
  if (/(gym|run|workout|train|pushup|squat|walk|swim|bike|lift|sport|stretch)/.test(t)) return 'Strength';
  if (/(meditat|journal|sleep|breath|yoga|mindful|gratitude|calm|relax|walk)/.test(t)) return 'Mindfulness';
  return 'Discipline';
}

export function getPriorityConfig(priority?: TaskPriority) {
  return PRIORITY_CONFIG[priority || 'B'] || PRIORITY_CONFIG.B;
}

function defaultWorldState(): WorldState {
  return {
    currentRegionId: 'whispering-woods',
    exploredRegions: ['whispering-woods'],
    claimedChests: [],
    lastEncounterByRegion: {},
    regionMastery: {},
    merchantDiscountPct: 0,
  };
}

function defaultSkillTreeState(): SkillTreeState {
  return {
    domainXp: { Knowledge: 0, Strength: 0, Discipline: 0, Mindfulness: 0 },
    domainLevel: { Knowledge: 1, Strength: 1, Discipline: 1, Mindfulness: 1 },
    skillPoints: 1,
    unlockedNodes: [],
  };
}

function createWeeklyBossForWeek(weekKey: string, bossIndex = 0): WeeklyBossState {
  const template = WEEKLY_BOSSES[bossIndex % WEEKLY_BOSSES.length];
  return {
    weekKey,
    bossIndex,
    maxHp: template.baseHp,
    hp: template.baseHp,
    damageDealt: 0,
    specialStrikes: 0,
    habitsHit: 0,
    evaluated: false,
    affinityDomain: LIFE_DOMAINS[bossIndex % LIFE_DOMAINS.length],
  };
}

function defaultHomeState(): HomeState {
  return {
    houseName: 'Oakhearth Cottage',
    rooms: { living: 1, library: 0, training: 0, garden: 0, trophy: 0, basement: 0 },
    furniture: [],
    trophies: [],
  };
}

function defaultFocusState(): FocusSessionState {
  return {
    active: null,
    totalMinutes: 0,
    sessionsCompleted: 0,
    history: [],
  };
}

function defaultWeeklyReviewState(): WeeklyReviewState {
  return {
    lastReviewedWeek: '',
    nextWeekGoals: [],
    pastReviews: [],
  };
}

export function defaultSave(
  name = 'Adventurer',
  cls: ClassName = 'Knight',
  avatar: Partial<AvatarConfig> = {}
): HeroSave {
  return {
    version: 2,
    name: name.trim() || 'Adventurer',
    className: cls,
    avatar: { ...AVATAR_DEFAULT, ...avatar },
    level: 1,
    xp: 0,
    gold: 35,
    hp: 50,
    mp: 20,
    lastDay: today(),
    habits: [],
    todos: [],
    rewards: [
      { id: 'yt', title: 'YouTube session', minutes: 15, cost: 25 },
      { id: 'social', title: 'Social break', minutes: 30, cost: 45 },
    ],
    rewardMinutes: 0,
    slips: [],
    damageQueued: 0,
    protection: 0,
    bossWins: 0,
    bossHp: BOSSES[0].hp,
    combatLog: [],
    eggs: 1,
    petFood: 3,
    petsFedCount: 0,
    pets: [],
    activePetId: null,
    owned: ['training-sword'],
    gearPurchasedCount: 0,
    equipped: { Weapon: 'training-sword' },
    costumeMode: false,
    costume: {},
    classProgress: Object.fromEntries(CLASSES.map((c) => [c, 1])) as Record<ClassName, number>,
    guild: { name: '', xp: 0, buildings: { hall: 1, forge: 0, library: 0, garden: 0 }, members: [] },
    challenges: {},
    habitChecks: 0,
    todoChecks: 0,
    cleanDays: 0,
    history: [],
    blockedSites: ['adult content'],
    restrictedMode: true,
    selectedRestrictions: ['adult content'],
    ownedCosmetics: [],
    activeCosmetics: {},
    friends: [],
    soundEnabled: true,
    faintCount: 0,
    welcomeShown: false,
    onboardingRewardClaimed: false,
    dailyBoard: { date: today(), quests: [], bonusClaimed: false },
    world: defaultWorldState(),
    skillTree: defaultSkillTreeState(),
    weeklyBoss: createWeeklyBossForWeek(getIsoWeekKey()),
    home: defaultHomeState(),
    focus: defaultFocusState(),
    dailyHistory: {},
    weeklyReview: defaultWeeklyReviewState(),
    language: 'en',
    routineCombosDate: today(),
    routineCombosDone: [],
  };
}

export function addLog(s: HeroSave, msg: string): void {
  s.history = [{ id: uid(), at: new Date().toISOString(), text: msg }, ...(s.history || [])].slice(0, 80);
}

export function hydrate(raw: Partial<HeroSave> & Record<string, unknown>): HeroSave {
  const base = defaultSave(
    typeof raw.name === 'string' ? raw.name : 'Adventurer',
    (CLASSES.includes(raw.className as ClassName) ? raw.className : 'Knight') as ClassName,
    (raw.avatar as Partial<AvatarConfig>) || {}
  );
  const rawGuildBuildings = (raw.guild as GuildStateFallback | undefined)?.buildings;
  const migratedHomeRooms = {
    ...base.home.rooms,
    ...(raw.home?.rooms || {}),
  };
  if (!raw.home && rawGuildBuildings) {
    migratedHomeRooms.living = Math.max(1, rawGuildBuildings.hall || 1);
    migratedHomeRooms.library = Math.max(0, rawGuildBuildings.library || 0);
    migratedHomeRooms.training = Math.max(0, rawGuildBuildings.forge || 0);
    migratedHomeRooms.garden = Math.max(0, rawGuildBuildings.garden || 0);
  }

  const merged: HeroSave = {
    ...base,
    ...raw,
    version: 2,
    avatar: { ...base.avatar, ...(raw.avatar || {}) },
    habits: Array.isArray(raw.habits)
      ? raw.habits.map((h: Partial<HabitItem> & { completedDates?: string[] }) => ({
          id: h.id || uid(),
          title: h.title || 'Habit',
          kind: h.kind === 'bad' ? 'bad' : 'good',
          rhythm: h.rhythm || 'daily',
          everyDays: h.everyDays || 2,
          weekdays: Array.isArray(h.weekdays) ? h.weekdays : [],
          priority: h.priority === 'A' || h.priority === 'C' ? h.priority : 'B',
          domain: LIFE_DOMAINS.includes(h.domain as LifeDomain)
            ? (h.domain as LifeDomain)
            : inferDomain(h.title || 'Habit'),
          timeOfDay:
            h.timeOfDay === 'morning' || h.timeOfDay === 'day' || h.timeOfDay === 'evening'
              ? h.timeOfDay
              : 'any',
          pinnedToBoard: Boolean(h.pinnedToBoard),
          createdDate: h.createdDate || today(),
          doneDates: Array.isArray(h.doneDates) ? h.doneDates : h.completedDates || [],
          slips: Array.isArray(h.slips) ? h.slips : [],
          streak: h.streak || 0,
        }))
      : [],
    todos: Array.isArray(raw.todos)
      ? raw.todos.map((t: Partial<TodoItem>) => ({
          id: t.id || uid(),
          title: t.title || 'Task',
          dueDate: t.dueDate || '',
          priority: t.priority === 'A' || t.priority === 'C' ? t.priority : 'B',
          domain: LIFE_DOMAINS.includes(t.domain as LifeDomain)
            ? (t.domain as LifeDomain)
            : inferDomain(t.title || 'Task'),
          pinnedToBoard: Boolean(t.pinnedToBoard),
          done: Boolean(t.done),
        }))
      : [],
    owned: Array.isArray(raw.owned) ? raw.owned : base.owned,
    equipped: raw.equipped || base.equipped,
    costume: raw.costume || {},
    pets: Array.isArray(raw.pets) ? raw.pets : [],
    activePetId:
      typeof raw.activePetId === 'string'
        ? raw.activePetId
        : Array.isArray(raw.pets) && raw.pets.length > 0
          ? raw.pets[0].id
          : null,
    history: Array.isArray(raw.history) ? raw.history : [],
    combatLog: Array.isArray(raw.combatLog) ? raw.combatLog : [],
    guild: {
      ...base.guild,
      ...(raw.guild || {}),
      buildings: { ...base.guild.buildings, ...(raw.guild?.buildings || {}) },
    },
    challenges: raw.challenges || {},
    ownedCosmetics: Array.isArray(raw.ownedCosmetics) ? raw.ownedCosmetics : [],
    activeCosmetics: raw.activeCosmetics || {},
    friends: Array.isArray(raw.friends) ? raw.friends : [],
    soundEnabled: raw.soundEnabled ?? true,
    faintCount: raw.faintCount ?? 0,
    petFood: typeof raw.petFood === 'number' ? raw.petFood : base.petFood,
    petsFedCount: typeof raw.petsFedCount === 'number' ? raw.petsFedCount : 0,
    gearPurchasedCount:
      typeof raw.gearPurchasedCount === 'number'
        ? raw.gearPurchasedCount
        : Array.isArray(raw.owned) && raw.owned.length > 1
          ? raw.owned.length - 1
          : 0,
    onboardingRewardClaimed: Boolean(raw.onboardingRewardClaimed),
    dailyBoard: raw.dailyBoard?.date
      ? {
          date: raw.dailyBoard.date,
          quests: Array.isArray(raw.dailyBoard.quests) ? raw.dailyBoard.quests : [],
          bonusClaimed: Boolean(raw.dailyBoard.bonusClaimed),
        }
      : base.dailyBoard,
    world: {
      ...base.world,
      ...(raw.world || {}),
      exploredRegions: Array.isArray(raw.world?.exploredRegions)
        ? raw.world.exploredRegions
        : base.world.exploredRegions,
      claimedChests: Array.isArray(raw.world?.claimedChests)
        ? raw.world.claimedChests
        : base.world.claimedChests,
      lastEncounterByRegion:
        raw.world?.lastEncounterByRegion && typeof raw.world.lastEncounterByRegion === 'object'
          ? raw.world.lastEncounterByRegion
          : {},
      regionMastery:
        raw.world?.regionMastery && typeof raw.world.regionMastery === 'object'
          ? raw.world.regionMastery
          : {},
      merchantDiscountPct:
        typeof raw.world?.merchantDiscountPct === 'number' ? raw.world.merchantDiscountPct : 0,
    },
    skillTree: {
      domainXp: { ...base.skillTree.domainXp, ...(raw.skillTree?.domainXp || {}) },
      domainLevel: { ...base.skillTree.domainLevel, ...(raw.skillTree?.domainLevel || {}) },
      skillPoints:
        typeof raw.skillTree?.skillPoints === 'number'
          ? raw.skillTree.skillPoints
          : base.skillTree.skillPoints,
      unlockedNodes: Array.isArray(raw.skillTree?.unlockedNodes)
        ? raw.skillTree.unlockedNodes
        : [],
    },
    weeklyBoss: raw.weeklyBoss?.weekKey
      ? {
          ...createWeeklyBossForWeek(raw.weeklyBoss.weekKey, raw.weeklyBoss.bossIndex || 0),
          ...raw.weeklyBoss,
        }
      : createWeeklyBossForWeek(getIsoWeekKey()),
    home: {
      houseName: raw.home?.houseName || (raw.guild?.name ? `${raw.guild.name} Manor` : base.home.houseName),
      rooms: migratedHomeRooms,
      furniture: Array.isArray(raw.home?.furniture) ? raw.home.furniture : [],
      trophies: Array.isArray(raw.home?.trophies) ? raw.home.trophies : [],
    },
    focus: {
      active: raw.focus?.active || null,
      totalMinutes: typeof raw.focus?.totalMinutes === 'number' ? raw.focus.totalMinutes : 0,
      sessionsCompleted: typeof raw.focus?.sessionsCompleted === 'number' ? raw.focus.sessionsCompleted : 0,
      history: Array.isArray(raw.focus?.history) ? raw.focus.history : [],
    },
    dailyHistory: raw.dailyHistory && typeof raw.dailyHistory === 'object' ? raw.dailyHistory : {},
    weeklyReview: {
      lastReviewedWeek: raw.weeklyReview?.lastReviewedWeek || '',
      nextWeekGoals: Array.isArray(raw.weeklyReview?.nextWeekGoals)
        ? raw.weeklyReview.nextWeekGoals
        : [],
      pastReviews: Array.isArray(raw.weeklyReview?.pastReviews)
        ? raw.weeklyReview.pastReviews
        : [],
    },
    language: (raw.language === 'de' ? 'de' : 'en') as AppLanguage,
    routineCombosDate: raw.routineCombosDate || today(),
    routineCombosDone: Array.isArray(raw.routineCombosDone) ? raw.routineCombosDone : [],
  };

  syncDailyQuestBoard(merged);
  ensureWeeklyBoss(merged);
  return merged;
}

interface GuildStateFallback {
  buildings?: Record<string, number>;
}

export function migrateV1(o: Record<string, unknown>): HeroSave {
  const s = defaultSave(
    typeof o.name === 'string' ? o.name : 'Adventurer',
    (CLASSES.includes(o.className as ClassName) ? o.className : 'Knight') as ClassName,
    (o.avatar as Partial<AvatarConfig>) || {}
  );
  s.level = Number(o.level) || 1;
  s.xp = Number(o.xp) || 0;
  s.gold = o.gold !== undefined ? Number(o.gold) : 35;
  s.hp = o.hp !== undefined ? Number(o.hp) : 50;
  s.mp = o.mp !== undefined ? Number(o.mp) : 20;
  s.bossWins = Number(o.bossWins) || 0;
  s.bossHp = Number(o.bossHp) || getBossMaxHp(s.bossWins);
  s.eggs = Math.max(1, Number(o.petEggs) || 0);
  s.rewardMinutes = Number(o.earnedUnlockMinutes) || 0;
  s.lastDay = typeof o.lastProcessedDate === 'string' ? o.lastProcessedDate : today();
  s.damageQueued = Number(o.dailyDamage) || 0;
  return hydrate({ ...s, habits: o.habits as HabitItem[], todos: o.todos as HeroSave['todos'] });
}

export function loadSave(): HeroSave | null {
  try {
    const current = localStorage.getItem(STORE_KEY);
    if (current) return hydrate(JSON.parse(current));
    const old = localStorage.getItem(OLD_STORE_KEY);
    if (old) return migrateV1(JSON.parse(old));
  } catch (e) {
    console.error('Save read issue', e);
  }
  return null;
}

export function persistSave(s: HeroSave): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

export function cloneSave(s: HeroSave): HeroSave {
  return JSON.parse(JSON.stringify(s)) as HeroSave;
}

// ============================================================
// DAILY STATS RECORDING
// ============================================================
function ensureDailyRecord(s: HeroSave, date = today()): DailyStatsRecord {
  if (!s.dailyHistory) s.dailyHistory = {};
  if (!s.dailyHistory[date]) {
    s.dailyHistory[date] = {
      date,
      completedTasks: 0,
      focusMinutes: 0,
      xpEarned: 0,
      hpLost: 0,
      cleanDay: false,
    };
  }
  return s.dailyHistory[date];
}

// ============================================================
// PET PERKS
// ============================================================
export interface ResolvedPetPerk {
  title: string;
  stats: StatBlock;
  bonusXp: number;
  bonusGold: number;
  bonusBossDmg: number;
  bonusMp: number;
  cleanHealHp: number;
  rolloverBlock: number;
}

export function getActivePet(s: HeroSave): OwnedPet | null {
  return s.pets.find((p) => p.id === s.activePetId) || null;
}

export function getPetPerkEffects(
  pet: { sprite: PetSpriteId; level?: number } | null | undefined
): ResolvedPetPerk {
  if (!pet) {
    return {
      title: '',
      stats: { str: 0, def: 0, int: 0, agi: 0 },
      bonusXp: 0,
      bonusGold: 0,
      bonusBossDmg: 0,
      bonusMp: 0,
      cleanHealHp: 0,
      rolloverBlock: 0,
    };
  }
  const base = PET_PERKS[pet.sprite];
  const level = Math.max(1, pet.level || 1);
  const extra = level - 1;
  const stats: StatBlock = {
    str: base.stats?.str || 0,
    def: base.stats?.def || 0,
    int: base.stats?.int || 0,
    agi: base.stats?.agi || 0,
  };
  const statBonusFromLevel = Math.floor(extra / 2);
  if (statBonusFromLevel > 0) {
    const primaryKey = (['str', 'def', 'int', 'agi'] as const).reduce(
      (best, k) => (stats[k] > stats[best] ? k : best),
      'str' as keyof StatBlock
    );
    stats[primaryKey] += statBonusFromLevel;
  }

  return {
    title: base.title,
    stats,
    bonusXp: base.bonusXp ? base.bonusXp + extra : 0,
    bonusGold: base.bonusGold ? base.bonusGold + extra : 0,
    bonusBossDmg: base.bonusBossDmg ? base.bonusBossDmg + extra * 2 : 0,
    bonusMp: base.bonusMp ? base.bonusMp + Math.floor(extra / 3) : 0,
    cleanHealHp: base.cleanHealHp ? base.cleanHealHp + Math.floor(extra / 2) : 0,
    rolloverBlock: base.rolloverBlock ? base.rolloverBlock + Math.floor(extra / 2) : 0,
  };
}

export function formatPetPerkTags(perk: ResolvedPetPerk): string[] {
  const tags: string[] = [];
  if (perk.stats.str) tags.push(`+${perk.stats.str} STR`);
  if (perk.stats.def) tags.push(`+${perk.stats.def} DEF`);
  if (perk.stats.int) tags.push(`+${perk.stats.int} INT`);
  if (perk.stats.agi) tags.push(`+${perk.stats.agi} AGI`);
  if (perk.bonusXp) tags.push(`+${perk.bonusXp} XP/task`);
  if (perk.bonusGold) tags.push(`+${perk.bonusGold} Gold/task`);
  if (perk.bonusBossDmg) tags.push(`+${perk.bonusBossDmg} Boss DMG`);
  if (perk.bonusMp) tags.push(`+${perk.bonusMp} MP/habit`);
  if (perk.cleanHealHp) tags.push(`+${perk.cleanHealHp} HP clean day`);
  if (perk.rolloverBlock) tags.push(`Block ${perk.rolloverBlock} DMG`);
  return tags;
}

export function getPetStatBonus(s: HeroSave): StatBlock {
  return getPetPerkEffects(getActivePet(s)).stats;
}

// ============================================================
// PERSONAL SKILL TREE BONUSES
// ============================================================
export const DOMAIN_XP_PER_LEVEL = 40;

export function getSkillTreeBonuses(s: HeroSave) {
  const nodes = new Set(s.skillTree?.unlockedNodes || []);
  return {
    stats: {
      str: nodes.has('str-2') ? 2 : 0,
      def: nodes.has('disc-2') ? 2 : 0,
      int: nodes.has('know-2') ? 2 : 0,
      agi: nodes.has('mind-2') ? 1 : 0,
    },
    focusXpMult: 1 + (nodes.has('know-1') ? 0.15 : 0),
    questXpMult: 1 + (nodes.has('know-1') ? 0.15 : 0),
    bonusQuestXp: nodes.has('mind-2') ? 2 : 0,
    bonusMpOnHabit: nodes.has('know-2') ? 1 : 0,
    priorityABXp: nodes.has('know-3') ? 4 : 0,
    bonusBossDmg: (nodes.has('str-1') ? 3 : 0) + (nodes.has('str-3') ? 8 : 0),
    specialAttackMult: nodes.has('str-2') ? 1.3 : 1.0,
    bonusGoldPerQuest: nodes.has('disc-1') ? 2 : 0,
    rolloverBlock: nodes.has('disc-2') ? 2 : 0,
    boardAndBossGoldMult: nodes.has('disc-3') ? 1.25 : 1.0,
    cleanHealHp: nodes.has('mind-1') ? 2 : 0,
    slipPenalty: nodes.has('mind-3') ? 3 : 5,
  };
}

export function grantDomainXp(s: HeroSave, domain: LifeDomain, amount: number): boolean {
  if (!s.skillTree) s.skillTree = defaultSkillTreeState();
  s.skillTree.domainXp[domain] = (s.skillTree.domainXp[domain] || 0) + amount;
  let leveledUp = false;
  while (s.skillTree.domainXp[domain] >= DOMAIN_XP_PER_LEVEL) {
    s.skillTree.domainXp[domain] -= DOMAIN_XP_PER_LEVEL;
    s.skillTree.domainLevel[domain] = (s.skillTree.domainLevel[domain] || 1) + 1;
    s.skillTree.skillPoints = (s.skillTree.skillPoints || 0) + 1;
    leveledUp = true;
    addLog(s, `${domain} Mastery reached Lv. ${s.skillTree.domainLevel[domain]} (+1 Skill Point)`);
  }
  return leveledUp;
}

export function unlockSkillNode(s: HeroSave, nodeId: string): { ok: boolean; msg: string } {
  const node = SKILL_TREE_NODES.find((n) => n.id === nodeId);
  if (!node) return { ok: false, msg: 'Skill not found' };
  if (s.skillTree.unlockedNodes.includes(nodeId)) return { ok: false, msg: 'Already unlocked' };
  if (node.requires && !s.skillTree.unlockedNodes.includes(node.requires)) {
    return { ok: false, msg: 'Unlock previous tier first' };
  }
  if (s.skillTree.skillPoints < node.cost) {
    return { ok: false, msg: `Need ${node.cost} Skill Point${node.cost > 1 ? 's' : ''}` };
  }
  s.skillTree.skillPoints -= node.cost;
  s.skillTree.unlockedNodes.push(nodeId);
  addLog(s, `Unlocked Skill: ${node.name}`);
  return { ok: true, msg: `Unlocked ${node.name}!` };
}

// ============================================================
// PERSONAL HOME (SOLO SANCTUARY)
// ============================================================
export function getHomeBonuses(s: HeroSave) {
  const h = s.home || defaultHomeState();
  const rooms = h.rooms;
  const furn = new Set(h.furniture || []);
  const trophyBonus = (rooms.trophy || 0) >= 3 ? 1 : 0;

  return {
    stats: {
      str: (rooms.training || 0) + trophyBonus,
      def: (rooms.trophy || 0) + trophyBonus,
      int: (furn.has('scholar-desk') ? 1 : 0) + trophyBonus,
      agi: (rooms.basement || 0) + (furn.has('moon-planter') ? 1 : 0) + trophyBonus,
    },
    bonusGoldPerQuest: Math.max(0, (rooms.living || 0) - 1) * 2,
    bonusXpPerQuest: (rooms.library || 0) * 2,
    questXpMult: 1 + (furn.has('star-telescope') ? 0.15 : 0),
    focusXpMult: 1 + (rooms.library || 0) * 0.1 + (furn.has('star-telescope') ? 0.1 : 0),
    bonusBossDmg: (rooms.training || 0) * 2 + (rooms.basement || 0) * 2 + (furn.has('iron-dummy') ? 3 : 0),
    cleanHealHp: (rooms.garden || 0) + (furn.has('oak-hearth') ? 1 : 0),
    cleanHealMp: (rooms.basement || 0) + (furn.has('alchemy-cauldron') ? 3 : 0),
    boardBonusGold: (furn.has('woven-rug') ? 2 : 0) + (furn.has('barrel-rack') ? 2 : 0),
  };
}

export function upgradeHomeRoom(s: HeroSave, roomId: HomeRoomId): { ok: boolean; msg: string } {
  const def = HOME_ROOMS.find((r) => r.id === roomId);
  if (!def) return { ok: false, msg: 'Room not found' };
  const lvl = s.home.rooms[roomId] || 0;
  if (lvl >= def.maxLevel) return { ok: false, msg: 'Room already at max level' };
  const cost = def.baseCost + lvl * 35;
  if (s.gold < cost) return { ok: false, msg: `Need ${cost} Gold` };
  s.gold -= cost;
  s.home.rooms[roomId] = lvl + 1;
  addLog(s, `Upgraded ${def.name} to Lv. ${lvl + 1}`);
  return { ok: true, msg: `${def.name} upgraded to Lv. ${lvl + 1}!` };
}

export function getDiscountedCost(s: HeroSave, baseCost: number): number {
  const pct = s.world?.merchantDiscountPct || 0;
  if (pct <= 0) return baseCost;
  return Math.max(1, Math.round(baseCost * (1 - pct / 100)));
}

function consumeShopDiscount(s: HeroSave): number {
  const pct = s.world?.merchantDiscountPct || 0;
  if (pct > 0 && s.world) {
    s.world.merchantDiscountPct = 0;
  }
  return pct;
}

export function buyHomeFurniture(s: HeroSave, furnitureId: string): { ok: boolean; msg: string } {
  const item = HOME_FURNITURE.find((f) => f.id === furnitureId);
  if (!item) return { ok: false, msg: 'Furniture not found' };
  if (s.home.furniture.includes(furnitureId)) return { ok: false, msg: 'Already placed in your home' };
  const cost = getDiscountedCost(s, item.cost);
  if (s.gold < cost) return { ok: false, msg: `Need ${cost} Gold` };
  s.gold -= cost;
  consumeShopDiscount(s);
  s.home.furniture.push(furnitureId);
  addLog(s, `Placed ${item.name} in ${s.home.houseName}`);
  return { ok: true, msg: `${item.name} placed in your home!` };
}

export function renameHome(s: HeroSave, name: string): void {
  if (name.trim()) {
    s.home.houseName = name.trim().slice(0, 40);
  }
}

export function unlockTrophy(s: HeroSave, trophyId: string): void {
  if (!s.home.trophies.includes(trophyId)) {
    s.home.trophies.push(trophyId);
    addLog(s, `Unlocked Home Trophy!`);
  }
}

// ============================================================
// HERO STATS & REWARD CALCULATION
// ============================================================
export function calcStats(s: HeroSave): StatBlock {
  const v: StatBlock = { str: 2, def: 2, int: 2, agi: 2 };
  const bonus = CLASS_BONUS[s.className];
  v.str += bonus.str;
  v.def += bonus.def;
  v.int += bonus.int;
  v.agi += bonus.agi;

  EQUIP_SLOTS.forEach((slot) => {
    const item = ITEMS.find((x) => x.id === s.equipped[slot]);
    if (item) {
      if (item.stats.str) v.str += item.stats.str;
      if (item.stats.def) v.def += item.stats.def;
      if (item.stats.int) v.int += item.stats.int;
      if (item.stats.agi) v.agi += item.stats.agi;
    }
  });

  const petStats = getPetStatBonus(s);
  const skillStats = getSkillTreeBonuses(s).stats;
  const homeStats = getHomeBonuses(s).stats;

  v.str += petStats.str + skillStats.str + homeStats.str;
  v.def += petStats.def + skillStats.def + homeStats.def;
  v.int += petStats.int + skillStats.int + homeStats.int;
  v.agi += petStats.agi + skillStats.agi + homeStats.agi;

  return v;
}

export function earnRewards(s: HeroSave, xp = 0, gold = 0, msg = ''): boolean {
  let leveledUp = false;
  s.xp += xp;
  s.gold += gold;
  if (xp > 0) {
    ensureDailyRecord(s).xpEarned += xp;
  }
  if (msg) addLog(s, msg);
  while (s.xp >= xpNeeded(s.level)) {
    s.xp -= xpNeeded(s.level);
    s.level++;
    leveledUp = true;
    s.hp = Math.min(maxHp(s.level), s.hp + 5);
    s.mp = Math.min(maxMp(s.level), s.mp + 5);
    s.classProgress[s.className] = Math.max(s.classProgress[s.className] || 1, s.level);
    addLog(s, `Level ${s.level} achieved!`);
  }
  return leveledUp;
}

function addChallengeProgress(s: HeroSave, kind: string, amount = 1) {
  for (const challenge of CHALLENGES) {
    const c = s.challenges[challenge.id];
    if (!c || c.claimed || c.done || challenge.kind !== kind) continue;
    c.progress = Math.min(challenge.target, c.progress + amount);
    if (c.progress === challenge.target) {
      c.done = true;
      addLog(s, `Challenge ${challenge.name} is ready to claim!`);
    }
  }
}

export function isHabitDue(h: HabitItem, d = today()): boolean {
  if (d < h.createdDate) return false;
  if (h.rhythm === 'daily') return true;
  if (h.rhythm === 'monthly') return Number(d.slice(8)) === Number(h.createdDate.slice(8));
  if (h.rhythm === 'weekdays') return (h.weekdays || []).includes(new Date(`${d}T12:00:00`).getDay());
  return dayBetween(h.createdDate, d) % Math.max(2, h.everyDays || 2) === 0;
}

export function getHabitRewardPreview(s: HeroSave, priority: TaskPriority = 'B'): { xp: number; gold: number } {
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const pCfg = getPriorityConfig(priority);

  const baseXp =
    12 +
    homeB.bonusXpPerQuest +
    petPerk.bonusXp +
    skillB.bonusQuestXp +
    (priority === 'A' || priority === 'B' ? skillB.priorityABXp : 0);
  const baseGold =
    5 +
    Math.floor(st.agi / 5) +
    homeB.bonusGoldPerQuest +
    petPerk.bonusGold +
    skillB.bonusGoldPerQuest;

  return {
    xp: Math.max(4, Math.round(baseXp * pCfg.xpMult * skillB.questXpMult * homeB.questXpMult)),
    gold: Math.max(2, Math.round(baseGold * pCfg.goldMult)),
  };
}

export function getTodoRewardPreview(s: HeroSave, priority: TaskPriority = 'B'): { xp: number; gold: number } {
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const pCfg = getPriorityConfig(priority);

  const baseXp =
    18 +
    homeB.bonusXpPerQuest +
    petPerk.bonusXp +
    skillB.bonusQuestXp +
    (priority === 'A' || priority === 'B' ? skillB.priorityABXp : 0);
  const baseGold =
    8 +
    Math.floor(st.agi / 5) +
    homeB.bonusGoldPerQuest +
    petPerk.bonusGold +
    skillB.bonusGoldPerQuest;

  return {
    xp: Math.max(6, Math.round(baseXp * pCfg.xpMult * skillB.questXpMult * homeB.questXpMult)),
    gold: Math.max(3, Math.round(baseGold * pCfg.goldMult)),
  };
}

// ============================================================
// DAILY QUEST BOARD (TOP 3 PERSONALIZED QUESTS)
// ============================================================
export function syncDailyQuestBoard(s: HeroSave): DailyQuestBoard {
  const d = today();
  if (!s.dailyBoard || s.dailyBoard.date !== d) {
    s.dailyBoard = { date: d, quests: [], bonusClaimed: false };
  }

  const priorityRank: Record<TaskPriority, number> = { A: 3, B: 2, C: 1 };

  const candidates: {
    refType: 'habit' | 'todo';
    refId: string;
    title: string;
    priority: TaskPriority;
    domain: LifeDomain;
    done: boolean;
    pinned: boolean;
  }[] = [];

  for (const h of s.habits) {
    if (h.kind === 'good' && isHabitDue(h, d)) {
      candidates.push({
        refType: 'habit',
        refId: h.id,
        title: h.title,
        priority: h.priority || 'B',
        domain: h.domain || inferDomain(h.title),
        done: h.doneDates.includes(d),
        pinned: Boolean(h.pinnedToBoard),
      });
    }
  }

  for (const t of s.todos) {
    if (!t.done || s.dailyBoard.quests.some((q) => q.refType === 'todo' && q.refId === t.id)) {
      candidates.push({
        refType: 'todo',
        refId: t.id,
        title: t.title,
        priority: t.priority || 'B',
        domain: t.domain || inferDomain(t.title),
        done: t.done,
        pinned: Boolean(t.pinnedToBoard),
      });
    }
  }

  // Pinned quests always take top priority slots, then fill up to 3 sorted by Priority A > B > C
  const sorted = [...candidates].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const pDiff = priorityRank[b.priority] - priorityRank[a.priority];
    if (pDiff !== 0) return pDiff;
    if (a.refType !== b.refType) return a.refType === 'habit' ? -1 : 1;
    return 0;
  });

  const topThree = sorted.slice(0, 3).map((c): DailyQuestEntry => {
    const reward =
      c.refType === 'habit'
        ? getHabitRewardPreview(s, c.priority)
        : getTodoRewardPreview(s, c.priority);
    return {
      id: `${c.refType}:${c.refId}`,
      refType: c.refType,
      refId: c.refId,
      title: c.title,
      priority: c.priority,
      domain: c.domain,
      xpReward: reward.xp,
      goldReward: reward.gold,
      done: c.done,
      pinned: c.pinned,
    };
  });

  s.dailyBoard.quests = topThree;
  return s.dailyBoard;
}

export function toggleQuestPin(
  s: HeroSave,
  refType: 'habit' | 'todo',
  refId: string
): { ok: boolean; pinned: boolean; limitReached?: boolean } {
  const pinnedCount =
    s.habits.filter((h) => h.kind === 'good' && h.pinnedToBoard).length +
    s.todos.filter((t) => !t.done && t.pinnedToBoard).length;

  if (refType === 'habit') {
    const h = s.habits.find((x) => x.id === refId);
    if (!h) return { ok: false, pinned: false };
    if (!h.pinnedToBoard && pinnedCount >= 3) {
      return { ok: false, pinned: false, limitReached: true };
    }
    h.pinnedToBoard = !h.pinnedToBoard;
    syncDailyQuestBoard(s);
    return { ok: true, pinned: h.pinnedToBoard };
  }

  const t = s.todos.find((x) => x.id === refId);
  if (!t) return { ok: false, pinned: false };
  if (!t.pinnedToBoard && pinnedCount >= 3) {
    return { ok: false, pinned: false, limitReached: true };
  }
  t.pinnedToBoard = !t.pinnedToBoard;
  syncDailyQuestBoard(s);
  return { ok: true, pinned: t.pinnedToBoard };
}

export function claimDailyBoardBonus(s: HeroSave): { ok: boolean; leveledUp: boolean; xp: number; gold: number } {
  syncDailyQuestBoard(s);
  if (s.dailyBoard.bonusClaimed || s.dailyBoard.quests.length === 0) {
    return { ok: false, leveledUp: false, xp: 0, gold: 0 };
  }
  if (!s.dailyBoard.quests.every((q) => q.done)) {
    return { ok: false, leveledUp: false, xp: 0, gold: 0 };
  }
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const xpGain = 30;
  const goldGain = Math.round((20 + homeB.boardBonusGold) * skillB.boardAndBossGoldMult);
  s.dailyBoard.bonusClaimed = true;
  unlockTrophy(s, 'board-master');
  const leveledUp = earnRewards(s, xpGain, goldGain, `Daily Quest Board Complete · +${xpGain} XP +${goldGain} Gold`);
  return { ok: true, leveledUp, xp: xpGain, gold: goldGain };
}

// ============================================================
// WEEKLY BOSS BATTLES
// ============================================================
export function ensureWeeklyBoss(s: HeroSave): WeeklyBossState {
  const currentWeek = getIsoWeekKey();
  if (!s.weeklyBoss || !s.weeklyBoss.weekKey) {
    s.weeklyBoss = createWeeklyBossForWeek(currentWeek, 0);
  }
  if (s.weeklyBoss.weekKey !== currentWeek) {
    // Auto-evaluate previous week if not evaluated yet
    if (!s.weeklyBoss.evaluated && s.weeklyBoss.damageDealt > 0) {
      evaluateWeeklyBoss(s, true);
    }
    const nextIdx = (s.weeklyBoss.bossIndex || 0) + 1;
    s.weeklyBoss = createWeeklyBossForWeek(currentWeek, nextIdx);
  }
  return s.weeklyBoss;
}

function strikeWeeklyBoss(s: HeroSave, dmg: number, isSpecial: boolean, sourceTitle: string): boolean {
  ensureWeeklyBoss(s);
  const wb = s.weeklyBoss;
  wb.damageDealt += dmg;
  wb.habitsHit += 1;
  if (isSpecial) wb.specialStrikes += 1;
  const before = wb.hp;
  wb.hp = Math.max(0, wb.hp - dmg);
  const bossDef = WEEKLY_BOSSES[wb.bossIndex % WEEKLY_BOSSES.length];

  if (before > 0 && wb.hp === 0) {
    s.combatLog.unshift({
      id: uid(),
      day: today(),
      text: `Weekly Boss ${bossDef.name} staggered! Claim Sunday chest in Realm → Weekly Boss.`,
      type: 'victory',
    });
    unlockTrophy(s, 'first-weekly-boss');
    return true;
  }
  if (isSpecial) {
    s.combatLog.unshift({
      id: uid(),
      day: today(),
      text: `SPECIAL ATTACK (${sourceTitle}): ${dmg} DMG to ${bossDef.name}!`,
      type: 'hit',
    });
    s.combatLog = s.combatLog.slice(0, 50);
  }
  return false;
}

export function evaluateWeeklyBoss(
  s: HeroSave,
  silentAuto = false
): { ok: boolean; xp: number; gold: number; egg: boolean; victory: boolean } {
  const wb = s.weeklyBoss;
  if (!wb || wb.evaluated) {
    return { ok: false, xp: 0, gold: 0, egg: false, victory: false };
  }
  const victory = wb.hp === 0;
  const pct = wb.maxHp > 0 ? wb.damageDealt / wb.maxHp : 0;
  if (!victory && !isSunday() && !silentAuto && pct < 1) {
    return { ok: false, xp: 0, gold: 0, egg: false, victory: false };
  }

  const skillB = getSkillTreeBonuses(s);
  const baseXp = victory ? 110 : Math.max(20, Math.round(pct * 75));
  const baseGold = victory ? 90 : Math.max(15, Math.round(pct * 60));
  const goldGain = Math.round(baseGold * skillB.boardAndBossGoldMult);
  const grantEgg = victory || pct >= 0.5;

  wb.evaluated = true;
  if (grantEgg) s.eggs += 1;
  if (victory) {
    s.bossWins += 1;
    unlockTrophy(s, 'first-weekly-boss');
  }
  earnRewards(
    s,
    baseXp,
    goldGain,
    `Weekly Boss ${victory ? 'Defeated' : 'Evaluated'} · +${baseXp} XP +${goldGain} Gold${grantEgg ? ' +1 Egg' : ''}`
  );
  return { ok: true, xp: baseXp, gold: goldGain, egg: grantEgg, victory };
}

export function getWeeklyBossAffinity(s: HeroSave): LifeDomain {
  const wb = ensureWeeklyBoss(s);
  if (!wb.affinityDomain) {
    wb.affinityDomain = LIFE_DOMAINS[(wb.bossIndex || 0) % LIFE_DOMAINS.length];
  }
  return wb.affinityDomain;
}

export function getRoutineProgress(
  s: HeroSave,
  slot: 'morning' | 'day' | 'evening',
  d = today()
): { total: number; done: number; comboClaimed: boolean } {
  const matching = s.habits.filter(
    (h) => h.kind === 'good' && isHabitDue(h, d) && (h.timeOfDay || 'any') === slot
  );
  const doneCount = matching.filter((h) => h.doneDates.includes(d)).length;
  const comboClaimed =
    s.routineCombosDate === d && Boolean(s.routineCombosDone?.includes(slot));
  return { total: matching.length, done: doneCount, comboClaimed };
}

// ============================================================
// HABITS & TODOS COMPLETION
// ============================================================
export function completeHabit(
  s: HeroSave,
  id: string
): {
  ok: boolean;
  leveledUp: boolean;
  xp: number;
  gold: number;
  specialStrike: boolean;
  domainLeveled: boolean;
  affinityHit: boolean;
  routineCombo: 'morning' | 'day' | 'evening' | null;
} {
  const h = s.habits.find((x) => x.id === id);
  const d = today();
  if (!h || h.kind !== 'good' || h.doneDates.includes(d) || !isHabitDue(h, d)) {
    return {
      ok: false,
      leveledUp: false,
      xp: 0,
      gold: 0,
      specialStrike: false,
      domainLeveled: false,
      affinityHit: false,
      routineCombo: null,
    };
  }
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const priority = h.priority || 'B';
  const pCfg = getPriorityConfig(priority);
  const domain = h.domain || inferDomain(h.title);
  const affinity = getWeeklyBossAffinity(s);
  const affinityHit = domain === affinity;

  const { xp: baseXpGain, gold: goldGain } = getHabitRewardPreview(s, priority);
  const isSpecial = priority === 'A';
  const rawDmg =
    Math.max(2, 6 + Math.floor(st.str / 2)) +
    petPerk.bonusBossDmg +
    skillB.bonusBossDmg +
    homeB.bonusBossDmg;
  let dmgGain = Math.round(
    rawDmg * pCfg.dmgMult * (isSpecial ? skillB.specialAttackMult : 1) * (affinityHit ? 1.35 : 1)
  );

  h.doneDates.push(d);
  h.streak++;

  // Check Routine Combo completion
  let xpGain = baseXpGain;
  let routineCombo: 'morning' | 'day' | 'evening' | null = null;
  const slot = h.timeOfDay || 'any';
  if (slot === 'morning' || slot === 'day' || slot === 'evening') {
    if (s.routineCombosDate !== d) {
      s.routineCombosDate = d;
      s.routineCombosDone = [];
    }
    const rp = getRoutineProgress(s, slot, d);
    if (rp.total >= 2 && rp.done === rp.total && !rp.comboClaimed) {
      routineCombo = slot;
      s.routineCombosDone = [...(s.routineCombosDone || []), slot];
      xpGain += 10;
      dmgGain += Math.max(2, Math.round(dmgGain * 0.15));
      addLog(s, `${slot} Routine Combo! +10 XP & +15% Boss DMG`);
    }
  }

  s.damageQueued += dmgGain;
  s.mp = Math.min(maxMp(s.level), s.mp + 1 + Math.floor(st.int / 8) + petPerk.bonusMp + skillB.bonusMpOnHabit);
  s.habitChecks++;
  ensureDailyRecord(s, d).completedTasks += 1;

  strikeWeeklyBoss(s, dmgGain, isSpecial, h.title);
  const domainLeveled = grantDomainXp(s, domain, priority === 'A' ? 15 : priority === 'B' ? 10 : 7);

  if (s.guild.name) s.guild.xp += 3;
  const leveledUp = earnRewards(
    s,
    xpGain,
    goldGain,
    `${h.title} (${priority}) completed · +${xpGain} XP +${goldGain} Gold`
  );
  addChallengeProgress(s, 'habit');
  if (s.habitChecks + s.todoChecks >= 25) unlockTrophy(s, 'focus-adept');
  syncDailyQuestBoard(s);

  return {
    ok: true,
    leveledUp,
    xp: xpGain,
    gold: goldGain,
    specialStrike: isSpecial,
    domainLeveled,
    affinityHit,
    routineCombo,
  };
}

export function recordSlip(s: HeroSave, id: string): boolean {
  const h = s.habits.find((x) => x.id === id);
  const d = today();
  if (!h || h.kind !== 'bad' || h.slips.includes(d)) return false;
  const penalty = getSkillTreeBonuses(s).slipPenalty;
  h.slips.push(d);
  h.streak = 0;
  s.hp = Math.max(0, s.hp - penalty);
  ensureDailyRecord(s, d).hpLost += penalty;
  addLog(s, `A slip on ${h.title} (−${penalty} HP). Tomorrow is a fresh chance.`);
  return true;
}

export function addHabit(
  s: HeroSave,
  title: string,
  kind: HabitKind,
  rhythm: HabitRhythm,
  everyDays: number,
  weekdays: number[],
  priority: TaskPriority = 'B',
  domain?: LifeDomain,
  timeOfDay: TimeOfDay = 'any'
) {
  s.habits.unshift({
    id: uid(),
    title: title.trim(),
    kind,
    rhythm,
    everyDays,
    weekdays,
    priority,
    domain: domain || inferDomain(title),
    timeOfDay,
    pinnedToBoard: false,
    createdDate: today(),
    doneDates: [],
    slips: [],
    streak: 0,
  });
  syncDailyQuestBoard(s);
}

export function updateHabit(
  s: HeroSave,
  id: string,
  title: string,
  kind: HabitKind,
  rhythm: HabitRhythm,
  everyDays: number,
  weekdays: number[],
  priority: TaskPriority = 'B',
  domain?: LifeDomain,
  timeOfDay?: TimeOfDay
) {
  const h = s.habits.find((x) => x.id === id);
  if (!h) return;
  h.title = title.trim() || h.title;
  h.kind = kind;
  h.rhythm = rhythm;
  h.everyDays = everyDays;
  h.weekdays = weekdays;
  h.priority = priority;
  h.domain = domain || h.domain || inferDomain(h.title);
  if (timeOfDay) h.timeOfDay = timeOfDay;
  syncDailyQuestBoard(s);
}

export function setHabitPriority(s: HeroSave, id: string, priority: TaskPriority): void {
  const h = s.habits.find((x) => x.id === id);
  if (h) {
    h.priority = priority;
    syncDailyQuestBoard(s);
  }
}

export function setTodoPriority(s: HeroSave, id: string, priority: TaskPriority): void {
  const t = s.todos.find((x) => x.id === id);
  if (t) {
    t.priority = priority;
    syncDailyQuestBoard(s);
  }
}

export function completeTodo(
  s: HeroSave,
  id: string
): {
  ok: boolean;
  leveledUp: boolean;
  xp: number;
  gold: number;
  specialStrike: boolean;
  domainLeveled: boolean;
  affinityHit: boolean;
} {
  const t = s.todos.find((x) => x.id === id);
  if (!t || t.done) {
    return {
      ok: false,
      leveledUp: false,
      xp: 0,
      gold: 0,
      specialStrike: false,
      domainLeveled: false,
      affinityHit: false,
    };
  }
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const priority = t.priority || 'B';
  const pCfg = getPriorityConfig(priority);
  const domain = t.domain || inferDomain(t.title);
  const affinity = getWeeklyBossAffinity(s);
  const affinityHit = domain === affinity;

  const { xp: xpGain, gold: goldGain } = getTodoRewardPreview(s, priority);
  const isSpecial = priority === 'A';
  const rawDmg =
    Math.max(4, 10 + Math.floor(st.str / 2)) +
    petPerk.bonusBossDmg +
    skillB.bonusBossDmg +
    homeB.bonusBossDmg;
  const dmgGain = Math.round(
    rawDmg * pCfg.dmgMult * (isSpecial ? skillB.specialAttackMult : 1) * (affinityHit ? 1.35 : 1)
  );

  t.done = true;
  s.todoChecks++;
  s.damageQueued += dmgGain;
  if (petPerk.bonusMp > 0) {
    s.mp = Math.min(maxMp(s.level), s.mp + petPerk.bonusMp);
  }
  ensureDailyRecord(s).completedTasks += 1;

  strikeWeeklyBoss(s, dmgGain, isSpecial, t.title);
  const domainLeveled = grantDomainXp(s, domain, priority === 'A' ? 18 : priority === 'B' ? 12 : 8);

  if (s.guild.name) s.guild.xp += 5;
  const leveledUp = earnRewards(
    s,
    xpGain,
    goldGain,
    `${t.title} (${priority}) finished · +${xpGain} XP +${goldGain} Gold`
  );
  addChallengeProgress(s, 'todo');
  if (s.habitChecks + s.todoChecks >= 25) unlockTrophy(s, 'focus-adept');
  syncDailyQuestBoard(s);

  return {
    ok: true,
    leveledUp,
    xp: xpGain,
    gold: goldGain,
    specialStrike: isSpecial,
    domainLeveled,
    affinityHit,
  };
}

// ============================================================
// EXPLORABLE RPG WORLD + BIOME ENCOUNTERS
// ============================================================
export function getHeroMaxStreak(s: HeroSave): number {
  return Math.max(0, s.cleanDays || 0, ...s.habits.map((h) => h.streak || 0));
}

export function getHeroStatSum(s: HeroSave): number {
  const st = calcStats(s);
  return st.str + st.def + st.int + st.agi;
}

export function getMaxDomainLevel(s: HeroSave): number {
  const levels = Object.values(s.skillTree?.domainLevel || { Knowledge: 1 });
  return Math.max(1, ...levels);
}

export function getRegionMastery(s: HeroSave, regionId: string): number {
  return s.world?.regionMastery?.[regionId] || 0;
}

export function isRegionUnlocked(s: HeroSave, region: WorldRegionDef): boolean {
  const totalChecks = s.habitChecks + s.todoChecks;
  const streakOk = !region.reqStreak || getHeroMaxStreak(s) >= region.reqStreak;
  const statOk = !region.reqStatSum || getHeroStatSum(s) >= region.reqStatSum;
  const domainOk = !region.reqDomainLv || getMaxDomainLevel(s) >= region.reqDomainLv;
  return (
    s.level >= region.reqLevel &&
    totalChecks >= region.reqChecks &&
    (s.focus?.totalMinutes || 0) >= region.reqFocusMin &&
    s.bossWins >= region.reqBossWins &&
    streakOk &&
    statOk &&
    domainOk
  );
}

export function travelToRegion(s: HeroSave, regionId: string): { ok: boolean; msg: string } {
  const region = WORLD_REGIONS.find((r) => r.id === regionId);
  if (!region) return { ok: false, msg: 'Region not found' };
  if (!isRegionUnlocked(s, region)) return { ok: false, msg: 'Region locked' };
  s.world.currentRegionId = regionId;
  if (!s.world.exploredRegions.includes(regionId)) {
    s.world.exploredRegions.push(regionId);
  }
  if (s.world.exploredRegions.length >= 3) {
    unlockTrophy(s, 'world-explorer');
  }
  return { ok: true, msg: `Traveled to ${region.name}` };
}

export interface RegionEncounterResult {
  regionId: string;
  kind: 'merchant' | 'shrine' | 'cache' | 'critter' | 'ambush';
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
  rewardSummary: string;
}

export function canScoutRegionToday(s: HeroSave, regionId: string, d = today()): boolean {
  return (s.world.lastEncounterByRegion?.[regionId] || '') !== d;
}

export function exploreRegion(
  s: HeroSave,
  regionId: string
): { ok: boolean; msg: string; leveledUp: boolean; encounter?: RegionEncounterResult } {
  const region = WORLD_REGIONS.find((r) => r.id === regionId);
  if (!region) return { ok: false, msg: 'Region not found', leveledUp: false };
  if (!isRegionUnlocked(s, region)) {
    return { ok: false, msg: 'Meet requirements to unlock this region', leveledUp: false };
  }
  s.world.currentRegionId = regionId;
  if (!s.world.exploredRegions.includes(regionId)) {
    s.world.exploredRegions.push(regionId);
  }
  if (s.world.exploredRegions.length >= 3) {
    unlockTrophy(s, 'world-explorer');
  }
  if (!s.world.regionMastery) s.world.regionMastery = {};

  // First-time regional discovery chest
  if (!s.world.claimedChests.includes(regionId)) {
    s.world.claimedChests.push(regionId);
    if (!s.world.lastEncounterByRegion) s.world.lastEncounterByRegion = {};
    s.world.lastEncounterByRegion[regionId] = today();
    s.world.regionMastery[regionId] = (s.world.regionMastery[regionId] || 0) + 1;
    if (region.rewardEgg) s.eggs += 1;
    const leveledUp = earnRewards(
      s,
      region.rewardXp,
      region.rewardGold,
      `Explored ${region.name}! +${region.rewardXp} XP +${region.rewardGold} Gold${region.rewardEgg ? ' +1 Egg' : ''}`
    );
    return {
      ok: true,
      msg: `Explored ${region.name}: +${region.rewardXp} XP · +${region.rewardGold} Gold${region.rewardEgg ? ' · +1 Egg!' : ''}`,
      leveledUp,
      encounter: {
        regionId,
        kind: 'cache',
        titleEn: `${region.name} Discovery Chest`,
        titleDe: `Entdeckertruhe: ${region.name}`,
        descEn: `You conquered the entrance of ${region.name} and uncovered its ancient vault.`,
        descDe: `Du hast den Eingang von ${region.name} gemeistert und die uralte Truhe geborgen.`,
        rewardSummary: `+${region.rewardXp} XP · +${region.rewardGold} Gold${region.rewardEgg ? ' · +1 Egg' : ''}`,
      },
    };
  }

  // Daily solo expedition in unlocked regions
  const d = today();
  if (!canScoutRegionToday(s, regionId, d)) {
    return { ok: true, msg: `Camped at ${region.name}`, leveledUp: false };
  }
  if (!s.world.lastEncounterByRegion) s.world.lastEncounterByRegion = {};
  s.world.lastEncounterByRegion[regionId] = d;
  s.world.regionMastery[regionId] = (s.world.regionMastery[regionId] || 0) + 1;
  const masteryCount = s.world.regionMastery[regionId];
  const st = calcStats(s);
  const dangerScale = Math.max(1, Math.round(region.reqLevel / 2));

  const roll = Math.random();
  let leveledUp = false;
  let encounter: RegionEncounterResult;

  if (roll < 0.24) {
    // Solo Biome Ambush / Hazard Trial tested against Hero Combat Stats
    const statCheckNeeded = 6 + region.reqLevel * 2;
    const heroPower = st.str + st.def + Math.floor(st.agi / 2);
    const wonCleanly = heroPower >= statCheckNeeded;
    const hpGraze = wonCleanly ? 0 : Math.min(Math.max(1, s.hp - 1), Math.max(1, 3 + dangerScale - Math.floor(st.def / 4)));
    if (hpGraze > 0) {
      s.hp = Math.max(1, s.hp - hpGraze);
    }
    const bossDmg = 8 + region.reqLevel * 2 + (wonCleanly ? 6 : 0);
    s.damageQueued += bossDmg;
    const xpReward = 18 + region.reqLevel * 3;
    const goldReward = 14 + region.reqLevel * 3;
    leveledUp = earnRewards(
      s,
      xpReward,
      goldReward,
      `Solo Trial in ${region.name}: +${xpReward} XP +${goldReward}G +${bossDmg} Boss DMG${hpGraze > 0 ? ` (−${hpGraze} HP)` : ''}`
    );
    encounter = {
      regionId,
      kind: 'ambush',
      titleEn: wonCleanly ? 'Shadow Vanguard Defeated!' : 'Fierce Solo Skirmish',
      titleDe: wonCleanly ? 'Schatten-Vorhut besiegt!' : 'Harter Solo-Scharmützel',
      descEn: wonCleanly
        ? `Your battle stats (${heroPower} Power vs ${statCheckNeeded}) overwhelmed the ${region.name} guardian!`
        : `A fierce biome guardian tested your armor (Power ${heroPower} vs ${statCheckNeeded}) before retreating.`,
      descDe: wonCleanly
        ? `Deine Kampfwerte (${heroPower} Stärke vs ${statCheckNeeded}) haben den Wächter von ${region.name} bezwungen!`
        : `Ein starker Wächter hat dich gestreift (Kraft ${heroPower} vs ${statCheckNeeded}), bevor du ihn vertrieben hast.`,
      rewardSummary: `+${xpReward} XP · +${goldReward} Gold · +${bossDmg} Boss DMG${hpGraze > 0 ? ` · −${hpGraze} HP` : ' · Flawless!'}`,
    };
  } else if (roll < 0.46) {
    s.world.merchantDiscountPct = 20;
    const goldG = 12 + dangerScale * 2;
    leveledUp = earnRewards(s, 10, goldG, `Wandering Merchant in ${region.name}: +${goldG} Gold & 20% Shop Discount`);
    encounter = {
      regionId,
      kind: 'merchant',
      titleEn: 'Wandering Caravan Merchant',
      titleDe: 'Fahrender Karawanen-Händler',
      descEn: 'A lone trader shares road supplies and grants 20% off your next purchase in Merlin’s Market!',
      descDe: 'Ein Händler teilt Proviant und gewährt dir 20% Rabatt auf deinen nächsten Kauf in Merlins Markt!',
      rewardSummary: `+${goldG} Gold · +10 XP · 20% Market Discount`,
    };
  } else if (roll < 0.7) {
    const domainAffinity: Record<WorldRegionDef['biome'], LifeDomain> = {
      Forest: 'Mindfulness',
      Village: 'Discipline',
      Dungeon: 'Strength',
      Castle: 'Discipline',
      Sanctuary: 'Knowledge',
      Citadel: 'Strength',
    };
    const dom = domainAffinity[region.biome];
    grantDomainXp(s, dom, 12 + dangerScale * 2);
    s.mp = Math.min(maxMp(s.level), s.mp + 6);
    leveledUp = earnRewards(s, 22 + dangerScale * 2, 8, `Ancient Shrine in ${region.name}: +${22 + dangerScale * 2} XP +${12 + dangerScale * 2} ${dom} XP`);
    encounter = {
      regionId,
      kind: 'shrine',
      titleEn: 'Runed Waystone Shrine',
      titleDe: 'Runenstein-Schrein',
      descEn: `Glowing runes sharpen your ${dom} mastery and restore mana.`,
      descDe: `Leuchtende Runen stärken deine ${dom}-Meisterschaft und stellen Mana wieder her.`,
      rewardSummary: `+${22 + dangerScale * 2} XP · +${12 + dangerScale * 2} ${dom} XP · +6 MP`,
    };
  } else if (roll < 0.86) {
    s.petFood += 2;
    const bonusEgg = region.reqLevel >= 4 && Math.random() < 0.25;
    if (bonusEgg) s.eggs += 1;
    leveledUp = earnRewards(s, 12, 10, `Critter Nest in ${region.name}: +2 Pet Treats`);
    encounter = {
      regionId,
      kind: 'critter',
      titleEn: 'Hidden Companion Burrow',
      titleDe: 'Verstecktes Gefährten-Nest',
      descEn: 'You found rare treats tucked beneath mossy roots.',
      descDe: 'Zwischen bemoosten Wurzeln hast du seltene Gefährten-Leckerlis gefunden.',
      rewardSummary: `+2 Pet Treats · +12 XP · +10 Gold${bonusEgg ? ' · +1 Egg!' : ''}`,
    };
  } else {
    const bonusGold = 18 + region.reqLevel * 3 + (masteryCount >= 3 ? 8 : 0);
    leveledUp = earnRewards(s, 16, bonusGold, `Relic Cache in ${region.name}: +${bonusGold} Gold`);
    encounter = {
      regionId,
      kind: 'cache',
      titleEn: 'Relic Scout Vault',
      titleDe: 'Verborgenes Späher-Versteck',
      descEn: 'Behind weathered stones lies a sealed pouch of realm coinage.',
      descDe: 'Hinter verwitterten Steinen liegt ein versiegelter Beutel voller Goldmünzen.',
      rewardSummary: `+${bonusGold} Gold · +16 XP`,
    };
  }

  return {
    ok: true,
    msg: `${encounter.titleEn}: ${encounter.rewardSummary}`,
    leveledUp,
    encounter,
  };
}

// ============================================================
// FOCUS MODE / POMODORO (ZERO REWARD ON START OR CANCEL)
// ============================================================
export function startFocusSession(
  s: HeroSave,
  durationMin: 25 | 50 | 90,
  questRefType: 'habit' | 'todo' | 'free',
  questRefId: string,
  questTitle: string,
  domain: LifeDomain
): void {
  s.focus.active = {
    durationMin,
    startedAt: Date.now(),
    questRefType,
    questRefId,
    questTitle: questTitle || 'Deep Focus Session',
    domain,
  };
}

export function cancelFocusSession(s: HeroSave): void {
  s.focus.active = null;
}

export function completeFocusSession(
  s: HeroSave
): { ok: boolean; xp: number; gold: number; domainXp: number; leveledUp: boolean; questCompleted: boolean } {
  const active = s.focus.active;
  if (!active) {
    return { ok: false, xp: 0, gold: 0, domainXp: 0, leveledUp: false, questCompleted: false };
  }
  const elapsedMs = Date.now() - active.startedAt;
  const requiredMs = active.durationMin * 60 * 1000;
  if (elapsedMs < requiredMs - 1500) {
    return { ok: false, xp: 0, gold: 0, domainXp: 0, leveledUp: false, questCompleted: false };
  }

  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  const baseXp = active.durationMin === 90 ? 90 : active.durationMin === 50 ? 45 : 20;
  const baseGold = active.durationMin === 90 ? 36 : active.durationMin === 50 ? 18 : 8;
  const domainXp = active.durationMin === 90 ? 65 : active.durationMin === 50 ? 32 : 15;
  const bossDmg = active.durationMin === 90 ? 35 : active.durationMin === 50 ? 18 : 8;

  const xpGain = Math.round(baseXp * skillB.focusXpMult * homeB.focusXpMult);
  const d = today();

  s.focus.active = null;
  s.focus.totalMinutes += active.durationMin;
  s.focus.sessionsCompleted += 1;
  s.focus.history.unshift({
    id: uid(),
    date: d,
    minutes: active.durationMin,
    domain: active.domain,
    questTitle: active.questTitle,
    xp: xpGain,
  });
  s.focus.history = s.focus.history.slice(0, 60);

  ensureDailyRecord(s, d).focusMinutes += active.durationMin;
  s.damageQueued += bossDmg;
  strikeWeeklyBoss(s, bossDmg, active.durationMin >= 50, `Focus ${active.durationMin}m`);
  grantDomainXp(s, active.domain, domainXp);

  if (s.focus.totalMinutes >= 120) {
    unlockTrophy(s, 'focus-adept');
  }

  let questCompleted = false;
  if (active.questRefType === 'habit' && active.questRefId) {
    const res = completeHabit(s, active.questRefId);
    questCompleted = res.ok;
  } else if (active.questRefType === 'todo' && active.questRefId) {
    const res = completeTodo(s, active.questRefId);
    questCompleted = res.ok;
  }

  const leveledUp = earnRewards(
    s,
    xpGain,
    baseGold,
    `Focus ${active.durationMin}m (${active.questTitle}) · +${xpGain} XP +${baseGold} Gold`
  );
  return { ok: true, xp: xpGain, gold: baseGold, domainXp, leveledUp, questCompleted };
}

// ============================================================
// ANALYTICS & WEEKLY REVIEW
// ============================================================
export interface AnalyticsReport {
  rangeDays: number;
  totalCompleted: number;
  successRate: number;
  focusHours: number;
  focusMinutes: number;
  xpEarned: number;
  hpLost: number;
  heatmap: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[];
  strongestHabits: { id: string; title: string; streak: number; completions: number; rate: number }[];
  weakestHabits: { id: string; title: string; slips: number; completions: number; rate: number }[];
}

export function computeAnalytics(s: HeroSave, period: 'week' | 'month'): AnalyticsReport {
  const days = period === 'week' ? 7 : 30;
  const end = today();

  // Build map combining dailyHistory + real habit doneDates & focus.history
  const countsByDate: Record<string, number> = {};
  const focusByDate: Record<string, number> = {};
  for (const [dt, rec] of Object.entries(s.dailyHistory || {})) {
    countsByDate[dt] = Math.max(countsByDate[dt] || 0, rec.completedTasks || 0);
    focusByDate[dt] = Math.max(focusByDate[dt] || 0, rec.focusMinutes || 0);
  }
  for (const h of s.habits) {
    if (h.kind === 'good') {
      for (const dt of h.doneDates) {
        countsByDate[dt] = Math.max(countsByDate[dt] || 0, 0) + 0; // ensure date exists
      }
    }
  }
  // If dailyHistory was empty for older dates, compute directly from habit doneDates
  for (let i = 0; i < 42; i++) {
    const dt = shiftDate(end, -i);
    if (!s.dailyHistory?.[dt]) {
      const doneOnDay = s.habits.filter((h) => h.kind === 'good' && h.doneDates.includes(dt)).length;
      if (doneOnDay > 0) countsByDate[dt] = doneOnDay;
    }
  }
  for (const f of s.focus?.history || []) {
    if (!s.dailyHistory?.[f.date]) {
      focusByDate[f.date] = (focusByDate[f.date] || 0) + f.minutes;
    }
  }

  let totalCompleted = 0;
  let totalScheduled = 0;
  let focusMinutes = 0;
  let xpEarned = 0;
  let hpLost = 0;

  for (let i = 0; i < days; i++) {
    const dt = shiftDate(end, -i);
    const rec = s.dailyHistory?.[dt];
    totalCompleted += countsByDate[dt] || 0;
    focusMinutes += focusByDate[dt] || 0;
    if (rec) {
      xpEarned += rec.xpEarned || 0;
      hpLost += rec.hpLost || 0;
    }
    const dueCount = s.habits.filter((h) => h.kind === 'good' && isHabitDue(h, dt)).length;
    totalScheduled += dueCount;
  }

  const successRate =
    totalScheduled > 0
      ? Math.min(100, Math.round((totalCompleted / totalScheduled) * 100))
      : totalCompleted > 0
        ? 100
        : 0;

  // Heatmap always shows 28 or 35 days neatly (5 weeks = 35 days)
  const heatmapDays = 35;
  const heatmap: AnalyticsReport['heatmap'] = [];
  for (let i = heatmapDays - 1; i >= 0; i--) {
    const dt = shiftDate(end, -i);
    const count = (countsByDate[dt] || 0) + ((focusByDate[dt] || 0) > 0 ? 1 : 0);
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    heatmap.push({ date: dt, count, level });
  }

  const habitStats = s.habits.map((h) => {
    let due = 0;
    let hits = 0;
    let slips = 0;
    for (let i = 0; i < days; i++) {
      const dt = shiftDate(end, -i);
      if (isHabitDue(h, dt)) {
        due += 1;
        if (h.kind === 'good' && h.doneDates.includes(dt)) hits += 1;
        if (h.kind === 'bad' && !h.slips.includes(dt)) hits += 1;
        if (h.kind === 'bad' && h.slips.includes(dt)) slips += 1;
      }
    }
    const rate = due > 0 ? Math.round((hits / due) * 100) : h.kind === 'good' ? 0 : 100;
    return { id: h.id, title: h.title, streak: h.streak, completions: hits, slips, rate, due };
  });

  const strongestHabits = [...habitStats]
    .sort((a, b) => b.rate - a.rate || b.streak - a.streak)
    .slice(0, 3);
  const weakestHabits = [...habitStats]
    .sort((a, b) => a.rate - b.rate || b.slips - a.slips)
    .slice(0, 3);

  return {
    rangeDays: days,
    totalCompleted,
    successRate,
    focusHours: Number((focusMinutes / 60).toFixed(1)),
    focusMinutes,
    xpEarned,
    hpLost,
    heatmap,
    strongestHabits,
    weakestHabits,
  };
}

export function getWeeklyReviewSummary(s: HeroSave) {
  const analytics = computeAnalytics(s, 'week');
  const weekKey = getIsoWeekKey();
  const wb = ensureWeeklyBoss(s);
  return {
    weekKey,
    alreadyReviewed: s.weeklyReview?.lastReviewedWeek === weekKey,
    questsDone: analytics.totalCompleted,
    focusMinutes: analytics.focusMinutes,
    hpLost: analytics.hpLost,
    successRate: analytics.successRate,
    bossDmg: wb.damageDealt,
    bossDefeated: wb.hp === 0,
    bossNeedsEvaluation: !wb.evaluated && wb.damageDealt > 0 && (isSunday() || wb.hp === 0),
    currentGoals: s.weeklyReview?.nextWeekGoals || [],
  };
}

export function submitWeeklyReview(s: HeroSave, goals: string[]): { ok: boolean; xp: number; gold: number; leveledUp: boolean } {
  const cleanGoals = goals.map((g) => g.trim()).filter(Boolean).slice(0, 3);
  const summary = getWeeklyReviewSummary(s);
  const firstTime = s.weeklyReview.lastReviewedWeek !== summary.weekKey;
  s.weeklyReview.lastReviewedWeek = summary.weekKey;
  s.weeklyReview.nextWeekGoals = cleanGoals;
  s.weeklyReview.pastReviews = [
    {
      weekKey: summary.weekKey,
      questsDone: summary.questsDone,
      focusMinutes: summary.focusMinutes,
      hpLost: summary.hpLost,
      bossDmg: summary.bossDmg,
      goals: cleanGoals,
    },
    ...(s.weeklyReview.pastReviews || []).filter((r) => r.weekKey !== summary.weekKey),
  ].slice(0, 12);

  if (firstTime) {
    const leveledUp = earnRewards(s, 35, 25, `Weekly Review Complete · +35 XP +25 Gold`);
    return { ok: true, xp: 35, gold: 25, leveledUp };
  }
  return { ok: true, xp: 0, gold: 0, leveledUp: false };
}

// ============================================================
// CHALLENGES, PETS, SHOP, SKILLS & DAY ROLLOVER
// ============================================================
export function joinChallenge(s: HeroSave, id: string): boolean {
  const c = CHALLENGES.find((x) => x.id === id);
  if (!c || s.challenges[id]) return false;
  s.challenges[id] = { joined: today(), progress: 0, done: false, claimed: false };
  earnRewards(s, 0, c.joinGold, `Joined ${c.name} · +${c.joinGold} Gold`);
  return true;
}

export function claimChallenge(s: HeroSave, id: string): { ok: boolean; leveledUp: boolean } {
  const c = CHALLENGES.find((x) => x.id === id);
  const st = s.challenges[id];
  if (!c || !st?.done || st.claimed) return { ok: false, leveledUp: false };
  st.claimed = true;
  const leveledUp = earnRewards(s, c.completionXP, c.completionGold, `Challenge completed: ${c.name}`);
  return { ok: true, leveledUp };
}

export function getPetStageLabel(level: number, lang?: AppLanguage): string {
  if (level >= 10) return lang === 'de' ? 'Erhaben' : 'Ascended';
  if (level >= 5) return lang === 'de' ? 'Erwacht' : 'Awakened';
  return lang === 'de' ? 'Jungtier' : 'Juvenile';
}

export function renamePet(s: HeroSave, petId: string, nickname: string): boolean {
  const pet = s.pets.find((p) => p.id === petId);
  if (!pet) return false;
  const cleaned = nickname.trim().slice(0, 24);
  if (!cleaned || cleaned === pet.name) {
    delete pet.nickname;
  } else {
    pet.nickname = cleaned;
  }
  return true;
}

export function hatchEgg(s: HeroSave): OwnedPet | null {
  if (s.eggs < 1) return null;
  s.eggs--;
  let roll = Math.random() * 100;
  let pet = PETS[PETS.length - 1];
  for (const p of PETS) {
    roll -= p.weight;
    if (roll < 0) {
      pet = p;
      break;
    }
  }
  const alreadyOwned = s.pets.some((p) => p.sprite === pet.sprite);
  const owned: OwnedPet = {
    id: uid(),
    name: pet.name,
    rarity: pet.rarity,
    sprite: pet.sprite,
    color: pet.color,
    hatched: today(),
    level: alreadyOwned ? 2 : 1,
    feedCount: alreadyOwned ? 2 : 0,
  };
  s.pets.push(owned);
  if (!s.activePetId) {
    s.activePetId = owned.id;
  }
  addLog(
    s,
    alreadyOwned
      ? `Hatched ${pet.name} (${pet.rarity} · Lv. 2 Bond)`
      : `Hatched ${pet.name} (${pet.rarity})`
  );
  return owned;
}

export function feedPet(
  s: HeroSave,
  petId: string
): { ok: boolean; leveledUp: boolean; petLeveledUp: boolean; petName: string } {
  const pet = s.pets.find((p) => p.id === petId);
  if (!pet || s.petFood < 1) {
    return { ok: false, leveledUp: false, petLeveledUp: false, petName: '' };
  }
  s.petFood--;
  s.petsFedCount++;
  const prevLevel = pet.level || 1;
  pet.feedCount = (pet.feedCount || 0) + 1;
  pet.level = 1 + Math.floor(pet.feedCount / 2);
  const petLeveledUp = pet.level > prevLevel;
  const displayName = pet.nickname || pet.name;
  const leveledUp = earnRewards(s, 6, 2, `Fed ${displayName} (+6 XP)`);
  return { ok: true, leveledUp, petLeveledUp, petName: displayName };
}

export function buyPetTreats(s: HeroSave): boolean {
  const cost = getDiscountedCost(s, 15);
  if (s.gold < cost) return false;
  s.gold -= cost;
  consumeShopDiscount(s);
  s.petFood += 3;
  addLog(s, 'Bought 3x Pet Treats');
  return true;
}

export interface OnboardingTaskStatus {
  id: string;
  title: string;
  hint: string;
  done: boolean;
}

export function getOnboardingTasks(s: HeroSave): OnboardingTaskStatus[] {
  return [
    {
      id: 'create-task',
      title: 'Create your first task',
      hint: 'Add a Habit or To-Do',
      done: s.habits.length > 0 || s.todos.length > 0,
    },
    {
      id: 'complete-task',
      title: 'Complete your first task',
      hint: 'Check off a Habit or To-Do',
      done: s.habitChecks + s.todoChecks > 0,
    },
    {
      id: 'hatch-pet',
      title: 'Hatch your first pet',
      hint: 'Hatch your starter egg in Realm → Pets',
      done: s.pets.length > 0,
    },
    {
      id: 'feed-pet',
      title: 'Feed your pet',
      hint: 'Give your companion a treat in Realm → Pets',
      done: s.petsFedCount > 0,
    },
    {
      id: 'buy-gear',
      title: 'Purchase a piece of equipment',
      hint: 'Buy any gear in Realm → Market',
      done: s.gearPurchasedCount > 0 || s.owned.length > 1,
    },
  ];
}

export function claimOnboardingWishPet(
  s: HeroSave,
  petIndex: number
): { ok: boolean; pet: OwnedPet | null; leveledUp: boolean } {
  if (s.onboardingRewardClaimed) return { ok: false, pet: null, leveledUp: false };
  const tasks = getOnboardingTasks(s);
  if (!tasks.every((t) => t.done)) return { ok: false, pet: null, leveledUp: false };

  const template = PETS[Math.max(0, Math.min(PETS.length - 1, petIndex))];
  const wishPet: OwnedPet = {
    id: uid(),
    name: template.name,
    rarity: template.rarity,
    sprite: template.sprite,
    color: template.color,
    hatched: today(),
    level: 1,
    feedCount: 0,
  };
  s.pets.push(wishPet);
  s.activePetId = wishPet.id;
  s.onboardingRewardClaimed = true;
  const leveledUp = earnRewards(
    s,
    100,
    75,
    `Onboarding Complete! Claimed Wish Pet ${wishPet.name} (+100 XP, +75 Gold)`
  );
  return { ok: true, pet: wishPet, leveledUp };
}

export function getDailyDealGear(d = today()) {
  const pool = ITEMS.filter((g) => !g.seasonal && g.cost > 0);
  let hash = 0;
  for (let i = 0; i < d.length; i++) {
    hash = (hash * 31 + d.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

export function getMarketItemPrice(
  s: HeroSave,
  itemId: string,
  d = today()
): { finalCost: number; baseCost: number; isDailyDeal: boolean; hasMerchantDiscount: boolean } {
  const item = ITEMS.find((x) => x.id === itemId);
  if (!item) {
    return { finalCost: 0, baseCost: 0, isDailyDeal: false, hasMerchantDiscount: false };
  }
  const dailyDeal = getDailyDealGear(d);
  const isDailyDeal = !item.seasonal && dailyDeal.id === item.id;
  const dealPrice = isDailyDeal ? Math.max(1, Math.round(item.cost * 0.75)) : item.cost;
  const finalCost = getDiscountedCost(s, dealPrice);
  const hasMerchantDiscount = (s.world?.merchantDiscountPct || 0) > 0;
  return {
    finalCost,
    baseCost: item.cost,
    isDailyDeal,
    hasMerchantDiscount,
  };
}

export function getMerlinMarketQuote(s: HeroSave, lang: AppLanguage = 'en'): string {
  const heroMaxHp = maxHp(s.level);
  const currentBoss = getBossForWins(s.bossWins);
  const isDe = lang === 'de';

  if (s.hp <= Math.floor(heroMaxHp * 0.4)) {
    return isDe
      ? 'Du siehst angeschlagen aus, Reisender. Ein Heiltrank rettet heute deinen Streak.'
      : "You're looking battered, traveler. A Healing Elixir might save your streak tonight.";
  }
  if ((s.world?.merchantDiscountPct || 0) > 0) {
    return isDe
      ? 'Ah, ein Karawanen-Gutschein! Dein nächster Kauf ist heute 20 % günstiger.'
      : 'Ah, a Caravan Voucher! Your next purchase in my market is 20% off.';
  }
  if (s.bossHp <= 45) {
    return isDe
      ? `${currentBoss.name} wankt bereits! Ein Kopfgeldbrief oder Angriffs-Spruch könnte den Sieg bringen.`
      : `${currentBoss.name} is staggering! A Bounty Writ or Attack Scroll could finish it tonight.`;
  }
  if (s.gold >= 100) {
    return isDe
      ? 'Ein schwerer Goldbeutel! Lust auf eine Geheimtruhe oder mein Tagesangebot?'
      : 'A heavy purse! Feeling lucky with a Mystery Chest, or eyeing today’s Daily Deal?';
  }
  if (s.level >= 8) {
    return isDe
      ? `Meister ${s.name} — in deine Hände gehören nur noch die feinsten Relikte.`
      : `Master ${s.name} — only the finest relics in my stall are worthy of you now.`;
  }
  return isDe
    ? `Willkommen an meinem Stand, ${s.name}. Mein heutiges Tagesangebot ist um 25 % reduziert!`
    : `Welcome to my stall, ${s.name}. Today’s pinned Daily Deal is 25% off!`;
}

export function buyItem(s: HeroSave, id: string): boolean {
  const i = ITEMS.find((x) => x.id === id);
  if (!i || s.owned.includes(id)) return false;
  if (i.seasonal && i.seasonal !== getActiveSeason()) return false;
  const { finalCost } = getMarketItemPrice(s, id);
  if (s.gold < finalCost) return false;
  s.gold -= finalCost;
  consumeShopDiscount(s);
  s.owned.push(id);
  s.gearPurchasedCount++;
  addLog(s, `Purchased ${i.name}`);
  return true;
}

export function equipGear(s: HeroSave, id: string, cosmetic = false): boolean {
  const item = ITEMS.find((x) => x.id === id);
  if (!item || !s.owned.includes(id)) return false;
  if (cosmetic) {
    s.costume[item.slot] = id;
  } else {
    s.equipped[item.slot] = id;
  }
  addLog(s, `${item.name} equipped ${cosmetic ? 'as vanity' : 'for battle'}`);
  return true;
}

export function unequipSlot(s: HeroSave, slot: keyof HeroSave['equipped'], cosmetic = false): void {
  if (cosmetic) {
    delete s.costume[slot];
  } else {
    delete s.equipped[slot];
  }
}

export function buyCityBuilding(s: HeroSave, id: string): boolean {
  const b = CITY_BUILDINGS.find((x) => x.id === id);
  if (!b || !s.guild.name) return false;
  const level = s.guild.buildings[id] || 0;
  const cost = b.base + level * 25;
  if (s.guild.xp < cost) return false;
  s.guild.xp -= cost;
  s.guild.buildings[id] = level + 1;
  addLog(s, `${b.name} upgraded to Level ${level + 1}`);
  return true;
}

export function useClassSkill(s: HeroSave, index: number): { ok: boolean; msg: string } {
  if (s.level < 10) return { ok: false, msg: 'Unlocks at Level 10' };
  const skill = CLASS_SKILLS[s.className][index];
  if (!skill || s.mp < skill[1]) return { ok: false, msg: 'Not enough MP' };
  s.mp -= skill[1];
  const cls = s.className;
  const st = calcStats(s);
  if (cls === 'Knight') {
    if (index === 0) s.protection += 8;
    else s.damageQueued += 20 + Math.floor(st.str / 3);
  } else if (cls === 'Mage') {
    if (index === 0) s.damageQueued += 32 + Math.floor(st.int / 2);
    else s.mp = Math.min(maxMp(s.level), s.mp + 8);
  } else if (cls === 'Healer') {
    if (index === 0) s.hp = Math.min(maxHp(s.level), s.hp + 14 + Math.floor(st.int / 2));
    else s.protection += 10;
  } else if (cls === 'Rogue') {
    if (index === 0) s.damageQueued += 25 + Math.floor(st.agi / 3);
    else s.gold += 10;
  } else if (cls === 'Bowman') {
    s.damageQueued += index === 0 ? 24 + Math.floor(st.agi / 3) : 14;
    if (index === 1) earnRewards(s, 2, 0);
  }
  addLog(s, `${skill[0]} activated`);
  return { ok: true, msg: `${skill[0]} cast!` };
}

export interface DayResolutionSummary {
  daysProcessed: number;
  damageDealt: number;
  damageTaken: number;
  healed: number;
  cleanBonusGold: number;
  cleanXpEarned: number;
  bossDefeated: string | null;
  bossNameBefore: string;
  bossWinsBefore: number;
  bossHpBefore: number;
  bossHpAfter: number;
  bossMaxHpBefore: number;
  milestoneChestLoot: string | null;
  leveledUp: boolean;
  fainted: boolean;
}

export function resolveDays(s: HeroSave, targetDay = today(), forceSingleDay = false): DayResolutionSummary | null {
  const rawElapsed = dayBetween(s.lastDay, targetDay);
  const elapsed = forceSingleDay ? Math.max(1, rawElapsed) : rawElapsed;
  if (elapsed <= 0) return null;

  const bossWinsBefore = s.bossWins;
  const bossNameBefore = getBossForWins(bossWinsBefore).name;
  const bossHpBefore = s.bossHp;
  const bossMaxHpBefore = getBossMaxHp(bossWinsBefore);

  const clamped = Math.min(elapsed, 366);
  const st = calcStats(s);
  const skillB = getSkillTreeBonuses(s);
  const homeB = getHomeBonuses(s);
  let totalDealt = 0;
  let totalTaken = 0;
  let totalHealed = 0;
  let cleanBonusGold = 0;
  let cleanXpEarned = 0;
  let bossDefeated: string | null = null;
  let milestoneChestLoot: string | null = null;
  let leveledUp = false;

  for (let n = 0; n < clamped; n++) {
    const day = forceSingleDay && rawElapsed <= 0 ? today() : shiftDate(s.lastDay, n);

    const missed = s.habits.filter((h) => h.kind === 'good' && isHabitDue(h, day) && !h.doneDates.includes(day));
    const clean = s.habits.filter((h) => h.kind === 'bad' && isHabitDue(h, day) && !h.slips.includes(day));
    const dmg = n === 0 ? s.damageQueued : 0;

    const petPerk = getPetPerkEffects(getActivePet(s));
    const perMissDmg = Math.max(1, 3 - Math.floor(st.def / 5));
    const totalProtection = s.protection + petPerk.rolloverBlock + skillB.rolloverBlock;
    const defend = Math.max(0, missed.length * perMissDmg - totalProtection);
    s.hp = Math.max(0, s.hp - defend);
    totalTaken += defend;
    if (defend > 0) {
      ensureDailyRecord(s, day).hpLost += defend;
    }
    s.protection = 0;

    if (clean.length > 0) {
      const bonusXp = clean.length * 12;
      const bonusG = clean.length * 3;
      cleanXpEarned += bonusXp;
      cleanBonusGold += bonusG;
      if (earnRewards(s, bonusXp, bonusG, `${clean.length} bad habit(s) resisted · +${bonusXp} XP +${bonusG} Gold`)) {
        leveledUp = true;
      }
      s.cleanDays++;
      addChallengeProgress(s, 'clean');
    }

    // Home Herb Garden, Alchemist Cellar, Skill Tree Mindfulness, & active pet passive regen on clean days
    const totalCleanHeal = homeB.cleanHealHp + skillB.cleanHealHp + petPerk.cleanHealHp;
    if (missed.length === 0) {
      ensureDailyRecord(s, day).cleanDay = true;
      if (totalCleanHeal > 0) {
        const beforeHp = s.hp;
        s.hp = Math.min(maxHp(s.level), s.hp + totalCleanHeal);
        totalHealed += s.hp - beforeHp;
      }
      if (homeB.cleanHealMp > 0) {
        s.mp = Math.min(maxMp(s.level), s.mp + homeB.cleanHealMp);
      }
    }

    for (const h of missed) h.streak = 0;
    for (const h of clean) h.streak++;

    if (dmg > 0) {
      const beforeBoss = s.bossHp;
      const landed = Math.min(dmg, beforeBoss);
      s.bossHp = Math.max(0, s.bossHp - dmg);
      totalDealt += landed;
      s.combatLog.unshift({
        id: uid(),
        day,
        text: `${s.name} struck for ${landed} damage`,
        type: 'hit',
      });
      if (s.bossHp === 0) {
        const vanquished = getBossForWins(s.bossWins);
        bossDefeated = vanquished.name;
        s.bossWins++;
        s.eggs++;
        unlockTrophy(s, 'boss-slayer');
        if (s.guild.name) s.guild.xp += 45;
        if (earnRewards(s, 65, 55, `${vanquished.name} defeated! +1 Pet Egg`)) {
          leveledUp = true;
        }
        addChallengeProgress(s, 'boss');

        // Boss Milestone Chest every 3rd victory
        if (s.bossWins % 3 === 0) {
          const unownedGear = ITEMS.filter((g) => !g.seasonal && g.cost > 0 && !s.owned.includes(g.id));
          if (unownedGear.length > 0) {
            const picked = unownedGear[Math.floor(Math.random() * unownedGear.length)];
            s.owned.push(picked.id);
            s.gearPurchasedCount++;
            milestoneChestLoot = `${picked.name} (${picked.rarity})`;
            addLog(s, `Boss Milestone Chest (#${s.bossWins}): Unlocked ${picked.name}!`);
          } else {
            s.gold += 50;
            s.petFood += 2;
            milestoneChestLoot = '+50 Gold · +2 Pet Treats';
            addLog(s, `Boss Milestone Chest (#${s.bossWins}): +50 Gold & +2 Pet Treats!`);
          }
          s.combatLog.unshift({
            id: uid(),
            day,
            text: `Boss Milestone Chest (#${s.bossWins}): ${milestoneChestLoot}`,
            type: 'victory',
          });
        }

        const nextBoss = getBossForWins(s.bossWins);
        s.bossHp = getBossMaxHp(s.bossWins);
        s.combatLog.unshift({
          id: uid(),
          day,
          text: `${vanquished.name} vanquished! ${nextBoss.name} approaches.`,
          type: 'victory',
        });
      }
    }

    if (missed.length > 0) {
      s.combatLog.unshift({
        id: uid(),
        day,
        text: `Missed ${missed.length} quest(s): ${defend} HP lost`,
        type: 'hurt',
      });
    }
    s.combatLog = s.combatLog.slice(0, 50);
  }

  const bossHpAfter = bossDefeated ? 0 : s.bossHp;

  s.damageQueued = 0;
  s.lastDay = targetDay;
  syncDailyQuestBoard(s);
  ensureWeeklyBoss(s);

  let fainted = false;
  if (s.hp <= 0) {
    fainted = true;
    s.faintCount++;
    const goldPenalty = Math.min(s.gold, 15);
    s.gold -= goldPenalty;
    s.hp = maxHp(s.level);
    s.combatLog.unshift({
      id: uid(),
      day: targetDay,
      text: `${s.name} collapsed and was revived at camp (-${goldPenalty} Gold)`,
      type: 'hurt',
    });
  }

  return {
    daysProcessed: clamped,
    damageDealt: totalDealt,
    damageTaken: totalTaken,
    healed: totalHealed,
    cleanBonusGold,
    cleanXpEarned,
    bossDefeated,
    bossNameBefore,
    bossWinsBefore,
    bossHpBefore,
    bossHpAfter,
    bossMaxHpBefore,
    milestoneChestLoot,
    leveledUp,
    fainted,
  };
}

export function buyCosmetic(s: HeroSave, id: string): boolean {
  const item = COSMETICS.find((x) => x.id === id);
  if (!item || s.ownedCosmetics.includes(id)) return false;
  if ('seasonal' in item && item.seasonal && item.seasonal !== getActiveSeason()) return false;
  const cost = getDiscountedCost(s, item.cost);
  if (s.gold < cost) return false;
  s.gold -= cost;
  consumeShopDiscount(s);
  s.ownedCosmetics.push(id);
  s.activeCosmetics[item.type] = id;
  addLog(s, `Purchased and equipped ${item.name}`);
  return true;
}

export function activateCosmetic(s: HeroSave, id: string): boolean {
  const item = COSMETICS.find((x) => x.id === id);
  if (!item || !s.ownedCosmetics.includes(id)) return false;
  if (s.activeCosmetics[item.type] === id) {
    delete s.activeCosmetics[item.type];
  } else {
    s.activeCosmetics[item.type] = id;
  }
  return true;
}

export function buyQuestItemWithDetail(s: HeroSave, id: string): { ok: boolean; msg: string } {
  const item = QUEST_SHOP.find((x) => x.id === id);
  if (!item) return { ok: false, msg: 'Item not found' };
  const cost = getDiscountedCost(s, item.cost);
  if (s.gold < cost) return { ok: false, msg: 'Not enough Gold' };
  s.gold -= cost;
  consumeShopDiscount(s);

  if (id === 'mystery-chest') {
    const pool = ITEMS.filter((g) => !g.seasonal && g.cost > 0 && !s.owned.includes(g.id));
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      s.owned.push(picked.id);
      s.gearPurchasedCount++;
      addLog(s, `Opened ${item.name}: Unlocked ${picked.name}!`);
      return { ok: true, msg: `Mystery Chest unlocked ${picked.name} (${picked.rarity})!` };
    }
    s.eggs += 1;
    s.petFood += 2;
    earnRewards(s, 35, 0, `Opened ${item.name}: +1 Pet Egg · +2 Treats · +35 XP`);
    return { ok: true, msg: 'Mystery Chest granted +1 Pet Egg · +2 Treats · +35 XP!' };
  }

  if (id === 'bounty-writ') {
    s.damageQueued += 10;
    earnRewards(s, 6, 0, `Used ${item.name} (+10 DMG, +6 XP)`);
    return { ok: true, msg: "Merlin's Bounty Writ: +10 Boss DMG · +6 XP!" };
  }

  if (id === 'scroll-damage') s.damageQueued += 15;
  if (id === 'healing-elixir') s.hp = Math.min(maxHp(s.level), s.hp + 12);
  if (id === 'mana-tonic') s.mp = Math.min(maxMp(s.level), s.mp + 8);
  if (id === 'pet-treats') s.petFood += 3;
  addLog(s, `Used ${item.name}`);
  return { ok: true, msg: `Applied ${item.name}!` };
}

export function buyQuestItem(s: HeroSave, id: string): boolean {
  return buyQuestItemWithDetail(s, id).ok;
}

export function exportSaveJson(s: HeroSave): void {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
  a.href = url;
  a.download = `arcana-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'hero'}-backup.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
