import { useEffect, useState, type FormEvent } from 'react';
import { ChevronLeft, Dices } from 'lucide-react';
import {
  AVATAR_DEFAULT,
  AVATAR_OPTIONS,
  CLASS_COLORS,
  CLASS_GLYPHS,
  CLASSES,
  DOMAIN_META,
  getPetRarityStyle,
  ITEMS,
  LIFE_DOMAINS,
  PALETTES,
  PETS,
  PRIORITY_CONFIG,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
  type HabitItem,
  type HabitKind,
  type HabitRhythm,
  type HeroSave,
  type LifeDomain,
  type TaskPriority,
  type TimeOfDay,
  type TodoItem,
} from '../types/arcana';
import {
  calcStats,
  formatPetPerkTags,
  getActivePet,
  getPetPerkEffects,
  getSkillTreeBonuses,
  inferDomain,
  isHabitDue,
  today,
  type DayResolutionSummary,
} from '../engine/game';
import { getDomainLabel, getT, getTimeOfDayLabel } from '../i18n/translations';
import { AvatarAttributeIcon, BossSprite, GearIcon, HeroAvatar, PetSprite } from './PixelSprite';

export type ActiveModal =
  | { type: 'habit-add' }
  | { type: 'habit-edit'; habit: HabitItem }
  | { type: 'todo-add' }
  | { type: 'todo-edit'; todo: TodoItem }
  | { type: 'reward-add' }
  | { type: 'avatar-edit' }
  | { type: 'equip-select'; slot: EquipSlot }
  | { type: 'class-switch' }
  | { type: 'wish-pet' }
  | { type: 'resolve-preview' }
  | { type: 'resolution-summary'; summary: DayResolutionSummary }
  | { type: 'confirm-reset' }
  | null;

interface ModalsProps {
  modal: ActiveModal;
  save: HeroSave;
  onClose: () => void;
  onCreateHabit: (
    title: string,
    kind: HabitKind,
    rhythm: HabitRhythm,
    everyDays: number,
    weekdays: number[],
    priority: TaskPriority,
    domain: LifeDomain,
    timeOfDay: TimeOfDay
  ) => void;
  onUpdateHabit: (
    id: string,
    title: string,
    kind: HabitKind,
    rhythm: HabitRhythm,
    everyDays: number,
    weekdays: number[],
    priority: TaskPriority,
    domain: LifeDomain,
    timeOfDay: TimeOfDay
  ) => void;
  onDeleteHabit: (id: string) => void;
  onCreateTodo: (title: string, dueDate: string, priority: TaskPriority, domain: LifeDomain) => void;
  onUpdateTodo: (id: string, title: string, dueDate: string, priority: TaskPriority, domain: LifeDomain) => void;
  onCreateReward: (title: string, minutes: number, cost: number) => void;
  onSaveAvatar: (avatar: AvatarConfig) => void;
  onEquipItem: (itemId: string) => void;
  onUnequipSlot: (slot: EquipSlot) => void;
  onGoMarket: () => void;
  onSwitchClass: (cls: ClassName) => void;
  onClaimWishPet: (petIndex: number) => void;
  onConfirmResolveDay: () => void;
  onConfirmResetGame: () => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Modals(props: ModalsProps) {
  const { modal, save, onClose } = props;
  if (!modal) return null;
  const lang = save.language || 'en';
  const t = getT(lang);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="arcana-scroll max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#18181b] p-5 shadow-2xl sm:p-6"
      >
        {modal.type === 'habit-add' && (
          <HabitFormModal
            lang={lang}
            titleText={t.newHabit}
            submitLabel={lang === 'de' ? 'Gewohnheit erstellen' : 'Create Habit'}
            onClose={onClose}
            onSubmit={(title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay) =>
              props.onCreateHabit(title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay)
            }
          />
        )}

        {modal.type === 'habit-edit' && (
          <HabitFormModal
            lang={lang}
            titleText={lang === 'de' ? 'Gewohnheit bearbeiten' : 'Edit Habit'}
            submitLabel={t.saveChanges}
            initialHabit={modal.habit}
            onClose={onClose}
            onDelete={() => props.onDeleteHabit(modal.habit.id)}
            onSubmit={(title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay) =>
              props.onUpdateHabit(modal.habit.id, title, kind, rhythm, everyDays, weekdays, priority, domain, timeOfDay)
            }
          />
        )}

        {modal.type === 'todo-add' && (
          <TodoFormModal
            lang={lang}
            titleText={t.newTodo}
            submitLabel={lang === 'de' ? 'Aufgabe hinzufügen' : 'Add To-Do'}
            onClose={onClose}
            onSubmit={props.onCreateTodo}
          />
        )}

        {modal.type === 'todo-edit' && (
          <TodoFormModal
            lang={lang}
            titleText={lang === 'de' ? 'Aufgabe bearbeiten' : 'Edit To-Do'}
            submitLabel={t.saveChanges}
            initialTodo={modal.todo}
            onClose={onClose}
            onSubmit={(title, due, priority, domain) =>
              props.onUpdateTodo(modal.todo.id, title, due, priority, domain)
            }
          />
        )}

        {modal.type === 'reward-add' && <RewardFormModal lang={lang} onClose={onClose} onSubmit={props.onCreateReward} />}

        {modal.type === 'avatar-edit' && (
          <AvatarEditModal save={save} onClose={onClose} onSave={props.onSaveAvatar} />
        )}

        {modal.type === 'equip-select' && (
          <EquipSelectModal
            save={save}
            slot={modal.slot}
            onClose={onClose}
            onEquip={props.onEquipItem}
            onUnequip={() => props.onUnequipSlot(modal.slot)}
            onGoMarket={props.onGoMarket}
          />
        )}

        {modal.type === 'class-switch' && (
          <ClassSwitchModal save={save} onClose={onClose} onSwitch={props.onSwitchClass} />
        )}

        {modal.type === 'wish-pet' && (
          <WishPetModal onClose={onClose} onClaim={props.onClaimWishPet} />
        )}

        {modal.type === 'resolve-preview' && (
          <ResolvePreviewModal save={save} onClose={onClose} onConfirm={props.onConfirmResolveDay} />
        )}

        {modal.type === 'resolution-summary' && (
          <ResolutionSummaryModal lang={lang} summary={modal.summary} onClose={onClose} />
        )}

        {modal.type === 'confirm-reset' && (
          <div>
            <ModalHeader title={t.resetProgress} onClose={onClose} />
            <p className="text-sm leading-relaxed text-[#8e8e93]">
              {lang === 'de'
                ? 'Dadurch werden Held, Gewohnheiten, Pets, Ausrüstung und Hausdaten dauerhaft aus diesem Browser gelöscht. Erstelle bei Bedarf vorher ein JSON-Backup.'
                : 'This permanently deletes your current hero, habits, pets, gear, and sanctuary data from this browser. Consider exporting a JSON backup first.'}
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] rounded-full border border-white/[0.08] bg-[#202024] px-5 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={props.onConfirmResetGame}
                className="min-h-[40px] rounded-full bg-[#ff453a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#ff5b52]"
              >
                {lang === 'de' ? 'Spielstand löschen' : 'Delete Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-3">
      <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#f5f5f7]">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-[#202024] text-lg text-[#8e8e93] hover:bg-[#2a2a30] hover:text-[#f5f5f7]"
      >
        ×
      </button>
    </div>
  );
}

function HabitFormModal({
  lang,
  titleText,
  submitLabel,
  initialHabit,
  onClose,
  onDelete,
  onSubmit,
}: {
  lang: 'en' | 'de';
  titleText: string;
  submitLabel: string;
  initialHabit?: HabitItem;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (
    title: string,
    kind: HabitKind,
    rhythm: HabitRhythm,
    everyDays: number,
    weekdays: number[],
    priority: TaskPriority,
    domain: LifeDomain,
    timeOfDay: TimeOfDay
  ) => void;
}) {
  const t = getT(lang);
  const [title, setTitle] = useState(initialHabit?.title || '');
  const [kind, setKind] = useState<HabitKind>(initialHabit?.kind || 'good');
  const [rhythm, setRhythm] = useState<HabitRhythm>(initialHabit?.rhythm || 'daily');
  const [everyDays, setEveryDays] = useState(initialHabit?.everyDays || 3);
  const [weekdays, setWeekdays] = useState<number[]>(
    initialHabit?.weekdays?.length ? initialHabit.weekdays : [1, 2, 3, 4, 5]
  );
  const [priority, setPriority] = useState<TaskPriority>(initialHabit?.priority || 'B');
  const [domain, setDomain] = useState<LifeDomain>(
    initialHabit?.domain || inferDomain(initialHabit?.title || '')
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialHabit?.timeOfDay || 'any');
  const [domainManual, setDomainManual] = useState(Boolean(initialHabit?.domain));
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'de' ? 'Bitte einen Namen eingeben.' : 'Please enter a habit name.');
      return;
    }
    if (rhythm === 'weekdays' && weekdays.length === 0) {
      setError(lang === 'de' ? 'Mindestens einen Wochentag wählen.' : 'Select at least one weekday.');
      return;
    }
    onSubmit(
      title.trim(),
      kind,
      rhythm,
      Math.max(2, Math.min(7, everyDays)),
      weekdays,
      priority,
      domain,
      timeOfDay
    );
  };

  const toggleDay = (d: number) => {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  return (
    <div>
      <ModalHeader title={titleText} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#d1d1d6]">
            {lang === 'de' ? 'Name der Gewohnheit' : 'Habit Name'}
          </label>
          <input
            type="text"
            maxLength={70}
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (!domainManual) setDomain(inferDomain(v));
            }}
            placeholder={lang === 'de' ? 'z. B. 10 Seiten lesen' : 'e.g. Read 10 pages'}
            required
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Quest-Typ' : 'Quest Type'}
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as HabitKind)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
            >
              <option value="good">{lang === 'de' ? 'Gute Gewohnheit aufbauen' : 'Build a good habit'}</option>
              <option value="bad">{lang === 'de' ? 'Schlechte Gewohnheit ablegen' : 'Break a bad habit'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Häufigkeit' : 'Frequency'}
            </label>
            <select
              value={rhythm}
              onChange={(e) => setRhythm(e.target.value as HabitRhythm)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
            >
              <option value="daily">{lang === 'de' ? 'Jeden Tag' : 'Every day'}</option>
              <option value="every">{lang === 'de' ? 'Alle N Tage' : 'Every N days'}</option>
              <option value="monthly">{lang === 'de' ? 'Monatlich' : 'Monthly'}</option>
              <option value="weekdays">{lang === 'de' ? 'Bestimmte Wochentage' : 'Custom weekdays'}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#d1d1d6]">
            {lang === 'de' ? 'Tageszeit (Routine-Combo bei ≥2 Quests)' : 'Time of Day (Routine Combo at ≥2 quests)'}
          </label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {(['morning', 'day', 'evening', 'any'] as const).map((slot) => {
              const active = timeOfDay === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeOfDay(slot)}
                  className={`min-h-[40px] rounded-xl border text-xs font-semibold transition-colors ${
                    active
                      ? 'border-white/40 bg-[#f5f5f7] text-[#111113]'
                      : 'border-white/[0.08] bg-[#202024] text-[#8e8e93] hover:text-[#f5f5f7]'
                  }`}
                >
                  {getTimeOfDayLabel(slot, lang)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Priorität (XP & Boss-DMG)' : 'Priority Grade (Scales XP & Boss DMG)'}
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      borderColor: active ? cfg.color : 'rgba(255,255,255,0.08)',
                      backgroundColor: active ? cfg.bg : '#202024',
                      color: active ? cfg.color : '#8e8e93',
                    }}
                    className="min-h-[42px] rounded-xl border text-xs font-semibold transition-colors"
                  >
                    {p} · {cfg.xpMult}x
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Lebensbereich (Talentbaum)' : 'Life Domain (Skill Tree)'}
            </label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value as LifeDomain);
                setDomainManual(true);
              }}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
            >
              {LIFE_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {getDomainLabel(d, lang)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#8e8e93]">{DOMAIN_META[domain].desc}</p>
          </div>
        </div>

        {rhythm === 'every' && (
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Alle N Tage wiederholen (2–7)' : 'Repeat every N days (2–7)'}
            </label>
            <input
              type="number"
              min={2}
              max={7}
              value={everyDays}
              onChange={(e) => setEveryDays(Number(e.target.value) || 2)}
              className="mt-1.5 min-h-[44px] w-32 rounded-xl border border-white/[0.1] bg-[#111114] px-3 py-2 text-sm text-[#f5f5f7]"
            />
          </div>
        )}

        {rhythm === 'weekdays' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Aktive Wochentage' : 'Active Weekdays'}
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {WEEKDAY_NAMES.map((day, idx) => {
                const active = weekdays.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`min-h-[40px] rounded-lg border text-xs font-semibold transition-colors ${
                      active
                        ? 'border-white/40 bg-[#f5f5f7] text-[#111113]'
                        : 'border-white/[0.08] bg-[#202024] text-[#8e8e93]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-[#ff6961]">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[42px] rounded-full bg-[#ff453a]/15 px-4 py-2 text-xs font-semibold text-[#ff6961] hover:bg-[#ff453a]/25"
            >
              {t.deleteHabit}
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="min-h-[42px] rounded-full bg-[#f5f5f7] px-6 py-2 text-xs font-semibold text-[#111113] hover:bg-white"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function TodoFormModal({
  lang,
  titleText,
  submitLabel,
  initialTodo,
  onClose,
  onSubmit,
}: {
  lang: 'en' | 'de';
  titleText: string;
  submitLabel: string;
  initialTodo?: TodoItem;
  onClose: () => void;
  onSubmit: (title: string, dueDate: string, priority: TaskPriority, domain: LifeDomain) => void;
}) {
  const [title, setTitle] = useState(initialTodo?.title || '');
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTodo?.priority || 'B');
  const [domain, setDomain] = useState<LifeDomain>(
    initialTodo?.domain || inferDomain(initialTodo?.title || '')
  );
  const [domainManual, setDomainManual] = useState(Boolean(initialTodo?.domain));

  return (
    <div>
      <ModalHeader title={titleText} onClose={onClose} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) onSubmit(title.trim(), dueDate, priority, domain);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-[#d1d1d6]">
            {lang === 'de' ? 'Aufgabentitel' : 'Quest Name'}
          </label>
          <input
            type="text"
            maxLength={90}
            required
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (!domainManual) setDomain(inferDomain(v));
            }}
            placeholder={lang === 'de' ? 'Ein Ziel, das du abschließen möchtest' : 'One objective you want to finish'}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Priorität' : 'Priority Grade'}
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      borderColor: active ? cfg.color : 'rgba(255,255,255,0.08)',
                      backgroundColor: active ? cfg.bg : '#202024',
                      color: active ? cfg.color : '#8e8e93',
                    }}
                    className="min-h-[42px] rounded-xl border text-xs font-semibold transition-colors"
                  >
                    {p} · {cfg.xpMult}x
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Lebensbereich' : 'Life Domain'}
            </label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value as LifeDomain);
                setDomainManual(true);
              }}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
            >
              {LIFE_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {getDomainLabel(d, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#d1d1d6]">
            {lang === 'de' ? 'Fälligkeitsdatum (Optional)' : 'Due Date (Optional)'}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-semibold text-[#111113] hover:bg-white"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}

function RewardFormModal({
  lang,
  onClose,
  onSubmit,
}: {
  lang: 'en' | 'de';
  onClose: () => void;
  onSubmit: (title: string, minutes: number, cost: number) => void;
}) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [cost, setCost] = useState(35);

  return (
    <div>
      <ModalHeader title={lang === 'de' ? 'Eigene Belohnung erstellen' : 'Create Custom Reward'} onClose={onClose} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim() && minutes >= 1 && cost >= 1) {
            onSubmit(title.trim(), minutes, cost);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-[#d1d1d6]">
            {lang === 'de' ? 'Belohnung' : 'Reward Name'}
          </label>
          <input
            type="text"
            maxLength={60}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lang === 'de' ? 'z. B. Gaming-Pause' : 'e.g. Gaming break'}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Minuten' : 'Minutes'}
            </label>
            <input
              type="number"
              min={1}
              max={180}
              required
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || 1)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d1d1d6]">
              {lang === 'de' ? 'Gold-Kosten' : 'Gold Cost'}
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              required
              value={cost}
              onChange={(e) => setCost(Number(e.target.value) || 1)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/[0.1] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-semibold text-[#111113] hover:bg-white"
        >
          {lang === 'de' ? 'Belohnung erstellen' : 'Create Reward'}
        </button>
      </form>
    </div>
  );
}

const GRID_ATTRIBUTES: { key: keyof AvatarConfig; label: string; isSwatch?: boolean }[] = [
  { key: 'top', label: 'Shirt' },
  { key: 'skin', label: 'Skin' },
  { key: 'hairColor', label: 'Hair Color', isSwatch: true },
  { key: 'hair', label: 'Hair Style' },
  { key: 'eyes', label: 'Eye Style' },
  { key: 'eyeColor', label: 'Eye Color', isSwatch: true },
  { key: 'pants', label: 'Pants' },
  { key: 'glasses', label: 'Eyewear' },
  { key: 'accessory', label: 'Extras' },
  { key: 'bg', label: 'Background' },
];

function getGridSwatchHex(key: keyof AvatarConfig, idx: number): string {
  if (key === 'skin') return PALETTES.skin[idx % PALETTES.skin.length];
  if (key === 'hairColor') return PALETTES.hair[idx % PALETTES.hair.length];
  if (key === 'eyeColor') return PALETTES.eye[idx % PALETTES.eye.length];
  return '#666';
}

function AvatarEditModal({
  save,
  onClose,
  onSave,
}: {
  save: HeroSave;
  onClose: () => void;
  onSave: (avatar: AvatarConfig) => void;
}) {
  const [draft, setDraft] = useState<AvatarConfig>({ ...AVATAR_DEFAULT, ...save.avatar });
  const [selectedAttr, setSelectedAttr] = useState<keyof AvatarConfig | null>(null);
  const [previewGear, setPreviewGear] = useState(true);

  const handleRandomize = () => {
    const next: AvatarConfig = { ...draft };
    (Object.keys(AVATAR_OPTIONS) as (keyof AvatarConfig)[]).forEach((k) => {
      next[k] = Math.floor(Math.random() * AVATAR_OPTIONS[k].length);
    });
    setDraft(next);
  };

  const activeAttrMeta = selectedAttr ? GRID_ATTRIBUTES.find((a) => a.key === selectedAttr) : null;

  return (
    <div>
      {/* Top Bar: Back Button + Randomize */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (selectedAttr) setSelectedAttr(null);
            else onClose();
          }}
          aria-label={selectedAttr ? 'Back to attribute grid' : 'Close'}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-[#222229] text-[#f5f5f7] transition-colors hover:bg-[#2c2b35]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h2 className="text-sm font-semibold text-[#f5f5f7]">
          {activeAttrMeta ? activeAttrMeta.label : 'Avatar Customization'}
        </h2>

        <button
          type="button"
          onClick={handleRandomize}
          aria-label="Randomize avatar"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#222229] px-3.5 text-xs font-semibold text-[#f5f5f7] transition-colors hover:bg-[#2c2b35]"
        >
          <Dices className="h-4 w-4 text-[#9b7bf0]" />
          <span className="hidden sm:inline">Random</span>
        </button>
      </div>

      {/* Centered Hero Preview Card */}
      <div className="flex justify-center">
        <HeroAvatar
          avatar={draft}
          className={save.className}
          equipped={save.equipped}
          costume={save.costume}
          costumeMode={save.costumeMode}
          activeCosmetics={save.activeCosmetics}
          showGear={previewGear}
          classNameWrapper="h-36 w-36 rounded-2xl border border-white/[0.12] shadow-2xl"
        />
      </div>

      {/* Dark Rounded Grid Panel */}
      <div className="mt-5 rounded-[26px] border border-white/[0.07] bg-[#1f1e26] p-4">
        {!selectedAttr ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#f5f5f7]">Appearance</span>
              <div className="inline-flex rounded-full bg-[#15141a] p-1">
                <button
                  type="button"
                  onClick={() => setPreviewGear(true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    previewGear ? 'bg-[#363540] text-white' : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  Gear
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewGear(false)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    !previewGear ? 'bg-[#363540] text-white' : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  Base
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {GRID_ATTRIBUTES.map((attr) => (
                <button
                  key={attr.key}
                  type="button"
                  onClick={() => setSelectedAttr(attr.key)}
                  className="group flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.05] bg-[#2a2933] p-2 transition-colors group-hover:border-white/20 group-hover:bg-[#33323e]">
                    <AvatarAttributeIcon
                      attrKey={attr.key}
                      value={draft[attr.key]}
                      avatar={draft}
                    />
                  </div>
                  <span className="w-full truncate text-[11px] font-medium text-[#d1d1d6]">
                    {attr.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedAttr(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#b996ff] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                All Attributes
              </button>
              <span className="truncate text-xs font-medium text-[#8e8e93]">
                {AVATAR_OPTIONS[selectedAttr][draft[selectedAttr]]}
              </span>
            </div>

            <div className="arcana-scroll grid max-h-[260px] grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4">
              {AVATAR_OPTIONS[selectedAttr].map((optLabel, idx) => {
                const isSelected = draft[selectedAttr] === idx;
                return (
                  <button
                    key={optLabel}
                    type="button"
                    onClick={() => setDraft({ ...draft, [selectedAttr]: idx })}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-all ${
                      isSelected
                        ? 'bg-[#352b52] ring-2 ring-[#9b7bf0]'
                        : 'bg-[#2a2933] hover:bg-[#33323e]'
                    }`}
                  >
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#18171e] p-1.5">
                      {activeAttrMeta?.isSwatch ? (
                        <span
                          className="h-9 w-9 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: getGridSwatchHex(selectedAttr, idx) }}
                        />
                      ) : (
                        <AvatarAttributeIcon
                          attrKey={selectedAttr}
                          value={idx}
                          avatar={draft}
                        />
                      )}
                    </div>
                    <span className="w-full truncate text-center text-[10px] font-medium text-[#e4e4ec]">
                      {optLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[42px] rounded-full border border-white/[0.08] bg-[#202024] px-5 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="min-h-[42px] rounded-full bg-[#f5f5f7] px-6 py-2 text-xs font-semibold text-[#111113] hover:bg-white"
        >
          Save Appearance
        </button>
      </div>
    </div>
  );
}

function EquipSelectModal({
  save,
  slot,
  onClose,
  onEquip,
  onUnequip,
  onGoMarket,
}: {
  save: HeroSave;
  slot: EquipSlot;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUnequip: () => void;
  onGoMarket: () => void;
}) {
  const activeId = (save.costumeMode ? save.costume : save.equipped)[slot];
  const candidates = save.owned
    .map((id) => ITEMS.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i && i.slot === slot));

  return (
    <div>
      <ModalHeader title={`${save.costumeMode ? 'Vanity ' : ''}${slot} Slot`} onClose={onClose} />
      <div className="space-y-2.5">
        {candidates.length > 0 ? (
          candidates.map((item) => {
            const isEquipped = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onEquip(item.id)}
                className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors ${
                  isEquipped
                    ? 'border-white/30 bg-[#27272c]'
                    : 'border-white/[0.07] bg-[#202024] hover:bg-[#27272c]'
                }`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-[#111114] p-1">
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#f5f5f7]">{item.name}</p>
                  <p className="font-mono-num mt-0.5 text-xs text-[#8e8e93]">
                    {Object.entries(item.stats)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#f5f5f7]">
                  {isEquipped ? 'Equipped' : 'Equip ›'}
                </span>
              </button>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-white/[0.1] p-5 text-center text-sm text-[#8e8e93]">
            You do not own any {slot.toLowerCase()} gear yet. Visit the Market to buy equipment.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {activeId && (
          <button
            type="button"
            onClick={onUnequip}
            className="min-h-[42px] flex-1 rounded-full border border-white/[0.08] bg-[#202024] px-4 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
          >
            Unequip Slot
          </button>
        )}
        <button
          type="button"
          onClick={onGoMarket}
          className="min-h-[42px] flex-1 rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#111113] hover:bg-white"
        >
          Visit Market
        </button>
      </div>
    </div>
  );
}

function ClassSwitchModal({
  save,
  onClose,
  onSwitch,
}: {
  save: HeroSave;
  onClose: () => void;
  onSwitch: (cls: ClassName) => void;
}) {
  const locked = save.level < 10;
  return (
    <div>
      <ModalHeader title="Combat Classes" onClose={onClose} />
      <p className="mb-4 text-sm text-[#8e8e93]">
        {locked
          ? 'Switching classes unlocks at Level 10. Reach Level 10 through daily quests to freely change your path.'
          : 'Switch classes freely. Your customized pixel appearance and equipment stay intact.'}
      </p>
      <div className="space-y-2">
        {CLASSES.map((c) => {
          const active = save.className === c;
          return (
            <button
              key={c}
              type="button"
              disabled={locked && !active}
              onClick={() => onSwitch(c)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                active
                  ? 'border-white/30 bg-[#27272c]'
                  : 'border-white/[0.07] bg-[#202024] hover:bg-[#27272c] disabled:opacity-45'
              }`}
            >
              <span className="text-2xl" style={{ color: CLASS_COLORS[c] }}>
                {CLASS_GLYPHS[c]}
              </span>
              <span className="flex-1 font-semibold text-[#f5f5f7]">{c}</span>
              <span className="text-xs font-semibold text-[#d1d1d6]">
                {active ? 'Current' : locked ? 'Lvl 10' : 'Switch'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WishPetModal({
  onClose,
  onClaim,
}: {
  onClose: () => void;
  onClaim: (petIndex: number) => void;
}) {
  const [selected, setSelected] = useState(4); // Moon Fox default
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const visiblePets = PETS.map((pet, idx) => ({ pet, idx })).filter(
    ({ pet }) => rarityFilter === 'All' || pet.rarity === rarityFilter
  );

  return (
    <div>
      <ModalHeader title="Choose Your Wish Pet" onClose={onClose} />
      <p className="text-sm text-[#8e8e93]">
        You completed all 5 Onboarding Quests! Pick any companion below to join your hero immediately, plus <span className="font-semibold text-[#e8b84b]">+100 XP &amp; +75 Gold</span>.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {rarities.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRarityFilter(r)}
            className={`min-h-[30px] rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              rarityFilter === r
                ? 'bg-[#f5f5f7] text-[#111113]'
                : 'border border-white/[0.08] bg-[#202024] text-[#8e8e93] hover:bg-[#2a2a30]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="arcana-scroll mt-3 grid max-h-[48vh] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
        {visiblePets.map(({ pet, idx }) => {
          const active = selected === idx;
          const rarityStyle = getPetRarityStyle(pet.rarity);
          const perkTags = formatPetPerkTags(getPetPerkEffects({ sprite: pet.sprite, level: 1 }));
          return (
            <button
              key={pet.name}
              type="button"
              onClick={() => setSelected(idx)}
              style={{
                borderColor: active ? '#f5f5f7' : rarityStyle.cardBorder,
                boxShadow: rarityStyle.cardGlow,
              }}
              className={`flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
                active ? 'bg-[#27272c]' : 'bg-[#202024] hover:bg-[#27272c]'
              }`}
            >
              <PetSprite pet={pet} rarity={pet.rarity} className="h-12 w-12" />
              <span
                style={{
                  color: rarityStyle.hex,
                  backgroundColor: rarityStyle.tagBg,
                  borderColor: rarityStyle.tagBorder,
                }}
                className="mt-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold"
              >
                {pet.name}
              </span>
              <p className="mt-1 text-[11px] font-semibold" style={{ color: rarityStyle.hex }}>
                {pet.rarity}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[#8e8e93]">
                {perkTags.join(' · ')}
              </p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onClaim(selected)}
        className="mt-4 min-h-[44px] w-full rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-semibold text-[#111113] hover:bg-white"
      >
        Claim {PETS[selected].name} (+100 XP · +75 Gold)
      </button>
    </div>
  );
}

function ResolvePreviewModal({
  save,
  onClose,
  onConfirm,
}: {
  save: HeroSave;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const lang = save.language || 'en';
  const t = getT(lang);
  const d = today();
  const missed = save.habits.filter((h) => h.kind === 'good' && isHabitDue(h, d) && !h.doneDates.includes(d));
  const cleanBad = save.habits.filter((h) => h.kind === 'bad' && isHabitDue(h, d) && !h.slips.includes(d));
  const st = calcStats(save);
  const petPerk = getPetPerkEffects(getActivePet(save));
  const skillB = getSkillTreeBonuses(save);
  const totalBlock = save.protection + petPerk.rolloverBlock + skillB.rolloverBlock;
  const perMiss = Math.max(1, 3 - Math.floor(st.def / 5));
  const incomingDmg = Math.max(0, missed.length * perMiss - totalBlock);

  return (
    <div>
      <ModalHeader title={lang === 'de' ? 'Tag abschließen & Kampf auswerten' : 'End Day & Resolve Battle'} onClose={onClose} />
      <p className="text-sm text-[#8e8e93]">
        {lang === 'de'
          ? 'Beim Tagesabschluss greift dein Held den Raid-Boss an, erhält XP für gemiedene schlechte Gewohnheiten und verrechnet offene Quests.'
          : 'Resolving the day strikes the Raid Boss with your queued damage, grants XP for resisted bad habits, and applies any missed-habit penalties.'}
      </p>

      <div className="mt-4 space-y-2.5 rounded-xl border border-white/[0.07] bg-[#111114] p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[#8e8e93]">{lang === 'de' ? 'Boss-Schaden bereit' : 'Queued Boss Damage'}</span>
          <span className="font-mono-num font-semibold text-[#e8b84b]">{save.damageQueued} DMG</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8e8e93]">{lang === 'de' ? 'Standhaft geblieben' : 'Resisted Bad Habits'} ({cleanBad.length})</span>
          <span className="font-mono-num font-semibold text-[#30d158]">
            +{cleanBad.length * 12} XP · +{cleanBad.length * 3} Gold
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8e8e93]">{lang === 'de' ? 'Offene gute Gewohnheiten' : 'Unfinished Good Habits'} ({missed.length})</span>
          <span className={`font-mono-num font-semibold ${incomingDmg > 0 ? 'text-[#ff6961]' : 'text-[#30d158]'}`}>
            {`-${incomingDmg} HP ${totalBlock > 0 ? `(${totalBlock} blocked)` : ''}`}
          </span>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[42px] rounded-full border border-white/[0.08] bg-[#202024] px-5 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
        >
          {t.keepQuesting}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-[42px] rounded-full bg-[#f5f5f7] px-6 py-2 text-xs font-semibold text-[#111113] hover:bg-white"
        >
          {t.resolveStrikeBtn}
        </button>
      </div>
    </div>
  );
}

function ResolutionSummaryModal({
  lang,
  summary,
  onClose,
}: {
  lang: 'en' | 'de';
  summary: DayResolutionSummary;
  onClose: () => void;
}) {
  const t = getT(lang);
  const [animatedHp, setAnimatedHp] = useState(summary.bossHpBefore);

  useEffect(() => {
    setAnimatedHp(summary.bossHpBefore);
    const timer = window.setTimeout(() => {
      setAnimatedHp(summary.bossHpAfter);
    }, 140);
    return () => window.clearTimeout(timer);
  }, [summary]);

  const bossMax = Math.max(1, summary.bossMaxHpBefore);
  const hpPct = Math.max(0, Math.min(100, (100 * animatedHp) / bossMax));

  return (
    <div>
      <ModalHeader title={lang === 'de' ? 'Tages- & Kampfbericht' : 'Battle & Day Summary'} onClose={onClose} />
      <div className="space-y-3 text-sm">
        {(summary.damageDealt > 0 || summary.bossDefeated) && (
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114] p-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative grid h-24 w-28 shrink-0 place-items-center">
                <BossSprite
                  wins={summary.bossWinsBefore}
                  className={`h-full w-full ${summary.damageDealt > 0 ? 'animate-boss-hit' : ''}`}
                />
                {summary.damageDealt > 0 && (
                  <>
                    <svg
                      viewBox="0 0 64 64"
                      className="animate-slash-sweep pointer-events-none absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 50 L54 12 L48 10 L14 42 Z"
                        fill="#fde047"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="animate-damage-float font-mono-num pointer-events-none absolute top-0 right-0 rounded-full bg-[#ff453a] px-2 py-0.5 text-xs font-extrabold text-white shadow-lg">
                      −{summary.damageDealt}
                    </span>
                  </>
                )}
              </div>

              <div className="w-full flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold tracking-wide text-[#f5f5f7]">
                    {summary.bossNameBefore}
                  </p>
                  <span className="font-mono-num text-xs font-semibold text-[#e8b84b]">
                    {animatedHp} / {summary.bossMaxHpBefore} HP
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#202024]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff453a] to-[#ff6961] transition-all duration-700 ease-out"
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#8e8e93]">
                  {summary.bossDefeated
                    ? lang === 'de'
                      ? 'Volltreffer! Der Boss wurde bezwungen.'
                      : 'Direct strike! Boss vanquished.'
                    : lang === 'de'
                      ? `Du hast ${summary.damageDealt} Schaden verursacht.`
                      : `Your quests landed ${summary.damageDealt} damage.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {summary.bossDefeated && (
          <div className="rounded-xl border border-[#e5be6b]/45 bg-[#292214] p-4 text-[#fff3d6]">
            <p className="text-base font-semibold text-[#e8b84b]">
              {lang === 'de' ? `Sieg! ${summary.bossDefeated} besiegt` : `Victory! ${summary.bossDefeated} Vanquished`}
            </p>
            <p className="mt-1 text-xs">
              {lang === 'de'
                ? 'Erhalten: +65 XP, +55 Gold und +1 Pet-Ei.'
                : 'Earned +65 XP, +55 Gold, and +1 Pet Egg.'}
            </p>
          </div>
        )}

        {summary.milestoneChestLoot && (
          <div className="rounded-xl border border-[#a78bfa]/45 bg-[#211b2e] p-4 text-[#ede9fe]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#c4b5fd]">
              {lang === 'de' ? 'Boss-Meilenstein-Truhe!' : 'Boss Milestone Chest!'}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {summary.milestoneChestLoot}
            </p>
          </div>
        )}

        {summary.fainted && (
          <div className="rounded-xl border border-[#ff453a]/45 bg-[#2b1719] p-4 text-[#ffe3e8]">
            <p className="font-semibold">{lang === 'de' ? 'Vor Erschöpfung zusammengebrochen' : 'Collapsed from Exhaustion'}</p>
            <p className="mt-1 text-xs">
              {lang === 'de'
                ? 'Du wurdest im Lager mit vollen HP wiederbelebt (bis zu 15 Gold verloren).'
                : 'You were revived at camp with full HP (lost up to 15 Gold). Tomorrow is a fresh start.'}
            </p>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-white/[0.07] bg-[#111114] p-4">
          <div className="flex justify-between">
            <span className="text-[#8e8e93]">{lang === 'de' ? 'Ausgewertete Tage' : 'Days Resolved'}</span>
            <span className="font-mono-num font-semibold text-[#f5f5f7]">{summary.daysProcessed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8e93]">{lang === 'de' ? 'Boss-Schaden' : 'Boss Damage Dealt'}</span>
            <span className="font-mono-num font-semibold text-[#e8b84b]">{summary.damageDealt} DMG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8e93]">{lang === 'de' ? 'HP-Verlust' : 'HP Lost to Missed Quests'}</span>
            <span className="font-mono-num font-semibold text-[#ff6961]">{summary.damageTaken} HP</span>
          </div>
          {summary.cleanXpEarned > 0 && (
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">{lang === 'de' ? 'XP (Standhaftigkeit)' : 'Resisted Bad Habits XP'}</span>
              <span className="font-mono-num font-semibold text-[#30d158]">+{summary.cleanXpEarned} XP</span>
            </div>
          )}
          {summary.cleanBonusGold > 0 && (
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">{lang === 'de' ? 'Gold (Standhaftigkeit)' : 'Resisted Bad Habits Gold'}</span>
              <span className="font-mono-num font-semibold text-[#e8b84b]">+{summary.cleanBonusGold} Gold</span>
            </div>
          )}
          {summary.healed > 0 && (
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">{lang === 'de' ? 'Heilgarten-Regeneration' : 'Healing Garden Regen'}</span>
              <span className="font-mono-num font-semibold text-[#30d158]">+{summary.healed} HP</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 min-h-[44px] w-full rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-semibold text-[#111113] hover:bg-white"
      >
        {t.continueAdventure}
      </button>
    </div>
  );
}
