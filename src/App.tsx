import { useEffect, useRef, useState } from 'react';
import {
  Box,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Flame,
  ListChecks,
  Menu,
  Minus,
  Moon,
  Pencil,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Sword,
  Trash2,
} from 'lucide-react';
import {
  DOMAIN_META,
  PRIORITY_CONFIG,
  STORE_KEY,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
  type HeroSave,
  type HomeRoomId,
  type RealmSection,
  type TabId,
  type TaskPriority,
  type TimeOfDay,
} from './types/arcana';
import {
  activateCosmetic,
  addHabit,
  addLog,
  buyCosmetic,
  buyHomeFurniture,
  buyItem,
  buyPetTreats,
  buyQuestItemWithDetail,
  calcStats,
  claimChallenge,
  claimDailyBoardBonus,
  claimOnboardingWishPet,
  cloneSave,
  completeHabit,
  completeTodo,
  defaultSave,
  equipGear,
  evaluateWeeklyBoss,
  exploreRegion,
  exportSaveJson,
  feedPet,
  getBossForWins,
  getBossMaxHp,
  getHabitRewardPreview,
  getIsoWeekKey,
  getOnboardingTasks,
  getRoutineProgress,
  getTodoRewardPreview,
  getWeeklyBossAffinity,
  hatchEgg,
  hydrate,
  inferDomain,
  isHabitDue,
  isSunday,
  joinChallenge,
  loadSave,
  maxHp,
  maxMp,
  migrateV1,
  persistSave,
  recordSlip,
  renameHome,
  renamePet,
  resolveDays,
  setHabitPriority,
  setTodoPriority,
  submitWeeklyReview,
  syncDailyQuestBoard,
  today,
  toggleQuestPin,
  travelToRegion,
  uid,
  unequipSlot,
  unlockSkillNode,
  updateHabit,
  upgradeHomeRoom,
  useClassSkill,
  xpNeeded,
  type DayResolutionSummary,
} from './engine/game';
import { playSfx } from './engine/sound';
import { getDomainLabel, getT, getTimeOfDayLabel } from './i18n/translations';
import { Modals, type ActiveModal } from './components/Modals';
import { OnboardingFlow } from './components/OnboardingFlow';
import { BossSprite, HeroAvatar, QuestBoardIcon } from './components/PixelSprite';
import { OfflineIndicator, PWAInstallButton } from './components/PwaControls';
import { RealmViews } from './components/RealmViews';

type AppScreen = 'splash' | 'start' | 'onboarding' | 'game';

export default function App() {
  const pendingRolloverRef = useRef<DayResolutionSummary | null>(null);
  const [save, setSave] = useState<HeroSave | null>(() => {
    const loaded = loadSave();
    if (loaded) {
      const summary = resolveDays(loaded);
      if (summary) {
        pendingRolloverRef.current = summary;
      }
      persistSave(loaded);
    }
    return loaded;
  });
  const [screen, setScreen] = useState<AppScreen>(() => (save ? 'splash' : 'start'));
  const [tab, setTab] = useState<TabId>('habits');
  const [realmSection, setRealmSection] = useState<RealmSection>('');
  const [timeFilter, setTimeFilter] = useState<'all' | TimeOfDay>('all');
  const [modal, setModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string>('');
  const [undoSnapshot, setUndoSnapshot] = useState<HeroSave | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = (msg: string, undoTarget: HeroSave | null = null) => {
    setToast(msg);
    setUndoSnapshot(undoTarget);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(
      () => {
        setToast('');
        setUndoSnapshot(null);
      },
      undoTarget ? 5000 : 2800
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  // Auto-rollover check when app regains focus or midnight passes while open
  useEffect(() => {
    if (screen !== 'game') return;
    const checkRollover = () => {
      setSave((prev) => {
        if (!prev || prev.lastDay === today()) return prev;
        const draft = cloneSave(prev);
        const summary = resolveDays(draft);
        persistSave(draft);
        if (summary) {
          setModal({ type: 'resolution-summary', summary });
        }
        return draft;
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkRollover();
    };
    window.addEventListener('focus', checkRollover);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', checkRollover);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [screen]);

  const mutate = <T,>(fn: (draft: HeroSave) => T): T | undefined => {
    if (!save) return undefined;
    const draft = cloneSave(save);
    const result = fn(draft);
    persistSave(draft);
    setSave(draft);
    return result;
  };

  const finishSplash = () => {
    setScreen('game');
    if (pendingRolloverRef.current) {
      setModal({ type: 'resolution-summary', summary: pendingRolloverRef.current });
      pendingRolloverRef.current = null;
    }
  };

  useEffect(() => {
    if (screen !== 'splash') return;
    if (!save) {
      setScreen('start');
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(finishSplash, reduced ? 150 : 1250);
    return () => window.clearTimeout(timer);
  }, [screen, save]);

  const lang = save?.language || 'en';
  const t = getT(lang);

  const handleUndo = () => {
    if (!undoSnapshot) return;
    const restored = cloneSave(undoSnapshot);
    persistSave(restored);
    setSave(restored);
    setUndoSnapshot(null);
    notify(t.undone);
  };

  if (screen === 'splash' && save) {
    const splashPet = save.pets.find((p) => p.id === save.activePetId) || null;
    return (
      <div
        onClick={finishSplash}
        className="flex min-h-dvh cursor-pointer flex-col items-center justify-center bg-[#0d0d0f] px-6 text-center select-none"
      >
        <OfflineIndicator lang={lang} />
        <div className="animate-splash-hero flex flex-col items-center">
          <div className="relative rounded-3xl border border-white/[0.1] bg-[#18181b] p-2 shadow-2xl">
            <HeroAvatar
              avatar={save.avatar}
              className={save.className}
              equipped={save.equipped}
              costume={save.costume}
              costumeMode={save.costumeMode}
              activeCosmetics={save.activeCosmetics}
              activePet={splashPet}
              classNameWrapper="h-32 w-24 rounded-2xl"
            />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.35em] text-[#8e8e93]">ARCANA</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
            {lang === 'de' ? `Willkommen zurück, ${save.name}` : `Welcome back, ${save.name}`}
          </h1>
          <p className="font-mono-num mt-1 text-xs font-medium text-[#8e8e93]">
            Lv. {save.level} · {save.className}
          </p>

          <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-[#1e1e24]">
            <div className="animate-splash-bar h-full rounded-full bg-gradient-to-r from-[#8e8e93] via-[#f5f5f7] to-[#eab949]" />
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'start' || screen === 'onboarding' || !save) {
    return (
      <>
        <OfflineIndicator lang={lang} />
        <OnboardingFlow
          mode={screen === 'onboarding' ? 'onboarding' : 'start'}
          hasExistingSave={Boolean(save)}
          existingHeroName={save?.name}
          initialAvatar={save?.avatar}
          initialClass={save?.className}
          onStartNew={() => setScreen('onboarding')}
          onContinueExisting={() => {
            if (save) {
              const summary = mutate((d) => resolveDays(d)) || pendingRolloverRef.current;
              pendingRolloverRef.current = null;
              setScreen('game');
              if (summary) {
                setModal({ type: 'resolution-summary', summary });
              }
            }
          }}
          onBackToStart={() => setScreen('start')}
          onComplete={(heroName: string, avatar: AvatarConfig, className: ClassName) => {
            if (save) {
              mutate((d) => {
                d.name = heroName;
                d.avatar = avatar;
                d.className = className;
                addLog(d, 'Updated hero via Merlin onboarding');
              });
            } else {
              const fresh = defaultSave(heroName, className, avatar);
              persistSave(fresh);
              setSave(fresh);
            }
            setScreen('game');
            setTab('habits');
            setRealmSection('');
            notify(lang === 'de' ? 'Dein Abenteuer beginnt!' : 'Your adventure begins!');
          }}
        />
        <ToastBanner message={toast} />
      </>
    );
  }

  const completeHabitWithUndo = (habitId: string) => {
    const snapshot = cloneSave(save);
    const res = mutate((d) => completeHabit(d, habitId));
    if (res?.ok) {
      playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
      const extras = [
        res.specialStrike ? (lang === 'de' ? 'Spezialangriff!' : 'Special Attack!') : '',
        res.affinityHit ? (lang === 'de' ? 'Boss-Schwäche +35%!' : 'Boss Weakness +35%!') : '',
        res.routineCombo ? (lang === 'de' ? 'Routine-Combo +10 XP!' : 'Routine Combo +10 XP!') : '',
        res.domainLeveled ? '+1 SP!' : '',
      ]
        .filter(Boolean)
        .join(' · ');
      notify(
        `${res.leveledUp ? 'Level Up! ' : ''}+${res.xp} XP · +${res.gold} Gold${extras ? ` (${extras})` : ''}`,
        snapshot
      );
    }
  };

  const completeTodoWithUndo = (todoId: string) => {
    const snapshot = cloneSave(save);
    const res = mutate((d) => completeTodo(d, todoId));
    if (res?.ok) {
      playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
      const extras = [
        res.specialStrike ? (lang === 'de' ? 'Spezialangriff!' : 'Special Attack!') : '',
        res.affinityHit ? (lang === 'de' ? 'Boss-Schwäche +35%!' : 'Boss Weakness +35%!') : '',
        res.domainLeveled ? '+1 SP!' : '',
      ]
        .filter(Boolean)
        .join(' · ');
      notify(
        `${res.leveledUp ? 'Level Up! ' : ''}+${res.xp} XP · +${res.gold} Gold${extras ? ` (${extras})` : ''}`,
        snapshot
      );
    }
  };

  const activePet = save.pets.find((p) => p.id === save.activePetId) || null;
  const currentBoss = getBossForWins(save.bossWins);
  const currentBossMax = getBossMaxHp(save.bossWins);
  const bossAffinity = getWeeklyBossAffinity(save);
  const heroStats = calcStats(save);
  const dueGoodCount = save.habits.filter((h) => isHabitDue(h) && h.kind === 'good').length;
  const doneGoodCount = save.habits.filter(
    (h) => isHabitDue(h) && h.kind === 'good' && h.doneDates.includes(today())
  ).length;
  const dueHabits = save.habits.filter((h) => isHabitDue(h));
  const filteredDueHabits =
    timeFilter === 'all'
      ? dueHabits
      : dueHabits.filter((h) => (h.timeOfDay || 'any') === timeFilter);
  const onboardingTasks = getOnboardingTasks(save);
  const onboardingDoneCount = onboardingTasks.filter((ot) => ot.done).length;
  const onboardingAllDone = onboardingDoneCount === onboardingTasks.length;

  const dailyBoard =
    save.dailyBoard?.date === today()
      ? save.dailyBoard
      : syncDailyQuestBoard(cloneSave(save));
  const boardDoneCount = dailyBoard.quests.filter((q) => q.done).length;
  const boardAllDone = dailyBoard.quests.length > 0 && boardDoneCount === dailyBoard.quests.length;
  const needsSundayReview =
    isSunday() && save.weeklyReview?.lastReviewedWeek !== getIsoWeekKey();

  const cyclePriority = (p?: TaskPriority): TaskPriority =>
    p === 'A' ? 'B' : p === 'B' ? 'C' : 'A';

  const navItems: { id: TabId; label: string; icon: typeof ListChecks }[] = [
    { id: 'habits', label: t.navHabits, icon: ListChecks },
    { id: 'todos', label: t.navTodos, icon: CheckCircle2 },
    { id: 'rewards', label: t.navRewards, icon: Box },
    { id: 'realm', label: t.navRealm, icon: Menu },
  ];

  const handleTabSwitch = (nextTab: TabId) => {
    setTab(nextTab);
    setRealmSection('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle =
    tab === 'habits'
      ? t.navHabits
      : tab === 'todos'
        ? t.navTodos
        : tab === 'rewards'
          ? t.navRewards
          : t.navRealm;

  const handleQuickAdd = () => {
    if (tab === 'habits') setModal({ type: 'habit-add' });
    else if (tab === 'todos') setModal({ type: 'todo-add' });
    else if (tab === 'rewards') setModal({ type: 'reward-add' });
    else setModal({ type: 'avatar-edit' });
  };

  return (
    <div className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+6.5rem)] lg:pb-14">
      <OfflineIndicator lang={lang} />

      {/* Desktop Top Navigation — Apple Dark Glass */}
      <header className="hidden border-b border-white/[0.07] bg-[#121215]/90 backdrop-blur-xl lg:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-4">
          <button
            type="button"
            onClick={() => handleTabSwitch('habits')}
            className="shrink-0 whitespace-nowrap text-base font-bold tracking-[0.2em] text-[#f5f5f7]"
          >
            ARCANA
          </button>

          <nav className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-[#18181b] p-1 text-xs font-semibold">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSwitch(item.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${
                  tab === item.id
                    ? 'bg-[#f5f5f7] font-semibold text-[#111113]'
                    : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <PWAInstallButton lang={lang} variant="compact" />
            <button
              type="button"
              onClick={() => setModal({ type: 'resolve-preview' })}
              className="min-h-[36px] shrink-0 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#18181b] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] transition-colors hover:bg-[#242429]"
            >
              {t.resolveDay}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header (safe-area aware for notched/Dynamic Island devices) */}
      {tab !== 'realm' && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0f]/92 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3.5 backdrop-blur-xl lg:hidden">
          <div className="flex min-w-[40px] items-center">
            <PWAInstallButton lang={lang} variant="compact" />
          </div>

          <h1 className="text-center text-[15px] font-semibold tracking-[-0.01em] text-[#f5f5f7]">{pageTitle}</h1>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Quick Add"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-[#18181b] text-[#f5f5f7] transition-colors hover:bg-[#242429]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>
      )}

      <div
        className={`mx-auto max-w-4xl space-y-7 px-4 sm:px-6 lg:pt-8 ${
          tab === 'realm'
            ? 'pt-[calc(env(safe-area-inset-top)+1.25rem)]'
            : 'pt-5'
        }`}
      >
        {/* Top Profile & HP / EXP / MP Header */}
        {tab !== 'realm' && (
          <section className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setModal({ type: 'avatar-edit' })}
                title="Customize Hero Appearance"
                className="shrink-0 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111114]"
              >
                <HeroAvatar
                  avatar={save.avatar}
                  className={save.className}
                  equipped={save.equipped}
                  costume={save.costume}
                  costumeMode={save.costumeMode}
                  activeCosmetics={save.activeCosmetics}
                  activePet={activePet}
                  classNameWrapper="h-28 w-[84px] sm:h-32 sm:w-24"
                />
              </button>

              <div className="min-w-0 flex-1 space-y-2.5">
                <StatGauge
                  icon={<HpCrystalIcon />}
                  label="HP"
                  value={save.hp}
                  max={maxHp(save.level)}
                  valueColor="text-[#ff6961]"
                  barClass="bg-gradient-to-r from-[#ff453a] to-[#ff6961]"
                />
                <StatGauge
                  icon={<ExpStarIcon />}
                  label="EXP"
                  value={save.xp}
                  max={xpNeeded(save.level)}
                  valueColor="text-[#f0c05e]"
                  barClass="bg-gradient-to-r from-[#d49b2a] to-[#f5c249]"
                />
                <StatGauge
                  icon={<MpDiamondIcon />}
                  label="MP"
                  value={save.level < 10 ? 0 : save.mp}
                  max={maxMp(save.level)}
                  subtitle={save.level < 10 ? t.unlocksLv10 : undefined}
                  valueColor="text-[#64d2ff]"
                  barClass="bg-gradient-to-r from-[#0a84ff] to-[#64d2ff]"
                />
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full border border-white/[0.08] bg-[#202024] px-2.5 py-0.5 font-semibold tracking-wide text-[#f5f5f7]">
                  LVL {save.level}
                </span>
                <span className="font-semibold text-[#f5f5f7]">{save.name}</span>
                <span className="text-[#8e8e93]">· {save.className}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono-num hidden text-[#8e8e93] sm:inline">
                  STR {heroStats.str} · DEF {heroStats.def} · INT {heroStats.int} · AGI {heroStats.agi}
                </span>
                <span className="font-mono-num rounded-full border border-[#eab949]/25 bg-[#202024] px-3 py-0.5 font-semibold text-[#eab949]">
                  ● {save.gold}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Active Tab Workspace */}
        <main className="min-w-0">
          {tab === 'habits' && (
            <section className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                <div className="hidden sm:block" aria-hidden="true" />
                <div className="text-center">
                  <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">{t.navHabits}</h1>
                  <p className="font-mono-num mt-0.5 text-xs text-[#8e8e93]">
                    {doneGoodCount}/{dueGoodCount} {t.doneToday}
                  </p>
                </div>
                <div className="flex justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'habit-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-white whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.newHabit}
                  </button>
                </div>
              </div>

              {/* Sunday Weekly Review Prompt */}
              {needsSundayReview && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-[#18181b] p-4">
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 className="h-5 w-5 shrink-0 text-[#f5f5f7]" />
                    <div>
                      <p className="text-sm font-semibold text-[#f5f5f7]">{t.sundayReviewReady}</p>
                      <p className="text-xs text-[#8e8e93]">{t.sundayReviewDesc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('realm');
                      setRealmSection('Weekly Review');
                    }}
                    className="min-h-[36px] rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-semibold text-[#111113] hover:bg-white"
                  >
                    {t.openReview}
                  </button>
                </div>
              )}

              {/* Tactile RPG Notice Board — Intentionally elevated from the minimalist grey UI */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#6e4c2d] bg-gradient-to-b from-[#2b1e14] via-[#21170f] to-[#19120c] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,222,173,0.16)] sm:p-5">
                {/* Brass Corner Rivets */}
                <span className="pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 rounded-full border border-[#5e4116] bg-gradient-to-br from-[#f6d983] to-[#b5842a]" aria-hidden="true" />
                <span className="pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-[#5e4116] bg-gradient-to-br from-[#f6d983] to-[#b5842a]" aria-hidden="true" />
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 rounded-full border border-[#5e4116] bg-gradient-to-br from-[#f6d983] to-[#b5842a]" aria-hidden="true" />
                <span className="pointer-events-none absolute bottom-2.5 right-2.5 h-2 w-2 rounded-full border border-[#5e4116] bg-gradient-to-br from-[#f6d983] to-[#b5842a]" aria-hidden="true" />

                {/* Carved Wooden Header Plaque */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#735032]/75 bg-[#150f0a]/80 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#8c643b]/60 bg-[#2c1f14]">
                      <QuestBoardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f5deb3]">
                        {t.dailyBoardTitle}
                      </h2>
                      <p className="text-[11px] text-[#baa284]">
                        {t.dailyBoardSubtitle}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-num rounded-full border border-[#a47c38]/60 bg-[#2a2013] px-3 py-0.5 text-xs font-bold text-[#f3ca6b]">
                    {boardDoneCount} / {Math.max(dailyBoard.quests.length, 3)} {t.dailyBoardSealed}
                  </span>
                </div>

                {dailyBoard.quests.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {dailyBoard.quests.map((q) => {
                        const pCfg = PRIORITY_CONFIG[q.priority];
                        const dMeta = DOMAIN_META[q.domain];
                        const priorityLetterColor =
                          q.priority === 'A'
                            ? '#ea580c'
                            : q.priority === 'B'
                              ? '#2563eb'
                              : '#52525b';
                        return (
                          <div
                            key={q.id}
                            className={`relative flex flex-col justify-between rounded-xl border p-3.5 pt-5 transition-all ${
                              q.done
                                ? 'border-[#6fa885] bg-gradient-to-b from-[#e1ece2] to-[#d2dfd4] text-[#111113] shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                                : 'border-[#cbb792] bg-gradient-to-b from-[#f5edd9] to-[#e8dcc2] text-[#111113] shadow-[0_6px_14px_rgba(0,0,0,0.42)]'
                            }`}
                          >
                            {/* Thumbtack / Brass Pin */}
                            <span
                              className={`pointer-events-none absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border shadow-sm ${
                                q.done
                                  ? 'border-[#1d5e3a] bg-gradient-to-br from-[#4fd987] to-[#268c50]'
                                  : 'border-[#691c18] bg-gradient-to-br from-[#eb574d] to-[#99231b]'
                              }`}
                              aria-hidden="true"
                            />

                            <div>
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="font-bold uppercase tracking-wide text-[#111113]">
                                  {t.priorityShort}{' '}
                                  <span
                                    className="text-[12px] font-black"
                                    style={{ color: pCfg ? priorityLetterColor : '#111113' }}
                                  >
                                    {q.priority}
                                  </span>
                                  {q.pinned ? ' · 📌' : ''}
                                </span>
                                <span
                                  className="font-extrabold"
                                  style={{
                                    color: dMeta.color,
                                    filter: 'brightness(0.72) saturate(1.25)',
                                  }}
                                >
                                  {getDomainLabel(q.domain, lang)}
                                </span>
                              </div>

                              <p
                                className={`mt-2 line-clamp-2 text-[14px] leading-snug font-bold text-[#111113] ${
                                  q.done ? 'line-through opacity-75' : ''
                                }`}
                              >
                                {q.title}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#7a6448]/20 pt-2.5">
                              <span className="font-mono-num text-[11px] font-bold text-[#111113]">
                                +{q.xpReward} XP · +{q.goldReward}G
                              </span>

                              <button
                                type="button"
                                disabled={q.done}
                                onClick={() => {
                                  if (q.refType === 'habit') {
                                    completeHabitWithUndo(q.refId);
                                  } else {
                                    completeTodoWithUndo(q.refId);
                                  }
                                }}
                                aria-label={`Complete Daily Quest ${q.title}`}
                                className={`inline-flex min-h-[30px] items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                                  q.done
                                    ? 'bg-[#268c50] text-white'
                                    : 'bg-[#2b1f14] text-[#f5deb3] hover:bg-[#3c2b1c]'
                                }`}
                              >
                                {q.done ? (
                                  <>
                                    <Check className="h-3 w-3 stroke-[3]" />
                                    {t.dailyBoardSealed}
                                  </>
                                ) : (
                                  t.dailyBoardComplete
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {boardAllDone && (
                      <button
                        type="button"
                        disabled={dailyBoard.bonusClaimed}
                        onClick={() => {
                          const res = mutate((d) => claimDailyBoardBonus(d));
                          if (res?.ok) {
                            playSfx('level', save.soundEnabled);
                            notify(`${t.dailyBoardClaimed} +${res.xp} XP · +${res.gold} Gold`);
                          }
                        }}
                        className={`min-h-[42px] w-full rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                          dailyBoard.bonusClaimed
                            ? 'border border-[#3b6e4d] bg-[#192b20] text-[#5ce09e]'
                            : 'bg-gradient-to-r from-[#e0ab43] to-[#f4c763] text-[#241606] shadow-md hover:brightness-105'
                        }`}
                      >
                        {dailyBoard.bonusClaimed ? t.dailyBoardClaimed : t.dailyBoardClaimBtn}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-[#735032]/60 bg-[#150f0a]/50 px-4 py-4 text-center text-xs text-[#cbb89e]">
                    {t.dailyBoardEmpty}
                  </p>
                )}
              </div>

              {/* Time-of-Day Filter & Routine Combos */}
              {dueHabits.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1 rounded-full border border-white/[0.07] bg-[#18181b] p-1">
                      {(['all', 'morning', 'day', 'evening', 'any'] as const).map((slot) => {
                        const active = timeFilter === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeFilter(slot)}
                            className={`min-h-[28px] rounded-full px-3 py-0.5 text-[11px] font-semibold transition-colors ${
                              active
                                ? 'bg-[#f5f5f7] text-[#111113]'
                                : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                            }`}
                          >
                            {slot === 'all' ? t.timeAll : getTimeOfDayLabel(slot, lang)}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(['morning', 'day', 'evening'] as const).map((slot) => {
                        const prog = getRoutineProgress(save, slot);
                        if (prog.total < 2) return null;
                        return (
                          <span
                            key={slot}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              prog.comboClaimed
                                ? 'border-[#30d158]/35 bg-[#15281c] text-[#30d158]'
                                : 'border-white/[0.07] bg-[#18181b] text-[#8e8e93]'
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            {getTimeOfDayLabel(slot, lang)} {prog.done}/{prog.total}
                            {prog.comboClaimed ? ` · ${t.routineComboDone}` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
              )}

              {/* Next Week Focus Goals Strip */}
              {save.weeklyReview?.nextWeekGoals?.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">
                      {t.weeklyFocusGoals}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('realm');
                        setRealmSection('Weekly Review');
                      }}
                      className="text-[11px] font-semibold text-[#8e8e93] hover:text-[#f5f5f7]"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {save.weeklyReview.nextWeekGoals.map((g, i) => (
                      <span
                        key={`${g}-${i}`}
                        className="rounded-lg border border-white/[0.06] bg-[#202024] px-2.5 py-1 text-xs text-[#f5f5f7]"
                      >
                        {i + 1}. {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Habit Cards */}
              <div className="space-y-2">
                {filteredDueHabits.length > 0 ? (
                  filteredDueHabits.map((h) => {
                    const isGood = h.kind === 'good';
                    const done = h.doneDates.includes(today());
                    const slipped = h.slips.includes(today());
                    const priority = h.priority || 'B';
                    const pCfg = PRIORITY_CONFIG[priority];
                    const domain = h.domain || inferDomain(h.title);
                    const dMeta = DOMAIN_META[domain];
                    const slot = h.timeOfDay || 'any';
                    const isBossWeakness = isGood && domain === bossAffinity;
                    const scaledReward = getHabitRewardPreview(save, priority);

                    return (
                      <div
                        key={h.id}
                        className="flex min-h-[68px] items-stretch overflow-hidden rounded-2xl border border-white/[0.07] bg-[#18181b]"
                      >
                        {/* Left Check / Action Square */}
                        <button
                          type="button"
                          disabled={!isGood || done}
                          onClick={() => {
                            if (isGood) completeHabitWithUndo(h.id);
                          }}
                          aria-label={isGood ? `Complete ${h.title}` : h.title}
                          className={`grid w-14 shrink-0 place-items-center transition-colors ${
                            isGood
                              ? done
                                ? 'bg-[#30d158] text-[#092110]'
                                : 'bg-[#202024] text-[#8e8e93] hover:bg-[#2a2a30] hover:text-[#f5f5f7]'
                              : 'cursor-default bg-[#1c1c20] text-[#636369]'
                          }`}
                        >
                          <span
                            className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors ${
                              isGood
                                ? done
                                  ? 'animate-check-pop border-white/40 bg-white/20 text-white'
                                  : 'border-white/20 bg-white/[0.04]'
                                : 'border-white/10 bg-transparent'
                            }`}
                          >
                            {done ? (
                              <Check className="h-4 w-4 stroke-[3]" />
                            ) : isGood ? (
                              <Plus className="h-4 w-4 stroke-[2.2]" />
                            ) : (
                              <Plus className="h-4 w-4 opacity-40" />
                            )}
                          </span>
                        </button>

                        {/* Middle Content (click to edit) */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'habit-edit', habit: h })}
                              className="min-w-0 flex-1 text-left"
                            >
                              <p
                                className={`text-[15px] ${
                                  done ? 'font-bold text-[#ffffff]' : 'font-normal text-[#e8e8f2]'
                                }`}
                              >
                                {h.title}
                              </p>
                            </button>

                            {isGood && (
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = mutate((d) => toggleQuestPin(d, 'habit', h.id));
                                    if (res?.limitReached) {
                                      notify(
                                        lang === 'de'
                                          ? 'Maximal 3 Quests können angepinnt werden'
                                          : 'Max 3 quests can be pinned to the board'
                                      );
                                    } else if (res?.ok) {
                                      notify(
                                        res.pinned
                                          ? t.pinnedOnBoard
                                          : lang === 'de'
                                            ? 'Vom Tagesbrett gelöst'
                                            : 'Unpinned from Board'
                                      );
                                    }
                                  }}
                                  title={h.pinnedToBoard ? t.pinnedOnBoard : t.pinToBoard}
                                  aria-label={h.pinnedToBoard ? t.pinnedOnBoard : t.pinToBoard}
                                  className={`grid h-6 w-6 place-items-center rounded-md border transition-colors ${
                                    h.pinnedToBoard
                                      ? 'border-[#eab949]/50 bg-[#2a2113] text-[#eab949]'
                                      : 'border-white/[0.07] bg-[#202024] text-[#636369] hover:text-[#f5f5f7]'
                                  }`}
                                >
                                  {h.pinnedToBoard ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextP = cyclePriority(priority);
                                    mutate((d) => setHabitPriority(d, h.id, nextP));
                                    notify(`${t.priorityShort}: ${nextP}`);
                                  }}
                                  title="Cycle Priority A / B / C"
                                  style={{ color: pCfg.color, backgroundColor: pCfg.bg }}
                                  className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-extrabold transition-opacity hover:opacity-85"
                                >
                                  {priority}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#9c9cb0]">
                            <div className="flex min-w-0 items-center gap-2 truncate">
                              {isGood ? (
                                <>
                                  <span className="font-semibold" style={{ color: dMeta.color }}>
                                    {getDomainLabel(domain, lang)}
                                  </span>
                                  {slot !== 'any' && (
                                    <span className="inline-flex items-center gap-0.5 text-[11px] text-[#8e8e93]">
                                      {slot === 'morning' ? (
                                        <Sunrise className="h-3 w-3" />
                                      ) : slot === 'day' ? (
                                        <Sun className="h-3 w-3" />
                                      ) : (
                                        <Moon className="h-3 w-3" />
                                      )}
                                      {getTimeOfDayLabel(slot, lang)}
                                    </span>
                                  )}
                                  {isBossWeakness && (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-[#fb923c]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#fb923c]">
                                      <Flame className="h-2.5 w-2.5" />
                                      {t.bossWeaknessBonus}
                                    </span>
                                  )}
                                  {done && <span>· {t.completed}</span>}
                                </>
                              ) : (
                                <span className="truncate">
                                  {slipped
                                    ? 'Slip logged today · −5 HP'
                                    : "Don't tap · rewards next login"}
                                </span>
                              )}
                            </div>
                            <div className="ml-auto flex shrink-0 items-center gap-2 font-mono-num">
                              <span className="font-semibold text-[#9c9cb0]">
                                » {h.streak}
                              </span>
                              <span
                                className={`font-semibold ${
                                  isGood
                                    ? done
                                      ? 'text-[#45ba93]'
                                      : 'text-[#e8b84b]'
                                    : slipped
                                      ? 'text-[#78778c] opacity-60'
                                      : 'text-[#e8b84b]'
                                }`}
                              >
                                {isGood ? `+${scaledReward.xp} XP · +${scaledReward.gold} Gold` : '+12 XP · +3 Gold'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right - Action Square */}
                        {isGood ? (
                          <button
                            type="button"
                            onClick={() => setModal({ type: 'habit-edit', habit: h })}
                            aria-label={`Edit ${h.title}`}
                            className="grid w-14 shrink-0 place-items-center bg-[#1c1c20] text-[#8e8e93] transition-colors hover:bg-[#27272c] hover:text-[#f5f5f7]"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={slipped}
                            onClick={() => {
                              const ok = mutate((d) => recordSlip(d, h.id));
                              if (ok) {
                                playSfx('slip', save.soundEnabled);
                                notify('Slip logged · tomorrow is a fresh start');
                              }
                            }}
                            aria-label={`Log slip on ${h.title}`}
                            className={`grid w-14 shrink-0 place-items-center transition-colors ${
                              slipped
                                ? 'bg-[#7d5e24] text-[#fce8be]'
                                : 'bg-[#cc962e] text-[#ffffff] hover:bg-[#dba335]'
                            }`}
                          >
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/20">
                              <Minus className="h-4 w-4 stroke-[3]" />
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#18181b] p-8 text-center">
                    <h3 className="text-lg font-semibold text-[#f5f5f7]">{t.noHabitsTitle}</h3>
                    <p className="mt-1 text-sm text-[#8e8e93]">{t.noHabitsDesc}</p>
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'habit-add' })}
                      className="mt-4 min-h-[40px] rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] hover:bg-white"
                    >
                      {t.createHabitBtn}
                    </button>
                  </div>
                )}
              </div>

              {/* Simple Raid Boss Bar — Just the boss and the basics */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('realm');
                      setRealmSection('Boss');
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="h-14 w-18 shrink-0">
                      <BossSprite wins={save.bossWins} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-[#8e8e93]">
                        Boss · #{save.bossWins + 1} · {save.damageQueued} DMG queued
                      </p>
                      <p className="truncate text-sm font-semibold text-[#f5f5f7]">
                        {currentBoss.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#111114]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#ff453a] to-[#ff6961]"
                            style={{
                              width: `${Math.max(0, Math.min(100, (100 * save.bossHp) / Math.max(1, currentBossMax)))}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono-num text-[11px] text-[#8e8e93]">
                          {save.bossHp}/{currentBossMax}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModal({ type: 'resolve-preview' })}
                    className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-[#202024] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] transition-colors hover:bg-[#2a2a30] sm:w-auto"
                  >
                    <Sword className="h-3.5 w-3.5 text-[#f5f5f7]" />
                    {t.endDayStrike}
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === 'todos' && (
            <section className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                <div className="hidden sm:block" aria-hidden="true" />
                <h1 className="text-center text-2xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">{t.navTodos}</h1>
                <div className="flex justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'todo-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] hover:bg-white whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.newTodo}
                  </button>
                </div>
              </div>

              {/* Onboarding Tasks */}
              {!save.onboardingRewardClaimed && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">Onboarding Quests</p>
                      <h2 className="text-base font-semibold text-[#f5f5f7]">
                        Complete 5 tasks for a Wish Pet + 100 XP
                      </h2>
                    </div>
                    <span className="font-mono-num rounded-full border border-white/[0.08] bg-[#202024] px-3 py-1 text-xs font-semibold text-[#e8b84b]">
                      {onboardingDoneCount} / {onboardingTasks.length}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    {onboardingTasks.map((ot) => (
                      <div
                        key={ot.id}
                        className="flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#111114] pr-3"
                      >
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center ${
                            ot.done ? 'bg-[#30d158] text-[#092110]' : 'bg-[#202024] text-[#8e8e93]'
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 place-items-center rounded-md border ${
                              ot.done ? 'border-black/20 bg-black/10 text-[#092110]' : 'border-white/20'
                            }`}
                          >
                            {ot.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 py-2">
                          <p
                            className={`text-sm ${
                              ot.done ? 'font-semibold text-[#f5f5f7]' : 'font-normal text-[#e5e5ea]'
                            }`}
                          >
                            {ot.title}
                          </p>
                          <p className="text-[11px] text-[#8e8e93]">{ot.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {onboardingAllDone && (
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'wish-pet' })}
                      className="mt-4 min-h-[42px] w-full rounded-full bg-[#f5f5f7] px-5 py-2 text-sm font-semibold text-[#111113] hover:bg-white"
                    >
                      Claim Your Wish Pet (+100 XP · +75 Gold)
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {save.todos.length > 0 ? (
                  save.todos.map((todo) => {
                    const priority = todo.priority || 'B';
                    const pCfg = PRIORITY_CONFIG[priority];
                    const domain = todo.domain || inferDomain(todo.title);
                    const dMeta = DOMAIN_META[domain];
                    const todoReward = getTodoRewardPreview(save, priority);
                    const isBossWeakness = !todo.done && domain === bossAffinity;

                    return (
                      <div
                        key={todo.id}
                        className="flex min-h-[68px] items-stretch overflow-hidden rounded-2xl border border-white/[0.07] bg-[#18181b]"
                      >
                        <button
                          type="button"
                          disabled={todo.done}
                          onClick={() => completeTodoWithUndo(todo.id)}
                          aria-label={todo.done ? `${todo.title} completed` : `Complete ${todo.title}`}
                          className={`grid w-14 shrink-0 place-items-center transition-colors ${
                            todo.done
                              ? 'bg-[#30d158] text-[#092110]'
                              : 'bg-[#202024] text-[#8e8e93] hover:bg-[#2a2a30] hover:text-[#f5f5f7]'
                          }`}
                        >
                          <span
                            className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors ${
                              todo.done
                                ? 'animate-check-pop border-black/20 bg-black/10 text-[#092110]'
                                : 'border-white/20 bg-white/[0.04]'
                            }`}
                          >
                            {todo.done && <Check className="h-4 w-4 stroke-[3]" />}
                          </span>
                        </button>

                        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-[15px] ${
                                todo.done ? 'font-semibold text-[#f5f5f7]' : 'font-normal text-[#e5e5ea]'
                              }`}
                            >
                              {todo.title}
                            </p>
                            {!todo.done && (
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = mutate((d) => toggleQuestPin(d, 'todo', todo.id));
                                    if (res?.limitReached) {
                                      notify(
                                        lang === 'de'
                                          ? 'Maximal 3 Quests können angepinnt werden'
                                          : 'Max 3 quests can be pinned to the board'
                                      );
                                    } else if (res?.ok) {
                                      notify(
                                        res.pinned
                                          ? t.pinnedOnBoard
                                          : lang === 'de'
                                            ? 'Vom Tagesbrett gelöst'
                                            : 'Unpinned from Board'
                                      );
                                    }
                                  }}
                                  title={todo.pinnedToBoard ? t.pinnedOnBoard : t.pinToBoard}
                                  aria-label={todo.pinnedToBoard ? t.pinnedOnBoard : t.pinToBoard}
                                  className={`grid h-6 w-6 place-items-center rounded-md border transition-colors ${
                                    todo.pinnedToBoard
                                      ? 'border-[#eab949]/50 bg-[#2a2113] text-[#eab949]'
                                      : 'border-white/[0.07] bg-[#202024] text-[#636369] hover:text-[#f5f5f7]'
                                  }`}
                                >
                                  {todo.pinnedToBoard ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextP = cyclePriority(priority);
                                    mutate((d) => setTodoPriority(d, todo.id, nextP));
                                    notify(`${t.priorityShort}: ${nextP}`);
                                  }}
                                  title="Cycle Priority A / B / C"
                                  style={{ color: pCfg.color, backgroundColor: pCfg.bg }}
                                  className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-85"
                                >
                                  {priority}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#8e8e93]">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="font-semibold" style={{ color: dMeta.color }}>
                                {getDomainLabel(domain, lang)}
                              </span>
                              {isBossWeakness && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-[#fb923c]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#fb923c]">
                                  <Flame className="h-2.5 w-2.5" />
                                  {t.bossWeaknessBonus}
                                </span>
                              )}
                              {todo.dueDate ? ` · Due ${todo.dueDate}` : ''}
                            </span>
                            <span className={`font-mono-num shrink-0 font-semibold ${todo.done ? 'text-[#30d158]' : 'text-[#e8b84b]'}`}>
                              {todo.done ? t.completed : `+${todoReward.xp} XP · +${todoReward.gold} Gold`}
                            </span>
                          </div>
                        </div>

                        {!todo.done && (
                          <button
                            type="button"
                            onClick={() => setModal({ type: 'todo-edit', todo })}
                            aria-label={`Edit ${todo.title}`}
                            className="grid w-11 shrink-0 place-items-center text-[#8e8e93] hover:bg-[#242429] hover:text-[#f5f5f7]"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            mutate((d) => {
                              d.todos = d.todos.filter((x) => x.id !== todo.id);
                              syncDailyQuestBoard(d);
                            })
                          }
                          aria-label={`Delete ${todo.title}`}
                          className="grid w-11 shrink-0 place-items-center text-[#8e8e93] hover:bg-[#2c1c20] hover:text-[#ff6961]"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#18181b] p-7 text-center text-sm text-[#8e8e93]">
                    {t.emptyTodos}
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'rewards' && (
            <section className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                <div className="hidden sm:block" aria-hidden="true" />
                <h1 className="text-center text-2xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">{t.navRewards}</h1>
                <div className="flex justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'reward-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] hover:bg-white whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.customReward}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
                <p className="font-mono-num text-3xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                  {save.rewardMinutes} {t.breakAllowanceUnit}
                </p>
                <p className="mt-1 text-xs text-[#8e8e93]">
                  {t.breakAllowanceDesc}
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-base font-semibold text-[#f5f5f7]">{t.breakShop}</h2>
                <div className="space-y-2">
                  {save.rewards.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#f5f5f7]">{r.title}</p>
                        <p className="font-mono-num mt-0.5 text-xs text-[#8e8e93]">
                          +{r.minutes} {t.breakAllowanceUnit}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={save.gold < r.cost}
                        onClick={() => {
                          mutate((d) => {
                            const item = d.rewards.find((x) => x.id === r.id);
                            if (!item || d.gold < item.cost) return;
                            d.gold -= item.cost;
                            d.rewardMinutes += item.minutes;
                            addLog(d, `Purchased ${item.title}`);
                          });
                          playSfx('equip', save.soundEnabled);
                          notify(`${r.title} +${r.minutes}m`);
                        }}
                        className="font-mono-num min-h-[36px] rounded-full bg-[#d4ab5a] px-4 py-1.5 text-xs font-semibold text-[#1c1508] hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369] whitespace-nowrap"
                      >
                        {r.cost} Gold
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-base font-semibold text-[#f5f5f7]">{t.logBreakTime}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 15, 30].map((min) => (
                    <button
                      key={min}
                      type="button"
                      disabled={save.rewardMinutes < min}
                      onClick={() => {
                        mutate((d) => {
                          if (d.rewardMinutes < min) return;
                          d.rewardMinutes -= min;
                          addLog(d, `Used ${min} minutes of break allowance`);
                        });
                        notify(`${min} min`);
                      }}
                      className="min-h-[42px] rounded-xl border border-white/[0.07] bg-[#18181b] px-3 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#242429] disabled:opacity-40"
                    >
                      {t.useMinutes} {min} min
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === 'realm' && (
            <RealmViews
              save={save}
              section={realmSection}
              onBack={() => setRealmSection('')}
              onOpenSection={(sec) => setRealmSection(sec)}
              onOpenAvatarEdit={() => setModal({ type: 'avatar-edit' })}
              onOpenClassSwitch={() => setModal({ type: 'class-switch' })}
              onCastSkill={(idx) => {
                const res = mutate((d) => useClassSkill(d, idx));
                if (res?.ok) {
                  playSfx('quest', save.soundEnabled);
                  notify(res.msg);
                } else {
                  notify(res?.msg || 'Cannot cast skill');
                }
              }}
              onToggleCostumeMode={(enabled) =>
                mutate((d) => {
                  d.costumeMode = enabled;
                })
              }
              onOpenEquipSelect={(slot) => setModal({ type: 'equip-select', slot })}
              onEquipItem={(id) => {
                mutate((d) => equipGear(d, id, d.costumeMode));
                playSfx('equip', save.soundEnabled);
                notify('Gear equipped onto avatar');
              }}
              onHatchEgg={() => {
                const pet = mutate((d) => hatchEgg(d));
                if (pet) {
                  playSfx('hatch', save.soundEnabled);
                  notify(
                    (pet.level || 1) >= 2
                      ? `Hatched ${pet.name} (${pet.rarity} · Lv. 2 Bond)!`
                      : `Hatched ${pet.name} (${pet.rarity})!`
                  );
                }
                return pet;
              }}
              onFeedPet={(petId) => {
                const res = mutate((d) => feedPet(d, petId));
                if (res?.ok) {
                  playSfx(res.leveledUp || res.petLeveledUp ? 'level' : 'quest', save.soundEnabled);
                  notify(
                    res.petLeveledUp
                      ? `${res.petName} leveled up! +6 XP`
                      : `Fed ${res.petName}! +6 XP · +2 Gold`
                  );
                } else {
                  notify('No pet treats left! Buy more above.');
                }
              }}
              onBuyPetTreats={() => {
                if (mutate((d) => buyPetTreats(d))) {
                  playSfx('equip', save.soundEnabled);
                  notify('Bought 3x Pet Treats!');
                } else {
                  notify('Not enough Gold (15 Gold needed)');
                }
              }}
              onSetActivePet={(petId) => {
                mutate((d) => {
                  d.activePetId = petId;
                });
                notify(petId ? 'Companion summoned!' : 'Companion rested');
              }}
              onRenamePet={(petId, nickname) => {
                if (mutate((d) => renamePet(d, petId, nickname))) {
                  notify(lang === 'de' ? 'Gefährte umbenannt' : 'Companion renamed');
                }
              }}
              onOpenResolveDay={() => setModal({ type: 'resolve-preview' })}
              onJoinChallenge={(id) => {
                if (mutate((d) => joinChallenge(d, id))) {
                  playSfx('quest', save.soundEnabled);
                  notify('Joined challenge · +20 Gold');
                }
              }}
              onClaimChallenge={(id) => {
                const res = mutate((d) => claimChallenge(d, id));
                if (res?.ok) {
                  playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
                  notify('Challenge reward claimed!');
                }
              }}
              onUnlockSkillNode={(nodeId) => {
                const res = mutate((d) => unlockSkillNode(d, nodeId));
                if (res?.ok) {
                  playSfx('level', save.soundEnabled);
                }
                if (res?.msg) notify(res.msg);
              }}
              onTravelRegion={(regionId) => {
                const res = mutate((d) => travelToRegion(d, regionId));
                if (res?.msg) notify(res.msg);
              }}
              onExploreRegion={(regionId) => {
                const res = mutate((d) => exploreRegion(d, regionId));
                if (res?.ok) {
                  playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
                }
                if (res?.msg) notify(res.msg);
                return res?.encounter;
              }}
              onUpgradeHomeRoom={(roomId: HomeRoomId) => {
                const res = mutate((d) => upgradeHomeRoom(d, roomId));
                if (res?.ok) playSfx('level', save.soundEnabled);
                if (res?.msg) notify(res.msg);
              }}
              onBuyHomeFurniture={(id) => {
                const res = mutate((d) => buyHomeFurniture(d, id));
                if (res?.ok) playSfx('equip', save.soundEnabled);
                if (res?.msg) notify(res.msg);
              }}
              onRenameHome={(name) => {
                mutate((d) => renameHome(d, name));
                notify('Home renamed');
              }}
              onEvaluateWeeklyBoss={() => {
                const res = mutate((d) => evaluateWeeklyBoss(d));
                if (res?.ok) {
                  playSfx('level', save.soundEnabled);
                  notify(
                    `Weekly Boss ${res.victory ? 'Defeated' : 'Evaluated'}! +${res.xp} XP · +${res.gold} Gold${
                      res.egg ? ' · +1 Egg!' : ''
                    }`
                  );
                } else {
                  notify('Weekly Boss evaluates on Sunday or upon defeat');
                }
              }}
              onSaveWeeklyReview={(goals) => {
                const res = mutate((d) => submitWeeklyReview(d, goals));
                if (res?.ok) {
                  playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
                  notify(
                    res.xp > 0
                      ? `Weekly Review saved! +${res.xp} XP · +${res.gold} Gold`
                      : 'Weekly goals updated!'
                  );
                }
              }}
              onBuyItem={(id) => {
                if (mutate((d) => buyItem(d, id))) {
                  playSfx('equip', save.soundEnabled);
                  notify('Gear purchased! Equip it in Equipment.');
                } else {
                  notify('Not enough Gold');
                }
              }}
              onBuyQuestItem={(id) => {
                const res = mutate((d) => buyQuestItemWithDetail(d, id));
                if (res?.ok) {
                  playSfx('quest', save.soundEnabled);
                  notify(res.msg);
                } else {
                  notify(res?.msg || 'Not enough Gold');
                }
              }}
              onBuyCosmetic={(id) => {
                if (mutate((d) => buyCosmetic(d, id))) {
                  playSfx('equip', save.soundEnabled);
                  notify('Cosmetic purchased & equipped');
                } else {
                  notify('Not enough Gold');
                }
              }}
              onActivateCosmetic={(id) => {
                mutate((d) => activateCosmetic(d, id));
                playSfx('equip', save.soundEnabled);
                notify('Cosmetic updated');
              }}
              onToggleSound={(enabled) =>
                mutate((d) => {
                  d.soundEnabled = enabled;
                })
              }
              onChangeLanguage={(nextLang) => {
                mutate((d) => {
                  d.language = nextLang;
                });
                notify(nextLang === 'de' ? 'Sprache auf Deutsch umgestellt' : 'Language set to English');
              }}
              onReplayOnboarding={() => setScreen('onboarding')}
              onExportSave={() => {
                exportSaveJson(save);
                notify('Save backup exported');
              }}
              onImportSave={async (file) => {
                try {
                  const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
                  if (!parsed?.name || !Array.isArray(parsed.habits)) {
                    throw new Error('Invalid save');
                  }
                  const restored = parsed.version === 1 ? migrateV1(parsed) : hydrate(parsed);
                  persistSave(restored);
                  setSave(restored);
                  setTab('habits');
                  setRealmSection('');
                  notify(`Restored adventure of ${restored.name}`);
                } catch {
                  notify('Invalid or unsupported save file');
                }
              }}
              onGoStart={() => setScreen('start')}
              onOpenResetConfirm={() => setModal({ type: 'confirm-reset' })}
            />
          )}
        </main>
      </div>

      {/* Mobile Minimalist Floating Dock Navigation (4 clean Apple-style items) */}
      <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 right-3 z-30 mx-auto max-w-md rounded-full border border-white/[0.08] bg-[#18181b]/92 px-2 py-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSwitch(item.id)}
                aria-label={item.label}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-full py-1 transition-colors ${
                  active ? 'bg-[#27272c] text-[#f5f5f7]' : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Modals
        modal={modal}
        save={save}
        onClose={() => setModal(null)}
        onCreateHabit={(title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay) => {
          mutate((d) => addHabit(d, title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay));
          setModal(null);
          notify(lang === 'de' ? 'Gewohnheit hinzugefügt' : 'Habit added');
        }}
        onUpdateHabit={(id, title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay) => {
          mutate((d) => updateHabit(d, id, title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay));
          setModal(null);
          notify(lang === 'de' ? 'Gewohnheit aktualisiert' : 'Habit updated');
        }}
        onDeleteHabit={(id) => {
          mutate((d) => {
            d.habits = d.habits.filter((h) => h.id !== id);
            syncDailyQuestBoard(d);
          });
          setModal(null);
          notify('Habit removed');
        }}
        onCreateTodo={(title, dueDate, priority, domain) => {
          mutate((d) => {
            d.todos.unshift({ id: uid(), title, dueDate, priority, domain, done: false });
            syncDailyQuestBoard(d);
          });
          setModal(null);
          notify('To-Do added');
        }}
        onUpdateTodo={(id, title, dueDate, priority, domain) => {
          mutate((d) => {
            const item = d.todos.find((t) => t.id === id);
            if (item) {
              item.title = title;
              item.dueDate = dueDate;
              item.priority = priority;
              item.domain = domain;
              syncDailyQuestBoard(d);
            }
          });
          setModal(null);
          notify('To-Do updated');
        }}
        onCreateReward={(title, minutes, cost) => {
          mutate((d) => {
            d.rewards.push({ id: uid(), title, minutes, cost });
          });
          setModal(null);
          notify('Custom reward created');
        }}
        onSaveAvatar={(avatar) => {
          mutate((d) => {
            d.avatar = avatar;
            addLog(d, 'Customized hero appearance');
          });
          setModal(null);
          notify('Appearance saved');
        }}
        onEquipItem={(itemId) => {
          mutate((d) => equipGear(d, itemId, d.costumeMode));
          playSfx('equip', save.soundEnabled);
          setModal(null);
          notify('Gear equipped');
        }}
        onUnequipSlot={(slot: EquipSlot) => {
          mutate((d) => unequipSlot(d, slot, d.costumeMode));
          setModal(null);
          notify(`${slot} unequipped`);
        }}
        onGoMarket={() => {
          setModal(null);
          setTab('realm');
          setRealmSection('Market');
        }}
        onSwitchClass={(cls) => {
          if (save.level < 10 && save.className !== cls) return;
          mutate((d) => {
            d.classProgress[d.className] = Math.max(d.classProgress[d.className] || 1, d.level);
            d.className = cls;
            addLog(d, `Switched class to ${cls}`);
          });
          setModal(null);
          notify(`Class changed to ${cls}`);
        }}
        onClaimWishPet={(petIndex) => {
          const res = mutate((d) => claimOnboardingWishPet(d, petIndex));
          if (res?.ok && res.pet) {
            playSfx('level', save.soundEnabled);
            setModal(null);
            notify(`Wish granted! ${res.pet.name} joined you (+100 XP · +75 Gold)`);
          }
        }}
        onConfirmResolveDay={() => {
          const summary = mutate((d) => resolveDays(d, today(), true));
          if (summary) {
            playSfx(summary.bossDefeated ? 'level' : 'hit', save.soundEnabled);
            setModal({ type: 'resolution-summary', summary });
          } else {
            setModal(null);
          }
        }}
        onConfirmResetGame={() => {
          localStorage.removeItem(STORE_KEY);
          setSave(null);
          setModal(null);
          setScreen('start');
          notify('Progress deleted');
        }}
      />

      <ToastBanner
        message={toast}
        onUndo={undoSnapshot ? handleUndo : undefined}
        undoLabel={t.undo}
      />
    </div>
  );
}

function HpCrystalIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="arcana-hp" x1="4" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff8b7b" />
          <stop offset="55%" stopColor="#eb4d63" />
          <stop offset="100%" stopColor="#a8263f" />
        </linearGradient>
      </defs>
      <path
        d="M12 20.6L4.2 12.8C2.4 10.9 2.4 7.7 4.4 5.8C6.3 4 9.3 4.1 11.1 6L12 7L12.9 6C14.7 4.1 17.7 4 19.6 5.8C21.6 7.7 21.6 10.9 19.8 12.8L12 20.6Z"
        fill="url(#arcana-hp)"
      />
      <path d="M12 7L12 18.8L5.3 12C4.2 10.8 4.2 8.8 5.4 7.6C6.6 6.4 8.5 6.4 9.8 7.6L12 7Z" fill="white" fillOpacity="0.18" />
    </svg>
  );
}

function ExpStarIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="arcana-exp" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe587" />
          <stop offset="55%" stopColor="#f0b23a" />
          <stop offset="100%" stopColor="#b87314" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5L14.8 9.2L21.5 12L14.8 14.8L12 21.5L9.2 14.8L2.5 12L9.2 9.2L12 2.5Z"
        fill="url(#arcana-exp)"
      />
      <path d="M12 2.5L12 12L2.5 12L9.2 9.2L12 2.5Z" fill="white" fillOpacity="0.22" />
    </svg>
  );
}

function MpDiamondIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="arcana-mp" x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8ce0ff" />
          <stop offset="55%" stopColor="#4c8be0" />
          <stop offset="100%" stopColor="#264b8c" />
        </linearGradient>
      </defs>
      <path d="M12 2.4L19.2 12L12 21.6L4.8 12L12 2.4Z" fill="url(#arcana-mp)" />
      <path d="M12 2.4L12 21.6L4.8 12L12 2.4Z" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

function StatGauge({
  icon,
  label,
  value,
  max,
  barClass,
  valueColor,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  barClass: string;
  valueColor: string;
  subtitle?: string;
}) {
  const pct = Math.max(0, Math.min(100, (100 * value) / Math.max(1, max)));
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-5 w-5 shrink-0 place-items-center">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#111114]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] leading-none">
          <span className={`font-semibold ${valueColor}`}>{label}</span>
          <span className={`font-mono-num font-semibold ${subtitle ? 'text-[#636369]' : valueColor}`}>
            {subtitle ? subtitle : `${value} / ${max}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToastBanner({
  message,
  onUndo,
  undoLabel = 'Undo',
}: {
  message: string;
  onUndo?: () => void;
  undoLabel?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-1/2 z-[70] flex max-w-[92vw] -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/[0.12] bg-[#18181b]/95 px-4 py-2 text-xs font-semibold text-[#f5f5f7] shadow-2xl backdrop-blur-xl lg:bottom-8"
    >
      <span className="truncate">{message}</span>
      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          className="pointer-events-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-bold text-[#111113] transition-colors hover:bg-white"
        >
          <RotateCcw className="h-3 w-3" />
          {undoLabel}
        </button>
      )}
    </div>
  );
}
