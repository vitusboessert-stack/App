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
  ITEMS,
  OLD_STORE_KEY,
  PET_PERKS,
  PETS,
  QUEST_SHOP,
  STORE_KEY,
  type AvatarConfig,
  type ClassName,
  type HabitItem,
  type HabitKind,
  type HabitRhythm,
  type HeroSave,
  type OwnedPet,
  type PetSpriteId,
  type StatBlock,
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
          createdDate: h.createdDate || today(),
          doneDates: Array.isArray(h.doneDates) ? h.doneDates : h.completedDates || [],
          slips: Array.isArray(h.slips) ? h.slips : [],
          streak: h.streak || 0,
        }))
      : [],
    todos: Array.isArray(raw.todos) ? raw.todos : [],
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
  };
  return merged;
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
    const primaryKey = (['str', 'def', 'int', 'agi'] as const).reduce((best, k) =>
      stats[k] > stats[best] ? k : best
    , 'str' as keyof StatBlock);
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

  // Guild passive bonuses when a guild is founded
  if (s.guild.name) {
    v.str += s.guild.buildings.forge || 0;
    v.int += s.guild.buildings.library || 0;
  }

  // Active companion stat perks
  const petStats = getPetStatBonus(s);
  v.str += petStats.str;
  v.def += petStats.def;
  v.int += petStats.int;
  v.agi += petStats.agi;

  return v;
}

export function earnRewards(s: HeroSave, xp = 0, gold = 0, msg = ''): boolean {
  let leveledUp = false;
  s.xp += xp;
  s.gold += gold;
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

export function getHabitRewardPreview(s: HeroSave): { xp: number; gold: number } {
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const guildHallBonus = s.guild.name ? s.guild.buildings.hall || 0 : 0;
  const libraryXpBonus = s.guild.name ? (s.guild.buildings.library || 0) * 2 : 0;
  return {
    xp: 12 + libraryXpBonus + petPerk.bonusXp,
    gold: 5 + Math.floor(st.agi / 5) + guildHallBonus + petPerk.bonusGold,
  };
}

export function getTodoRewardPreview(s: HeroSave): { xp: number; gold: number } {
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const guildHallBonus = s.guild.name ? s.guild.buildings.hall || 0 : 0;
  const libraryXpBonus = s.guild.name ? (s.guild.buildings.library || 0) * 2 : 0;
  return {
    xp: 18 + libraryXpBonus + petPerk.bonusXp,
    gold: 8 + Math.floor(st.agi / 5) + guildHallBonus + petPerk.bonusGold,
  };
}

export function completeHabit(s: HeroSave, id: string): { ok: boolean; leveledUp: boolean; xp: number; gold: number } {
  const h = s.habits.find((x) => x.id === id);
  const d = today();
  if (!h || h.kind !== 'good' || h.doneDates.includes(d) || !isHabitDue(h, d)) {
    return { ok: false, leveledUp: false, xp: 0, gold: 0 };
  }
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const { xp: xpGain, gold: goldGain } = getHabitRewardPreview(s);

  h.doneDates.push(d);
  h.streak++;
  s.damageQueued += Math.max(2, 6 + Math.floor(st.str / 2)) + petPerk.bonusBossDmg;
  s.mp = Math.min(maxMp(s.level), s.mp + 1 + Math.floor(st.int / 8) + petPerk.bonusMp);
  s.habitChecks++;
  if (s.guild.name) s.guild.xp += 3;
  const leveledUp = earnRewards(s, xpGain, goldGain, `${h.title} completed · +${xpGain} XP +${goldGain} Gold`);
  addChallengeProgress(s, 'habit');
  return { ok: true, leveledUp, xp: xpGain, gold: goldGain };
}

export function recordSlip(s: HeroSave, id: string): boolean {
  const h = s.habits.find((x) => x.id === id);
  const d = today();
  if (!h || h.kind !== 'bad' || h.slips.includes(d)) return false;
  h.slips.push(d);
  h.streak = 0;
  s.hp = Math.max(0, s.hp - 5);
  addLog(s, `A slip on ${h.title}. Tomorrow is a fresh chance.`);
  return true;
}

export function addHabit(
  s: HeroSave,
  title: string,
  kind: HabitKind,
  rhythm: HabitRhythm,
  everyDays: number,
  weekdays: number[]
) {
  s.habits.unshift({
    id: uid(),
    title: title.trim(),
    kind,
    rhythm,
    everyDays,
    weekdays,
    createdDate: today(),
    doneDates: [],
    slips: [],
    streak: 0,
  });
}

export function updateHabit(
  s: HeroSave,
  id: string,
  title: string,
  kind: HabitKind,
  rhythm: HabitRhythm,
  everyDays: number,
  weekdays: number[]
) {
  const h = s.habits.find((x) => x.id === id);
  if (!h) return;
  h.title = title.trim() || h.title;
  h.kind = kind;
  h.rhythm = rhythm;
  h.everyDays = everyDays;
  h.weekdays = weekdays;
}

export function completeTodo(s: HeroSave, id: string): { ok: boolean; leveledUp: boolean; xp: number; gold: number } {
  const t = s.todos.find((x) => x.id === id);
  if (!t || t.done) return { ok: false, leveledUp: false, xp: 0, gold: 0 };
  const st = calcStats(s);
  const petPerk = getPetPerkEffects(getActivePet(s));
  const { xp: xpGain, gold: goldGain } = getTodoRewardPreview(s);

  t.done = true;
  s.todoChecks++;
  s.damageQueued += Math.max(4, 10 + Math.floor(st.str / 2)) + petPerk.bonusBossDmg;
  if (petPerk.bonusMp > 0) {
    s.mp = Math.min(maxMp(s.level), s.mp + petPerk.bonusMp);
  }
  if (s.guild.name) s.guild.xp += 5;
  const leveledUp = earnRewards(s, xpGain, goldGain, `${t.title} finished · +${xpGain} XP +${goldGain} Gold`);
  addChallengeProgress(s, 'todo');
  return { ok: true, leveledUp, xp: xpGain, gold: goldGain };
}

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
  const owned: OwnedPet = {
    id: uid(),
    name: pet.name,
    rarity: pet.rarity,
    sprite: pet.sprite,
    color: pet.color,
    hatched: today(),
  };
  s.pets.push(owned);
  if (!s.activePetId) {
    s.activePetId = owned.id;
  }
  addLog(s, `Hatched ${pet.name} (${pet.rarity})`);
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
  const leveledUp = earnRewards(s, 6, 2, `Fed ${pet.name} (+6 XP)`);
  return { ok: true, leveledUp, petLeveledUp, petName: pet.name };
}

export function buyPetTreats(s: HeroSave): boolean {
  if (s.gold < 15) return false;
  s.gold -= 15;
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
      hint: 'Buy any gear in Realm → Market or Seasonal Shop',
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

export function buyItem(s: HeroSave, id: string): boolean {
  const i = ITEMS.find((x) => x.id === id);
  if (!i || s.gold < i.cost || s.owned.includes(id)) return false;
  if (i.seasonal && i.seasonal !== getActiveSeason()) return false;
  s.gold -= i.cost;
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
  leveledUp: boolean;
  fainted: boolean;
}

export function resolveDays(s: HeroSave, targetDay = today(), forceSingleDay = false): DayResolutionSummary | null {
  const rawElapsed = dayBetween(s.lastDay, targetDay);
  const elapsed = forceSingleDay ? Math.max(1, rawElapsed) : rawElapsed;
  if (elapsed <= 0) return null;

  const clamped = Math.min(elapsed, 366);
  const st = calcStats(s);
  let totalDealt = 0;
  let totalTaken = 0;
  let totalHealed = 0;
  let cleanBonusGold = 0;
  let cleanXpEarned = 0;
  let bossDefeated: string | null = null;
  let leveledUp = false;

  for (let n = 0; n < clamped; n++) {
    const day = forceSingleDay && rawElapsed <= 0 ? today() : shiftDate(s.lastDay, n);
    const missed = s.habits.filter((h) => h.kind === 'good' && isHabitDue(h, day) && !h.doneDates.includes(day));
    const clean = s.habits.filter((h) => h.kind === 'bad' && isHabitDue(h, day) && !h.slips.includes(day));
    const dmg = n === 0 ? s.damageQueued : 0;

    const petPerk = getPetPerkEffects(getActivePet(s));
    const perMissDmg = Math.max(1, 3 - Math.floor(st.def / 5));
    const defend = Math.max(0, missed.length * perMissDmg - (s.protection + petPerk.rolloverBlock));
    s.hp = Math.max(0, s.hp - defend);
    totalTaken += defend;
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

    // Healing Garden & active pet passive regen on days with zero missed good habits
    const gardenHeal = s.guild.name ? s.guild.buildings.garden || 0 : 0;
    const totalCleanHeal = gardenHeal + petPerk.cleanHealHp;
    if (missed.length === 0 && totalCleanHeal > 0) {
      const beforeHp = s.hp;
      s.hp = Math.min(maxHp(s.level), s.hp + totalCleanHeal);
      totalHealed += s.hp - beforeHp;
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
        if (s.guild.name) s.guild.xp += 45;
        if (earnRewards(s, 65, 55, `${vanquished.name} defeated! +1 Pet Egg`)) {
          leveledUp = true;
        }
        addChallengeProgress(s, 'boss');
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

  s.damageQueued = 0;
  s.lastDay = targetDay;

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
    leveledUp,
    fainted,
  };
}

export function buyCosmetic(s: HeroSave, id: string): boolean {
  const item = COSMETICS.find((x) => x.id === id);
  if (!item || s.ownedCosmetics.includes(id) || s.gold < item.cost) return false;
  if ('seasonal' in item && item.seasonal && item.seasonal !== getActiveSeason()) return false;
  s.gold -= item.cost;
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

export function buyQuestItem(s: HeroSave, id: string): boolean {
  const item = QUEST_SHOP.find((x) => x.id === id);
  if (!item || s.gold < item.cost) return false;
  s.gold -= item.cost;
  if (id === 'scroll-damage') s.damageQueued += 15;
  if (id === 'healing-elixir') s.hp = Math.min(maxHp(s.level), s.hp + 12);
  if (id === 'mana-tonic') s.mp = Math.min(maxMp(s.level), s.mp + 8);
  if (id === 'pet-treats') s.petFood += 3;
  addLog(s, `Used ${item.name}`);
  return true;
}

export function exportSaveJson(s: HeroSave): void {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
  a.href = url;
  a.download = `arcana-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'hero'}-backup.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
