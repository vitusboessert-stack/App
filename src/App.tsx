import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Check,
  CheckCircle2,
  ListChecks,
  Menu,
  Minus,
  Pencil,
  Plus,
  Sword,
  Trash2,
} from 'lucide-react';
import {
  STORE_KEY,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
  type HeroSave,
  type RealmSection,
  type TabId,
} from './types/arcana';
import {
  addHabit,
  addLog,
  buyCityBuilding,
  buyCosmetic,
  buyItem,
  buyPetTreats,
  buyQuestItem,
  calcStats,
  claimChallenge,
  claimOnboardingWishPet,
  cloneSave,
  completeHabit,
  completeTodo,
  defaultSave,
  equipGear,
  exportSaveJson,
  feedPet,
  getBossForWins,
  getBossMaxHp,
  getHabitRewardPreview,
  getOnboardingTasks,
  getTodoRewardPreview,
  hatchEgg,
  hydrate,
  isHabitDue,
  joinChallenge,
  loadSave,
  maxHp,
  maxMp,
  migrateV1,
  persistSave,
  recordSlip,
  resolveDays,
  today,
  uid,
  unequipSlot,
  updateHabit,
  useClassSkill,
  activateCosmetic,
  xpNeeded,
  type DayResolutionSummary,
} from './engine/game';
import { playSfx } from './engine/sound';
import { Modals, type ActiveModal } from './components/Modals';
import { OnboardingFlow } from './components/OnboardingFlow';
import { BossSprite, HeroAvatar } from './components/PixelSprite';
import { RealmViews } from './components/RealmViews';

type AppScreen = 'start' | 'onboarding' | 'game';

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
  const [screen, setScreen] = useState<AppScreen>('start');
  const [tab, setTab] = useState<TabId>('habits');
  const [realmSection, setRealmSection] = useState<RealmSection>('');
  const [modal, setModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string>('');
  const toastTimer = useRef<number | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const mutate = <T,>(fn: (draft: HeroSave) => T): T | undefined => {
    if (!save) return undefined;
    const draft = cloneSave(save);
    const result = fn(draft);
    persistSave(draft);
    setSave(draft);
    return result;
  };

  if (screen === 'start' || screen === 'onboarding' || !save) {
    return (
      <>
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
            notify('Your adventure begins!');
          }}
        />
        <ToastBanner message={toast} />
      </>
    );
  }

  const activePet = save.pets.find((p) => p.id === save.activePetId) || null;
  const habitReward = getHabitRewardPreview(save);
  const todoReward = getTodoRewardPreview(save);
  const currentBoss = getBossForWins(save.bossWins);
  const currentBossMax = getBossMaxHp(save.bossWins);
  const heroStats = calcStats(save);
  const dueGoodCount = save.habits.filter((h) => isHabitDue(h) && h.kind === 'good').length;
  const doneGoodCount = save.habits.filter(
    (h) => isHabitDue(h) && h.kind === 'good' && h.doneDates.includes(today())
  ).length;
  const dueHabits = save.habits.filter((h) => isHabitDue(h));
  const onboardingTasks = getOnboardingTasks(save);
  const onboardingDoneCount = onboardingTasks.filter((t) => t.done).length;
  const onboardingAllDone = onboardingDoneCount === onboardingTasks.length;

  const navItems: { id: TabId; label: string; icon: typeof ListChecks }[] = [
    { id: 'habits', label: 'Habits', icon: ListChecks },
    { id: 'todos', label: 'To-Dos', icon: CheckCircle2 },
    { id: 'rewards', label: 'Rewards', icon: Box },
    { id: 'realm', label: 'Realm', icon: Menu },
  ];

  const handleTabSwitch = (nextTab: TabId) => {
    setTab(nextTab);
    setRealmSection('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle =
    tab === 'habits'
      ? 'Habits'
      : tab === 'todos'
        ? 'To-Dos'
        : tab === 'rewards'
          ? 'Rewards'
          : 'Realm';

  const handleQuickAdd = () => {
    if (tab === 'habits') setModal({ type: 'habit-add' });
    else if (tab === 'todos') setModal({ type: 'todo-add' });
    else if (tab === 'rewards') setModal({ type: 'reward-add' });
    else setModal({ type: 'avatar-edit' });
  };

  return (
    <div className="min-h-dvh pb-24 lg:pb-12">
      {/* Desktop Top Navigation */}
      <header className="hidden border-b border-white/[0.07] bg-[#121217]/95 backdrop-blur-md lg:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-8 px-6 py-3.5">
          <button
            type="button"
            onClick={() => handleTabSwitch('habits')}
            className="text-lg font-extrabold tracking-[0.18em] text-[#f5f5f9] whitespace-nowrap shrink-0"
          >
            ARCANA
          </button>

          <nav className="flex items-center gap-7 text-sm font-semibold">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSwitch(item.id)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors ${
                  tab === item.id
                    ? 'border-[#9b7bf0] font-bold text-[#ffffff]'
                    : 'border-transparent text-[#8c8ca1] hover:text-[#f5f5f9]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setModal({ type: 'resolve-preview' })}
            className="min-h-[38px] shrink-0 rounded-xl border border-white/[0.08] bg-[#24242f] px-4 py-1.5 text-xs font-bold text-[#f5f5f9] transition-colors hover:bg-[#2e2e3c] whitespace-nowrap"
          >
            Resolve Day
          </button>
        </div>
      </header>

      {/* Mobile Top Header — Centered Title & Quick Add (hidden on Realm which has its own compact header) */}
      {tab !== 'realm' && (
        <header className="sticky top-0 z-20 flex items-center justify-between bg-[#121217]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="h-10 w-10" aria-hidden="true" />

          <h1 className="text-center text-base font-bold text-[#f5f5f9]">{pageTitle}</h1>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Quick Add"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#1a1a22] text-[#f5f5f9] transition-colors hover:bg-[#24242f]"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>
      )}

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-3 sm:px-6 lg:pt-6">
        {/* Top Profile & HP / EXP / MP Header (shown on Habits, To-Dos, Rewards; hidden on Realm) */}
        {tab !== 'realm' && (
          <section className="rounded-2xl border border-white/[0.08] bg-[#1a1a22] p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setModal({ type: 'avatar-edit' })}
                title="Customize Hero Appearance"
                className="shrink-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121217]"
              >
                <HeroAvatar
                  avatar={save.avatar}
                  className={save.className}
                  equipped={save.equipped}
                  costume={save.costume}
                  costumeMode={save.costumeMode}
                  activeCosmetics={save.activeCosmetics}
                  activePet={activePet}
                  animatePet
                  classNameWrapper="h-28 w-[84px] sm:h-32 sm:w-24"
                />
              </button>

            <div className="min-w-0 flex-1 space-y-2.5">
              {/* HP Row */}
              <StatGauge
                icon={<HpCrystalIcon />}
                label="HP"
                value={save.hp}
                max={maxHp(save.level)}
                valueColor="text-[#f07a7a]"
                barClass="bg-gradient-to-r from-[#e04f64] to-[#ff856d]"
              />
              {/* EXP Row */}
              <StatGauge
                icon={<ExpStarIcon />}
                label="EXP"
                value={save.xp}
                max={xpNeeded(save.level)}
                valueColor="text-[#f0c05e]"
                barClass="bg-gradient-to-r from-[#d98e2b] to-[#f7c552]"
              />
              {/* MP Row */}
              <StatGauge
                icon={<MpDiamondIcon />}
                label="MP"
                value={save.level < 10 ? 0 : save.mp}
                max={maxMp(save.level)}
                subtitle={save.level < 10 ? 'Unlocks at level 10' : undefined}
                valueColor="text-[#77b0f7]"
                barClass="bg-gradient-to-r from-[#4578d4] to-[#6ec3ff]"
              />
            </div>
          </div>

          {/* Bottom Hero Strip (Bold LVL left, Profile & Gold right) */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-white/[0.1] bg-[#24242f] px-3 py-1 font-extrabold tracking-wide text-[#ffffff]">
                LVL {save.level}
              </span>
              <span className="font-bold text-[#f5f5f9]">{save.name}</span>
              <span className="text-[#8c8ca1]">· {save.className}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono-num hidden text-[#8c8ca1] sm:inline">
                STR {heroStats.str} · DEF {heroStats.def} · INT {heroStats.int} · AGI {heroStats.agi}
              </span>
              <span className="font-mono-num rounded-full border border-[#eab949]/25 bg-[#24242f] px-3 py-1 font-bold text-[#eab949]">
                ● {save.gold}
              </span>
            </div>
          </div>
        </section>
        )}

        {/* Active Tab Workspace — Strictly isolated per tab */}
        <main className="min-w-0">
          {tab === 'habits' && (
            <section className="space-y-5">
              <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
                <div aria-hidden="true" />
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-[#f5f5f9]">Habits</h1>
                  <p className="font-mono-num mt-0.5 text-xs text-[#9c9cb0]">
                    {doneGoodCount}/{dueGoodCount} done today
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'habit-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#9b7bf0] px-4 py-2 text-xs font-bold text-[#14111c] transition-colors hover:bg-[#b094f7] whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    New Habit
                  </button>
                </div>
              </div>

              {/* Habit Cards */}
              <div className="space-y-2.5">
                {dueHabits.length > 0 ? (
                  dueHabits.map((h) => {
                    const isGood = h.kind === 'good';
                    const done = h.doneDates.includes(today());
                    const slipped = h.slips.includes(today());

                    return (
                      <div
                        key={h.id}
                        className="flex min-h-[70px] items-stretch overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1a1a22]"
                      >
                        {/* Left Check / Action Square */}
                        <button
                          type="button"
                          disabled={!isGood || done}
                          onClick={() => {
                            if (!isGood) return;
                            const res = mutate((d) => completeHabit(d, h.id));
                            if (res?.ok) {
                              playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
                              notify(
                                res.leveledUp
                                  ? `Level Up! +${res.xp} XP · +${res.gold} Gold`
                                  : `+${res.xp} XP · +${res.gold} Gold`
                              );
                            }
                          }}
                          aria-label={isGood ? `Complete ${h.title}` : h.title}
                          className={`grid w-14 shrink-0 place-items-center transition-colors ${
                            isGood
                              ? done
                                ? 'bg-[#26a66c] text-[#ffffff]'
                                : 'bg-[#23232e] text-[#9c9cb0] hover:bg-[#2b2b38] hover:text-[#ffffff]'
                              : 'cursor-default bg-[#202029] text-[#57576b]'
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
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'habit-edit', habit: h })}
                          className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 text-left transition-colors hover:bg-[#21212c]"
                        >
                          <p
                            className={`text-[15px] ${
                              done ? 'font-bold text-[#ffffff]' : 'font-normal text-[#e8e8f2]'
                            }`}
                          >
                            {h.title}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#9c9cb0]">
                            <span className="truncate">
                              {isGood
                                ? done
                                  ? 'Completed today'
                                  : ''
                                : slipped
                                  ? 'Slip logged today · −5 HP'
                                  : "Don't tap · rewards next login"}
                            </span>
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
                                {isGood ? `+${habitReward.xp} XP · +${habitReward.gold} Gold` : '+12 XP · +3 Gold'}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Right - Action Square (Slip for bad habits, Edit for good habits) */}
                        {isGood ? (
                          <button
                            type="button"
                            onClick={() => setModal({ type: 'habit-edit', habit: h })}
                            aria-label={`Edit ${h.title}`}
                            className="grid w-14 shrink-0 place-items-center bg-[#20202a] text-[#78778c] transition-colors hover:bg-[#2a2a36] hover:text-[#f5f5f9]"
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
                                notify('Slip logged · -5 HP · tomorrow is a fresh start');
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
                  <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#1a1a22] p-8 text-center">
                    <h3 className="text-lg font-bold text-[#f5f5f9]">No habits scheduled here</h3>
                    <p className="mt-1 text-sm text-[#9c9cb0]">
                      Create a good habit to build or a bad habit to break.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'habit-add' })}
                      className="mt-4 min-h-[42px] rounded-xl bg-[#9b7bf0] px-5 py-2 text-xs font-bold text-[#14111c] hover:bg-[#b094f7]"
                    >
                      + Create Habit
                    </button>
                  </div>
                )}
              </div>

              {/* Raid Boss Card — visible ONLY on Habits */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#1a1a22] p-4">
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
                      <p className="text-[11px] font-bold text-[#e3a4a9]">
                        Raid Boss · #{save.bossWins + 1} · {save.damageQueued} DMG queued
                      </p>
                      <p className="truncate text-sm font-bold text-[#f5f5f9]">
                        {currentBoss.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#121217]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#e04f64] to-[#ff856d]"
                            style={{
                              width: `${Math.max(0, Math.min(100, (100 * save.bossHp) / Math.max(1, currentBossMax)))}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono-num text-[11px] text-[#9c9cb0]">
                          {save.bossHp}/{currentBossMax}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModal({ type: 'resolve-preview' })}
                    className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#24242f] px-4 py-2 text-xs font-bold text-[#f5f5f9] transition-colors hover:bg-[#2e2e3c] sm:w-auto"
                  >
                    <Sword className="h-3.5 w-3.5 text-[#9b7bf0]" />
                    End Day & Strike Boss
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === 'todos' && (
            <section className="space-y-5">
              <div className="mb-4 hidden grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
                <div aria-hidden="true" />
                <h1 className="text-center text-2xl font-bold text-[#f5f5f9]">To-Dos</h1>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'todo-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#9b7bf0] px-4 py-2 text-xs font-bold text-[#14111c] hover:bg-[#b094f7] whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    New To-Do
                  </button>
                </div>
              </div>

              {/* Onboarding Tasks (5 tasks -> Pet of Your Wish + XP & Gold) */}
              {!save.onboardingRewardClaimed && (
                <div className="rounded-2xl border border-[#4c4063] bg-[#1e1a29] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#9b7bf0]">Onboarding Quests</p>
                      <h2 className="text-base font-bold text-[#f5f5f9]">
                        Complete 5 tasks for a Wish Pet + 100 XP
                      </h2>
                    </div>
                    <span className="font-mono-num rounded-full bg-[#2b253b] px-3 py-1 text-xs font-bold text-[#e8b84b]">
                      {onboardingDoneCount} / {onboardingTasks.length}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    {onboardingTasks.map((ot) => (
                      <div
                        key={ot.id}
                        className="flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#15131d] pr-3"
                      >
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center ${
                            ot.done ? 'bg-[#26a66c] text-white' : 'bg-[#211e2b] text-[#78778c]'
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 place-items-center rounded-md border ${
                              ot.done ? 'border-white/40 bg-white/20 text-white' : 'border-white/20'
                            }`}
                          >
                            {ot.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 py-2">
                          <p
                            className={`text-sm ${
                              ot.done ? 'font-bold text-[#ffffff]' : 'font-normal text-[#e8e8f2]'
                            }`}
                          >
                            {ot.title}
                          </p>
                          <p className="text-[11px] text-[#9c9cb0]">{ot.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {onboardingAllDone && (
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'wish-pet' })}
                      className="mt-4 min-h-[44px] w-full rounded-xl bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
                    >
                      Claim Your Wish Pet (+100 XP · +75 Gold)
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                {save.todos.length > 0 ? (
                  save.todos.map((t) => (
                    <div
                      key={t.id}
                      className="flex min-h-[70px] items-stretch overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1a1a22]"
                    >
                      <button
                        type="button"
                        disabled={t.done}
                        onClick={() => {
                          const res = mutate((d) => completeTodo(d, t.id));
                          if (res?.ok) {
                            playSfx(res.leveledUp ? 'level' : 'quest', save.soundEnabled);
                            notify(
                              res.leveledUp
                                ? `Level Up! +${res.xp} XP · +${res.gold} Gold`
                                : `To-Do complete · +${res.xp} XP · +${res.gold} Gold`
                            );
                          }
                        }}
                        aria-label={t.done ? `${t.title} completed` : `Complete ${t.title}`}
                        className={`grid w-14 shrink-0 place-items-center transition-colors ${
                          t.done
                            ? 'bg-[#26a66c] text-[#ffffff]'
                            : 'bg-[#23232e] text-[#9c9cb0] hover:bg-[#2b2b38] hover:text-[#ffffff]'
                        }`}
                      >
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors ${
                            t.done
                              ? 'animate-check-pop border-white/40 bg-white/20 text-white'
                              : 'border-white/25 bg-white/[0.04]'
                          }`}
                        >
                          {t.done && <Check className="h-4 w-4 stroke-[3]" />}
                        </span>
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                        <p
                          className={`text-[15px] ${
                            t.done ? 'font-bold text-[#ffffff]' : 'font-normal text-[#e8e8f2]'
                          }`}
                        >
                          {t.title}
                        </p>
                        <p className="mt-1 text-xs text-[#9c9cb0]">
                          {t.done
                            ? 'Completed'
                            : `+${todoReward.xp} XP · +${todoReward.gold} Gold${t.dueDate ? ` · Due ${t.dueDate}` : ''}`}
                        </p>
                      </div>

                      {!t.done && (
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'todo-edit', todo: t })}
                          aria-label={`Edit ${t.title}`}
                          className="grid w-11 shrink-0 place-items-center text-[#8c8ca1] hover:bg-[#24242f] hover:text-[#f5f5f9]"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          mutate((d) => {
                            d.todos = d.todos.filter((x) => x.id !== t.id);
                          })
                        }
                        aria-label={`Delete ${t.title}`}
                        className="grid w-11 shrink-0 place-items-center text-[#8c8ca1] hover:bg-[#2e2028] hover:text-[#e25f5f]"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#1a1a22] p-7 text-center text-sm text-[#9c9cb0]">
                    Your To-Do list is clear. Add your next objective.
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'rewards' && (
            <section className="space-y-5">
              <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
                <div aria-hidden="true" />
                <h1 className="text-center text-2xl font-bold text-[#f4f4f8]">Rewards</h1>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'reward-add' })}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#9b7bf0] px-4 py-2 text-xs font-bold text-[#14111c] hover:bg-[#b094f7] whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Custom Reward
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#1a1a22] p-5">
                <p className="font-mono-num text-3xl font-bold text-[#f5f5f9]">
                  {save.rewardMinutes} minutes
                </p>
                <p className="mt-1 text-xs text-[#9c9cb0]">
                  Available break allowance · manually tracked
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-base font-bold text-[#f5f5f9]">Break Shop</h2>
                <div className="space-y-2.5">
                  {save.rewards.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#1a1a22] p-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#f5f5f9]">{r.title}</p>
                        <p className="font-mono-num mt-0.5 text-xs text-[#9c9cb0]">
                          +{r.minutes} allowance minutes
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
                          notify(`Purchased ${r.title}`);
                        }}
                        className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] hover:bg-[#deb978] disabled:opacity-40 whitespace-nowrap"
                      >
                        {r.cost} Gold
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-base font-bold text-[#f5f5f9]">Log Break Time</h2>
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
                        notify(`Recorded ${min} minutes`);
                      }}
                      className="min-h-[44px] rounded-xl border border-white/[0.06] bg-[#1a1a22] px-3 py-2 text-xs font-bold text-[#f5f5f9] hover:bg-[#24242f] disabled:opacity-40"
                    >
                      Use {min} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#1a1a22] p-4">
                <div>
                  <p className="text-sm font-bold text-[#f5f5f9]">Restriction Planner</p>
                  <p className="mt-0.5 text-xs text-[#9c9cb0]">
                    {save.selectedRestrictions.join(', ') || 'No categories selected'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTab('realm');
                    setRealmSection('Focus');
                  }}
                  className="min-h-[40px] rounded-xl border border-white/[0.08] bg-[#24242f] px-4 py-2 text-xs font-bold text-[#f5f5f9] hover:bg-[#2e2e3c]"
                >
                  Manage
                </button>
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
                  notify(`Hatched ${pet.name} (${pet.rarity})!`);
                }
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
              onOpenGuildCreate={() => setModal({ type: 'guild-create' })}
              onUpgradeBuilding={(id) => {
                if (mutate((d) => buyCityBuilding(d, id))) {
                  playSfx('level', save.soundEnabled);
                  notify('Guild building upgraded!');
                } else {
                  notify('Not enough Guild XP');
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
                if (mutate((d) => buyQuestItem(d, id))) {
                  playSfx('quest', save.soundEnabled);
                  notify('Consumable applied');
                } else {
                  notify('Not enough Gold');
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
              onOpenAddFriend={() => setModal({ type: 'add-friend' })}
              onRemoveFriend={(idx) => {
                mutate((d) => {
                  d.friends.splice(idx, 1);
                });
                notify('Friend removed');
              }}
              onToggleRestriction={(cat, checked) => {
                mutate((d) => {
                  d.selectedRestrictions = checked
                    ? [...new Set([...d.selectedRestrictions, cat])]
                    : d.selectedRestrictions.filter((x) => x !== cat);
                });
              }}
              onOpenRewardsTab={() => handleTabSwitch('rewards')}
              onToggleSound={(enabled) =>
                mutate((d) => {
                  d.soundEnabled = enabled;
                })
              }
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

      {/* Mobile Minimalist Floating Dock Navigation */}
      <nav className="fixed bottom-3 left-3 right-3 z-30 mx-auto max-w-md rounded-full border border-white/[0.08] bg-[#1a1a22]/95 px-2 py-1.5 shadow-2xl backdrop-blur-md lg:hidden">
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
                  active ? 'bg-[#2a2a36] text-[#ffffff]' : 'text-[#7f7e92] hover:text-[#d5d4e2]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
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
        onCreateHabit={(title, kind, rhythm, everyDays, weekdays) => {
          mutate((d) => addHabit(d, title, kind, rhythm, everyDays, weekdays));
          setModal(null);
          notify('Habit added');
        }}
        onUpdateHabit={(id, title, kind, rhythm, everyDays, weekdays) => {
          mutate((d) => updateHabit(d, id, title, kind, rhythm, everyDays, weekdays));
          setModal(null);
          notify('Habit updated');
        }}
        onDeleteHabit={(id) => {
          mutate((d) => {
            d.habits = d.habits.filter((h) => h.id !== id);
          });
          setModal(null);
          notify('Habit removed');
        }}
        onCreateTodo={(title, dueDate) => {
          mutate((d) => {
            d.todos.unshift({ id: uid(), title, dueDate, done: false });
          });
          setModal(null);
          notify('To-Do added');
        }}
        onUpdateTodo={(id, title, dueDate) => {
          mutate((d) => {
            const item = d.todos.find((t) => t.id === id);
            if (item) {
              item.title = title;
              item.dueDate = dueDate;
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
        onAddFriend={(name) => {
          mutate((d) => {
            if (!d.friends.includes(name)) d.friends.push(name);
          });
          setModal(null);
          notify('Friend added to local roster');
        }}
        onCreateGuild={(name) => {
          mutate((d) => {
            d.guild.name = name;
            addLog(d, `Founded guild ${name}`);
          });
          setModal(null);
          notify(`Founded ${name}!`);
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

      <ToastBanner message={toast} />
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
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#101015]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] leading-none">
          <span className={`font-bold ${valueColor}`}>{label}</span>
          <span className={`font-mono-num font-bold ${subtitle ? 'text-[#6c6c80]' : valueColor}`}>
            {subtitle ? subtitle : `${value} / ${max}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToastBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 truncate rounded-full border border-white/[0.12] bg-[#1a1a22]/95 px-5 py-2.5 text-xs font-bold text-[#f5f5f9] shadow-2xl backdrop-blur-md lg:bottom-8"
    >
      {message}
    </div>
  );
}
