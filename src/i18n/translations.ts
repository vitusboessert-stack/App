import type { AppLanguage, LifeDomain, RealmSection, TimeOfDay } from '../types/arcana';

export interface TranslationStrings {
  // Navigation & Top Bar
  navHabits: string;
  navTodos: string;
  navRewards: string;
  navRealm: string;
  resolveDay: string;
  doneToday: string;
  newHabit: string;
  newTodo: string;
  customReward: string;
  unlocksLv10: string;

  // Daily Quest Board & Pinning
  dailyBoardTitle: string;
  dailyBoardSubtitle: string;
  dailyBoardSealed: string;
  dailyBoardEmpty: string;
  dailyBoardComplete: string;
  dailyBoardClaimed: string;
  dailyBoardClaimBtn: string;
  pinToBoard: string;
  pinnedOnBoard: string;
  priorityShort: string;
  completed: string;

  // Time of Day & Routine Combos
  timeAll: string;
  timeMorning: string;
  timeDay: string;
  timeEvening: string;
  timeAny: string;
  routineComboReady: string;
  routineComboDone: string;

  // Weekly Boss & Affinity
  bossWeakness: string;
  bossWeaknessBonus: string;
  endDayStrike: string;
  weeklyFocusGoals: string;
  sundayReviewReady: string;
  sundayReviewDesc: string;
  openReview: string;

  // Undo & Toast
  undo: string;
  undone: string;

  // To-Dos & Rewards
  noHabitsTitle: string;
  noHabitsDesc: string;
  createHabitBtn: string;
  emptyTodos: string;
  breakAllowanceUnit: string;
  breakAllowanceDesc: string;
  breakShop: string;
  logBreakTime: string;
  useMinutes: string;

  // Realm Sections & Labels
  realmTitle: string;
  backToRealm: string;
  settings: string;
  languageLabel: string;
  languageDesc: string;
  soundLabel: string;
  soundDesc: string;
  soundOn: string;
  soundOff: string;
  pwaSectionTitle: string;
  pwaSectionDesc: string;
  pwaInstallBtn: string;
  pwaInstalledBadge: string;
  pwaIosGuideTitle: string;
  pwaIosGuideSteps: string;
  pwaGotIt: string;
  offlineBanner: string;
  revisitMerlin: string;
  revisitMerlinDesc: string;
  replayOnboarding: string;
  saveBackup: string;
  saveBackupDesc: string;
  exportJson: string;
  importJson: string;
  titleScreen: string;
  titleScreenDesc: string;
  goToStart: string;
  resetProgress: string;
  resetProgressDesc: string;
  resetGame: string;

  // World Map & Encounters
  currentCamp: string;
  regionsExplored: string;
  exploreChestBtn: string;
  scoutEncounterBtn: string;
  travelHere: string;
  campedHere: string;
  unlockReqMissing: string;
  encounterTitle: string;
  merchantDiscountBanner: string;

  // My Home
  sanctuaryLv: string;
  activeHomePerks: string;
  roomsExpansions: string;
  furnitureDecor: string;
  seasonalDecorTitle: string;
  seasonalDecorDesc: string;
  trophyShelf: string;
  inspectHint: string;
  close: string;

  // Modals
  cancel: string;
  saveChanges: string;
  deleteHabit: string;
  keepQuesting: string;
  resolveStrikeBtn: string;
  continueAdventure: string;
}

const EN: TranslationStrings = {
  navHabits: 'Habits',
  navTodos: 'To-Dos',
  navRewards: 'Rewards',
  navRealm: 'Realm',
  resolveDay: 'Resolve Day',
  doneToday: 'done today',
  newHabit: 'New Habit',
  newTodo: 'New To-Do',
  customReward: 'Custom Reward',
  unlocksLv10: 'Unlocks at level 10',

  dailyBoardTitle: 'Daily Quest Board',
  dailyBoardSubtitle: 'Pin up to 3 quests · Priority A triggers Boss Special Strikes',
  dailyBoardSealed: 'Sealed',
  dailyBoardEmpty: 'Add or pin Habits and To-Dos to feature your Top 3 Daily Quests.',
  dailyBoardComplete: 'Complete',
  dailyBoardClaimed: 'Daily Quest Board Bounty Claimed ✓',
  dailyBoardClaimBtn: 'Claim Daily Quest Board Bounty (+30 XP · +20 Gold)',
  pinToBoard: 'Pin to Daily Board',
  pinnedOnBoard: 'Pinned to Board',
  priorityShort: 'Priority',
  completed: 'Completed',

  timeAll: 'All',
  timeMorning: 'Morning',
  timeDay: 'Day',
  timeEvening: 'Evening',
  timeAny: 'Flexible',
  routineComboReady: 'Routine',
  routineComboDone: 'Combo +10 XP · +15% DMG ✓',

  bossWeakness: 'Weakness',
  bossWeaknessBonus: '+35% DMG',
  endDayStrike: 'End Day & Strike Boss',
  weeklyFocusGoals: 'Weekly Focus Goals',
  sundayReviewReady: 'Sunday Weekly Review Ready',
  sundayReviewDesc: 'Review your week, claim boss chest & set 3 goals for next week.',
  openReview: 'Open Review',

  undo: 'Undo',
  undone: 'Action undone',

  noHabitsTitle: 'No habits scheduled here',
  noHabitsDesc: 'Create a good habit to build or a bad habit to break.',
  createHabitBtn: '+ Create Habit',
  emptyTodos: 'Your To-Do list is clear. Add your next objective.',
  breakAllowanceUnit: 'minutes',
  breakAllowanceDesc: 'Available break allowance · manually tracked',
  breakShop: 'Break Shop',
  logBreakTime: 'Log Break Time',
  useMinutes: 'Use',

  realmTitle: 'Realm',
  backToRealm: 'Back to Realm',
  settings: 'Settings',
  languageLabel: 'Language / Sprache',
  languageDesc: 'Switch interface language between English and Deutsch.',
  soundLabel: '16-Bit Sound Effects',
  soundDesc: 'Play subtle synthesized chimes on quest completions and level ups.',
  soundOn: 'Sound: On',
  soundOff: 'Sound: Off',
  pwaSectionTitle: 'Install ARCANA App',
  pwaSectionDesc: 'Install offline on your home screen or desktop for instant launch.',
  pwaInstallBtn: 'Install App',
  pwaInstalledBadge: 'Installed / Standalone',
  pwaIosGuideTitle: 'Install on iPhone / iPad',
  pwaIosGuideSteps: 'Tap the Safari Share button at the bottom, then choose "Add to Home Screen".',
  pwaGotIt: 'Got it',
  offlineBanner: 'Offline Mode · Progress saved locally',
  revisitMerlin: 'Revisit Merlin',
  revisitMerlinDesc: 'Replay onboarding without losing your habits, pets, or stats.',
  replayOnboarding: 'Replay Onboarding',
  saveBackup: 'Save Backup',
  saveBackupDesc: 'Export or import an ARCANA JSON save file.',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  titleScreen: 'Title Screen',
  titleScreenDesc: 'Return to the ARCANA welcome screen.',
  goToStart: 'Go to Start',
  resetProgress: 'Reset All Progress',
  resetProgressDesc: "Permanently erase this browser's save file.",
  resetGame: 'Reset Game',

  currentCamp: 'Current Camp',
  regionsExplored: 'Regions Explored',
  exploreChestBtn: 'Explore & Claim Discovery Chest',
  scoutEncounterBtn: 'Scout Region Encounter',
  travelHere: 'Travel Here',
  campedHere: 'Currently Camped Here',
  unlockReqMissing: 'Complete requirements above to unlock',
  encounterTitle: 'Region Encounter',
  merchantDiscountBanner: 'Merchant Caravan Bonus active: 20% off your next shop purchase!',

  sanctuaryLv: 'Sanctuary Lv.',
  activeHomePerks: 'Active Home Perks',
  roomsExpansions: 'Rooms & Expansions',
  furnitureDecor: 'Furniture & Decor',
  seasonalDecorTitle: 'Seasonal Sanctuary Decor',
  seasonalDecorDesc: 'Seasonal items from the Seasonal Shop automatically decorate your cottage.',
  trophyShelf: 'Trophy Shelf',
  inspectHint: 'Tap rooms, furniture, or trophies inside the house to inspect details.',
  close: 'Close',

  cancel: 'Cancel',
  saveChanges: 'Save Changes',
  deleteHabit: 'Delete Habit',
  keepQuesting: 'Keep Questing',
  resolveStrikeBtn: 'Resolve Day & Strike',
  continueAdventure: 'Continue Adventure',
};

const DE: TranslationStrings = {
  navHabits: 'Gewohnheiten',
  navTodos: 'Aufgaben',
  navRewards: 'Belohnungen',
  navRealm: 'Reich',
  resolveDay: 'Tag abschließen',
  doneToday: 'heute erledigt',
  newHabit: 'Neue Gewohnheit',
  newTodo: 'Neue Aufgabe',
  customReward: 'Eigene Belohnung',
  unlocksLv10: 'Ab Level 10',

  dailyBoardTitle: 'Daily Quest Board',
  dailyBoardSubtitle: 'Bis zu 3 Quests anpinnen · Priorität A löst Spezialangriffe aus',
  dailyBoardSealed: 'Besiegelt',
  dailyBoardEmpty: 'Pinne Gewohnheiten oder Aufgaben an, um deine Top 3 Quests hier anzuzeigen.',
  dailyBoardComplete: 'Erledigen',
  dailyBoardClaimed: 'Tagesbrett-Bonus abgeholt ✓',
  dailyBoardClaimBtn: 'Tagesbrett-Bonus abholen (+30 XP · +20 Gold)',
  pinToBoard: 'Ans Tagesbrett pinnen',
  pinnedOnBoard: 'Angepinnt',
  priorityShort: 'Priorität',
  completed: 'Erledigt',

  timeAll: 'Alle',
  timeMorning: 'Morgen',
  timeDay: 'Tag',
  timeEvening: 'Abend',
  timeAny: 'Flexibel',
  routineComboReady: 'Routine',
  routineComboDone: 'Combo +10 XP · +15% DMG ✓',

  bossWeakness: 'Schwäche',
  bossWeaknessBonus: '+35% DMG',
  endDayStrike: 'Tag beenden & Boss treffen',
  weeklyFocusGoals: 'Wochenziele',
  sundayReviewReady: 'Sonntags-Rückblick bereit',
  sundayReviewDesc: 'Woche auswerten, Boss-Truhe sichern & 3 Ziele festlegen.',
  openReview: 'Rückblick öffnen',

  undo: 'Rückgängig',
  undone: 'Aktion rückgängig gemacht',

  noHabitsTitle: 'Hier sind keine Gewohnheiten geplant',
  noHabitsDesc: 'Erstelle eine gute Gewohnheit zum Aufbauen oder eine schlechte zum Ablegen.',
  createHabitBtn: '+ Gewohnheit erstellen',
  emptyTodos: 'Deine Aufgabenliste ist leer. Füge dein nächstes Ziel hinzu.',
  breakAllowanceUnit: 'Minuten',
  breakAllowanceDesc: 'Verfügbares Pausenzeit-Guthaben · manuell erfasst',
  breakShop: 'Pausen-Shop',
  logBreakTime: 'Pausenzeit einlösen',
  useMinutes: 'Nutzen:',

  realmTitle: 'Reich',
  backToRealm: 'Zurück zum Reich',
  settings: 'Einstellungen',
  languageLabel: 'Sprache / Language',
  languageDesc: 'Oberfläche zwischen Deutsch und Englisch umschalten.',
  soundLabel: '16-Bit Soundeffekte',
  soundDesc: 'Dezente Retro-Klänge bei Quests und Level-Ups abspielen.',
  soundOn: 'Ton: An',
  soundOff: 'Ton: Aus',
  pwaSectionTitle: 'ARCANA als App installieren',
  pwaSectionDesc: 'Offline auf dem Homescreen oder Desktop installieren.',
  pwaInstallBtn: 'App installieren',
  pwaInstalledBadge: 'Installiert / Standalone',
  pwaIosGuideTitle: 'Auf iPhone / iPad installieren',
  pwaIosGuideSteps: 'Tippe unten in Safari auf "Teilen" und wähle "Zum Home-Bildschirm".',
  pwaGotIt: 'Verstanden',
  offlineBanner: 'Offline-Modus · Fortschritt lokal gespeichert',
  revisitMerlin: 'Merlin erneut besuchen',
  revisitMerlinDesc: 'Einführung wiederholen, ohne Gewohnheiten, Pets oder Stats zu verlieren.',
  replayOnboarding: 'Einführung starten',
  saveBackup: 'Spielstand sichern',
  saveBackupDesc: 'ARCANA-Spielstand als JSON-Datei exportieren oder laden.',
  exportJson: 'JSON exportieren',
  importJson: 'JSON laden',
  titleScreen: 'Startbildschirm',
  titleScreenDesc: 'Zurück zum ARCANA-Titelbildschirm.',
  goToStart: 'Zum Start',
  resetProgress: 'Fortschritt zurücksetzen',
  resetProgressDesc: 'Löscht den lokalen Spielstand in diesem Browser dauerhaft.',
  resetGame: 'Spiel zurücksetzen',

  currentCamp: 'Aktuelles Lager',
  regionsExplored: 'Regionen erkundet',
  exploreChestBtn: 'Erkunden & Entdeckertruhe öffnen',
  scoutEncounterBtn: 'Gebiet erneut auskundschaften',
  travelHere: 'Hierhin reisen',
  campedHere: 'Aktuelles Lager',
  unlockReqMissing: 'Erfülle die Anforderungen oben zum Freischalten',
  encounterTitle: 'Begegnung in der Region',
  merchantDiscountBanner: 'Händler-Karawanen-Rabatt aktiv: 20% Rabatt auf deinen nächsten Einkauf!',

  sanctuaryLv: 'Zuflucht Lv.',
  activeHomePerks: 'Aktive Haus-Boni',
  roomsExpansions: 'Räume & Ausbau',
  furnitureDecor: 'Möbel & Dekoration',
  seasonalDecorTitle: 'Saisonale Haus-Deko',
  seasonalDecorDesc: 'Gekaufte Saison-Items schmücken dein Haus automatisch passend zur Jahreszeit.',
  trophyShelf: 'Trophäen-Regal',
  inspectHint: 'Tippe auf Möbel oder Trophäen im Haus, um Details & Boni anzuzeigen.',
  close: 'Schließen',

  cancel: 'Abbrechen',
  saveChanges: 'Speichern',
  deleteHabit: 'Gewohnheit löschen',
  keepQuesting: 'Weiter questen',
  resolveStrikeBtn: 'Tag abschließen & angreifen',
  continueAdventure: 'Abenteuer fortsetzen',
};

export function getT(lang?: AppLanguage): TranslationStrings {
  return lang === 'de' ? DE : EN;
}

export function getDomainLabel(domain: LifeDomain, lang?: AppLanguage): string {
  if (lang !== 'de') return domain;
  const map: Record<LifeDomain, string> = {
    Knowledge: 'Wissen',
    Strength: 'Stärke',
    Discipline: 'Disziplin',
    Mindfulness: 'Achtsamkeit',
  };
  return map[domain] || domain;
}

export function getTimeOfDayLabel(slot: TimeOfDay, lang?: AppLanguage): string {
  const t = getT(lang);
  if (slot === 'morning') return t.timeMorning;
  if (slot === 'day') return t.timeDay;
  if (slot === 'evening') return t.timeEvening;
  return t.timeAny;
}

export function getRealmSectionTitle(section: RealmSection, lang?: AppLanguage): string {
  if (lang !== 'de') {
    if (section === 'Pets') return 'Pets & Companions';
    if (section === 'Boss') return 'Raid Boss';
    return section;
  }
  const map: Record<Exclude<RealmSection, ''>, string> = {
    Profile: 'Heldenprofil',
    Stats: 'Attribute & Werte',
    Skills: 'Klassenfähigkeiten',
    'Skill Tree': 'Talentbaum',
    'World Map': 'Weltkarte',
    'My Home': 'Mein Zuhause',
    Analytics: 'Statistiken',
    'Weekly Review': 'Wochenrückblick',
    Equipment: 'Ausrüstung',
    Pets: 'Gefährten & Pets',
    Boss: 'Raid-Boss',
    Challenges: 'Herausforderungen',
    Market: 'Marktplatz',
    'Customization Shop': 'Stil-Laden',
    'Seasonal Shop': 'Saison-Laden',
    'Time Traveler Shop': 'Zeitreise-Laden',
    Achievements: 'Erfolge',
    Settings: 'Einstellungen',
  };
  return section ? map[section] || section : '';
}
