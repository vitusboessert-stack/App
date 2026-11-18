import { useState, type FormEvent } from 'react';
import {
  AVATAR_DEFAULT,
  CLASS_COLORS,
  CLASS_GLYPHS,
  CLASSES,
  getPetRarityStyle,
  ITEMS,
  PETS,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
  type HabitItem,
  type HabitKind,
  type HabitRhythm,
  type HeroSave,
  type TodoItem,
} from '../types/arcana';
import {
  calcStats,
  formatPetPerkTags,
  getActivePet,
  getPetPerkEffects,
  isHabitDue,
  today,
  type DayResolutionSummary,
} from '../engine/game';
import { AvatarWorkshop } from './AvatarWorkshop';
import { GearIcon, PetSprite } from './PixelSprite';

export type ActiveModal =
  | { type: 'habit-add' }
  | { type: 'habit-edit'; habit: HabitItem }
  | { type: 'todo-add' }
  | { type: 'todo-edit'; todo: TodoItem }
  | { type: 'reward-add' }
  | { type: 'add-friend' }
  | { type: 'guild-create' }
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
  onCreateHabit: (title: string, kind: HabitKind, rhythm: HabitRhythm, everyDays: number, weekdays: number[]) => void;
  onUpdateHabit: (id: string, title: string, kind: HabitKind, rhythm: HabitRhythm, everyDays: number, weekdays: number[]) => void;
  onDeleteHabit: (id: string) => void;
  onCreateTodo: (title: string, dueDate: string) => void;
  onUpdateTodo: (id: string, title: string, dueDate: string) => void;
  onCreateReward: (title: string, minutes: number, cost: number) => void;
  onAddFriend: (name: string) => void;
  onCreateGuild: (name: string) => void;
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

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b0811]/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="arcana-scroll max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#4c4063] bg-[#1d1927] p-5 shadow-2xl sm:p-6"
      >
        {modal.type === 'habit-add' && (
          <HabitFormModal
            titleText="Create a Habit"
            submitLabel="Create Habit"
            onClose={onClose}
            onSubmit={(title, kind, rhythm, everyDays, weekdays) =>
              props.onCreateHabit(title, kind, rhythm, everyDays, weekdays)
            }
          />
        )}

        {modal.type === 'habit-edit' && (
          <HabitFormModal
            titleText="Edit Habit"
            submitLabel="Save Changes"
            initialHabit={modal.habit}
            onClose={onClose}
            onDelete={() => props.onDeleteHabit(modal.habit.id)}
            onSubmit={(title, kind, rhythm, everyDays, weekdays) =>
              props.onUpdateHabit(modal.habit.id, title, kind, rhythm, everyDays, weekdays)
            }
          />
        )}

        {modal.type === 'todo-add' && (
          <TodoFormModal
            titleText="Create To-Do"
            submitLabel="Add To-Do"
            onClose={onClose}
            onSubmit={props.onCreateTodo}
          />
        )}

        {modal.type === 'todo-edit' && (
          <TodoFormModal
            titleText="Edit To-Do"
            submitLabel="Save Changes"
            initialTodo={modal.todo}
            onClose={onClose}
            onSubmit={(title, due) => props.onUpdateTodo(modal.todo.id, title, due)}
          />
        )}

        {modal.type === 'reward-add' && <RewardFormModal onClose={onClose} onSubmit={props.onCreateReward} />}
        {modal.type === 'add-friend' && <SingleInputModal title="Add Local Friend" label="Friend Display Name" placeholder="e.g. Lyra" note="Saved only in your device's local roster; no invitation is sent." buttonText="Save Friend" onClose={onClose} onSubmit={props.onAddFriend} />}
        {modal.type === 'guild-create' && <SingleInputModal title="Found Your Guild" label="Guild Name" placeholder="e.g. The Midnight Order" note="Founding a guild costs no gold. Earn Guild XP from completed habits, to-dos, and boss victories." buttonText="Found Guild" onClose={onClose} onSubmit={props.onCreateGuild} />}

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
          <ResolutionSummaryModal summary={modal.summary} onClose={onClose} />
        )}

        {modal.type === 'confirm-reset' && (
          <div>
            <ModalHeader title="Reset All Progress?" onClose={onClose} />
            <p className="text-sm leading-relaxed text-[#b7abc7]">
              This permanently deletes your current hero, habits, pets, gear, and guild data from this browser. Consider exporting a JSON backup first.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] rounded-xl border border-[#4c4063] bg-[#272234] px-4 py-2 text-sm font-semibold text-[#f5f1fa] hover:bg-[#322b42]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={props.onConfirmResetGame}
                className="min-h-[42px] rounded-xl border border-[#a8556a] bg-[#753247] px-4 py-2 text-sm font-bold text-[#ffeef2] hover:bg-[#8c3d56]"
              >
                Delete Save
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
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#322b40] pb-3">
      <h2 className="text-xl font-bold text-[#f5f1fa]">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="grid h-10 w-10 place-items-center rounded-xl border border-[#463c59] bg-[#272234] text-xl text-[#d6c9e8] hover:bg-[#342d45]"
      >
        ×
      </button>
    </div>
  );
}

function HabitFormModal({
  titleText,
  submitLabel,
  initialHabit,
  onClose,
  onDelete,
  onSubmit,
}: {
  titleText: string;
  submitLabel: string;
  initialHabit?: HabitItem;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (title: string, kind: HabitKind, rhythm: HabitRhythm, everyDays: number, weekdays: number[]) => void;
}) {
  const [title, setTitle] = useState(initialHabit?.title || '');
  const [kind, setKind] = useState<HabitKind>(initialHabit?.kind || 'good');
  const [rhythm, setRhythm] = useState<HabitRhythm>(initialHabit?.rhythm || 'daily');
  const [everyDays, setEveryDays] = useState(initialHabit?.everyDays || 3);
  const [weekdays, setWeekdays] = useState<number[]>(
    initialHabit?.weekdays?.length ? initialHabit.weekdays : [1, 2, 3, 4, 5]
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a habit name.');
      return;
    }
    if (rhythm === 'weekdays' && weekdays.length === 0) {
      setError('Select at least one weekday.');
      return;
    }
    onSubmit(title.trim(), kind, rhythm, Math.max(2, Math.min(7, everyDays)), weekdays);
  };

  const toggleDay = (d: number) => {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  return (
    <div>
      <ModalHeader title={titleText} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#d6c9e8]">Habit Name</label>
          <input
            type="text"
            maxLength={70}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 10 pages"
            required
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa] focus:border-[#c4a3f5] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#d6c9e8]">Quest Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as HabitKind)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3 py-2 text-sm text-[#f5f1fa] focus:border-[#c4a3f5] focus:outline-none"
            >
              <option value="good">Build a good habit</option>
              <option value="bad">Break a bad habit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d6c9e8]">Frequency</label>
            <select
              value={rhythm}
              onChange={(e) => setRhythm(e.target.value as HabitRhythm)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3 py-2 text-sm text-[#f5f1fa] focus:border-[#c4a3f5] focus:outline-none"
            >
              <option value="daily">Every day</option>
              <option value="every">Every N days</option>
              <option value="monthly">Monthly</option>
              <option value="weekdays">Custom weekdays</option>
            </select>
          </div>
        </div>

        {rhythm === 'every' && (
          <div>
            <label className="block text-xs font-semibold text-[#d6c9e8]">Repeat every N days (2–7)</label>
            <input
              type="number"
              min={2}
              max={7}
              value={everyDays}
              onChange={(e) => setEveryDays(Number(e.target.value) || 2)}
              className="mt-1.5 min-h-[44px] w-32 rounded-xl border border-[#4c4063] bg-[#13111a] px-3 py-2 text-sm text-[#f5f1fa]"
            />
          </div>
        )}

        {rhythm === 'weekdays' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#d6c9e8]">Active Weekdays</label>
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
                        ? 'border-[#c4a3f5] bg-[#4e3b73] text-[#ffffff]'
                        : 'border-[#433957] bg-[#251f33] text-[#b7abc7]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-[#de7288]">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[44px] rounded-xl border border-[#8f4458] bg-[#5c2537] px-4 py-2 text-sm font-semibold text-[#ffe8ed] hover:bg-[#753047]"
            >
              Delete Habit
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="min-h-[44px] rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-6 py-2 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function TodoFormModal({
  titleText,
  submitLabel,
  initialTodo,
  onClose,
  onSubmit,
}: {
  titleText: string;
  submitLabel: string;
  initialTodo?: TodoItem;
  onClose: () => void;
  onSubmit: (title: string, dueDate: string) => void;
}) {
  const [title, setTitle] = useState(initialTodo?.title || '');
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate || '');

  return (
    <div>
      <ModalHeader title={titleText} onClose={onClose} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) onSubmit(title.trim(), dueDate);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-[#d6c9e8]">Quest Name</label>
          <input
            type="text"
            maxLength={90}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="One objective you want to finish"
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa] focus:border-[#c4a3f5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#d6c9e8]">Due Date (Optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa] focus:border-[#c4a3f5] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}

function RewardFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, minutes: number, cost: number) => void;
}) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [cost, setCost] = useState(35);

  return (
    <div>
      <ModalHeader title="Create Custom Reward" onClose={onClose} />
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
          <label className="block text-xs font-semibold text-[#d6c9e8]">Reward Name</label>
          <input
            type="text"
            maxLength={60}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Gaming break"
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#d6c9e8]">Minutes</label>
            <input
              type="number"
              min={1}
              max={180}
              required
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || 1)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#d6c9e8]">Gold Cost</label>
            <input
              type="number"
              min={1}
              max={1000}
              required
              value={cost}
              onChange={(e) => setCost(Number(e.target.value) || 1)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
        >
          Create Reward
        </button>
      </form>
    </div>
  );
}

function SingleInputModal({
  title,
  label,
  placeholder,
  note,
  buttonText,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  placeholder: string;
  note: string;
  buttonText: string;
  onClose: () => void;
  onSubmit: (val: string) => void;
}) {
  const [val, setVal] = useState('');
  return (
    <div>
      <ModalHeader title={title} onClose={onClose} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (val.trim()) onSubmit(val.trim());
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-[#d6c9e8]">{label}</label>
          <input
            type="text"
            maxLength={32}
            required
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#4c4063] bg-[#13111a] px-3.5 py-2 text-sm text-[#f5f1fa]"
          />
        </div>
        <p className="text-xs text-[#b7abc7]">{note}</p>
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
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

  return (
    <div>
      <ModalHeader title="Customize Hero" onClose={onClose} />
      <AvatarWorkshop
        avatar={draft}
        className={save.className}
        equipped={save.equipped}
        costume={save.costume}
        costumeMode={save.costumeMode}
        activeCosmetics={save.activeCosmetics}
        allowGearToggle
        onChange={setDraft}
      />
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-xl border border-[#4c4063] bg-[#272234] px-5 py-2 text-sm font-semibold text-[#f5f1fa] hover:bg-[#342d45]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="min-h-[44px] rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-6 py-2 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
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
                    ? 'border-[#c4a3f5] bg-[#342a4a]'
                    : 'border-[#3d3452] bg-[#251f33] hover:bg-[#2f2840]'
                }`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#463c59] bg-[#1a1624] p-1">
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#f5f1fa]">{item.name}</p>
                  <p className="font-mono-num mt-0.5 text-xs text-[#b7abc7]">
                    {Object.entries(item.stats)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#c4a3f5]">
                  {isEquipped ? 'Equipped' : 'Equip ›'}
                </span>
              </button>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-[#463c59] p-5 text-center text-sm text-[#b7abc7]">
            You do not own any {slot.toLowerCase()} gear yet. Visit the Market to buy equipment.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {activeId && (
          <button
            type="button"
            onClick={onUnequip}
            className="min-h-[42px] flex-1 rounded-xl border border-[#54466b] bg-[#292238] px-4 py-2 text-sm font-semibold text-[#ece5f7] hover:bg-[#352c47]"
          >
            Unequip Slot
          </button>
        )}
        <button
          type="button"
          onClick={onGoMarket}
          className="min-h-[42px] flex-1 rounded-xl border border-[#4c4063] bg-[#231d30] px-4 py-2 text-sm font-semibold text-[#c4a3f5] hover:bg-[#2f2840]"
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
      <p className="mb-4 text-sm text-[#b7abc7]">
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
                  ? 'border-[#c4a3f5] bg-[#342a4a]'
                  : 'border-[#3d3452] bg-[#251f33] hover:bg-[#2f2840] disabled:opacity-45'
              }`}
            >
              <span className="text-2xl" style={{ color: CLASS_COLORS[c] }}>
                {CLASS_GLYPHS[c]}
              </span>
              <span className="flex-1 font-semibold text-[#f5f1fa]">{c}</span>
              <span className="text-xs font-semibold text-[#c4a3f5]">
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
      <p className="text-sm text-[#b7abc7]">
        You completed all 5 Onboarding Quests! Pick any companion below to join your hero immediately, plus <span className="font-bold text-[#e8b84b]">+100 XP &amp; +75 Gold</span>.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {rarities.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRarityFilter(r)}
            className={`min-h-[30px] rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
              rarityFilter === r
                ? 'bg-[#c4a3f5] text-[#1d152b]'
                : 'bg-[#251f33] text-[#b7abc7] hover:bg-[#2f2840]'
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
                borderColor: active ? '#c4a3f5' : rarityStyle.cardBorder,
                boxShadow: rarityStyle.cardGlow,
              }}
              className={`flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
                active ? 'bg-[#342a4a]' : 'bg-[#251f33] hover:bg-[#2f2840]'
              }`}
            >
              <PetSprite pet={pet} rarity={pet.rarity} className="h-12 w-12" />
              <span
                style={{
                  color: rarityStyle.hex,
                  backgroundColor: rarityStyle.tagBg,
                  borderColor: rarityStyle.tagBorder,
                }}
                className="mt-1.5 rounded-md border px-2 py-0.5 text-xs font-bold"
              >
                {pet.name}
              </span>
              <p className="mt-1 text-[11px] font-bold" style={{ color: rarityStyle.hex }}>
                {pet.rarity}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[#b7abc7]">
                {perkTags.join(' · ')}
              </p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onClaim(selected)}
        className="mt-4 min-h-[44px] w-full rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
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
  const d = today();
  const missed = save.habits.filter((h) => h.kind === 'good' && isHabitDue(h, d) && !h.doneDates.includes(d));
  const cleanBad = save.habits.filter((h) => h.kind === 'bad' && isHabitDue(h, d) && !h.slips.includes(d));
  const st = calcStats(save);
  const petPerk = getPetPerkEffects(getActivePet(save));
  const totalBlock = save.protection + petPerk.rolloverBlock;
  const perMiss = Math.max(1, 3 - Math.floor(st.def / 5));
  const incomingDmg = Math.max(0, missed.length * perMiss - totalBlock);

  return (
    <div>
      <ModalHeader title="End Day & Resolve Battle" onClose={onClose} />
      <p className="text-sm text-[#b7abc7]">
        Resolving the day strikes the Raid Boss with your queued damage, grants XP for resisted bad habits, and applies any missed-habit penalties.
      </p>

      <div className="mt-4 space-y-2.5 rounded-xl border border-[#383148] bg-[#16131f] p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[#b7abc7]">Queued Boss Damage</span>
          <span className="font-mono-num font-bold text-[#e5be6b]">{save.damageQueued} DMG</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#b7abc7]">Resisted Bad Habits ({cleanBad.length})</span>
          <span className="font-mono-num font-semibold text-[#45ba93]">
            +{cleanBad.length * 12} XP · +{cleanBad.length * 3} Gold
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#b7abc7]">Unfinished Good Habits ({missed.length})</span>
          <span className={`font-mono-num font-semibold ${incomingDmg > 0 ? 'text-[#de7288]' : 'text-[#45ba93]'}`}>
            -{incomingDmg} HP {totalBlock > 0 ? `(${totalBlock} blocked)` : ''}
          </span>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-xl border border-[#4c4063] bg-[#272234] px-5 py-2 text-sm font-semibold text-[#f5f1fa] hover:bg-[#342d45]"
        >
          Keep Questing
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-[44px] rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-6 py-2 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
        >
          Resolve Day & Strike
        </button>
      </div>
    </div>
  );
}

function ResolutionSummaryModal({
  summary,
  onClose,
}: {
  summary: DayResolutionSummary;
  onClose: () => void;
}) {
  return (
    <div>
      <ModalHeader title="Battle & Day Summary" onClose={onClose} />
      <div className="space-y-3 text-sm">
        {summary.bossDefeated && (
          <div className="rounded-xl border border-[#e5be6b]/60 bg-[#362c1e] p-4 text-[#fff3d6]">
            <p className="text-base font-bold text-[#e5be6b]">
              Victory! {summary.bossDefeated} Vanquished
            </p>
            <p className="mt-1 text-xs">
              Earned +65 XP, +55 Gold, +1 Pet Egg, and +45 Guild XP.
            </p>
          </div>
        )}

        {summary.fainted && (
          <div className="rounded-xl border border-[#de7288]/60 bg-[#3b212a] p-4 text-[#ffe3e8]">
            <p className="font-semibold">Collapsed from Exhaustion</p>
            <p className="mt-1 text-xs">
              You were revived at camp with full HP (lost up to 15 Gold). Tomorrow is a fresh start.
            </p>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-[#383148] bg-[#16131f] p-4">
          <div className="flex justify-between">
            <span className="text-[#b7abc7]">Days Resolved</span>
            <span className="font-mono-num font-semibold text-[#f5f1fa]">{summary.daysProcessed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b7abc7]">Boss Damage Dealt</span>
            <span className="font-mono-num font-semibold text-[#e5be6b]">{summary.damageDealt} DMG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b7abc7]">HP Lost to Missed Quests</span>
            <span className="font-mono-num font-semibold text-[#de7288]">{summary.damageTaken} HP</span>
          </div>
          {summary.cleanXpEarned > 0 && (
            <div className="flex justify-between">
              <span className="text-[#b7abc7]">Resisted Bad Habits XP</span>
              <span className="font-mono-num font-semibold text-[#45ba93]">+{summary.cleanXpEarned} XP</span>
            </div>
          )}
          {summary.cleanBonusGold > 0 && (
            <div className="flex justify-between">
              <span className="text-[#b7abc7]">Resisted Bad Habits Gold</span>
              <span className="font-mono-num font-semibold text-[#e5be6b]">+{summary.cleanBonusGold} Gold</span>
            </div>
          )}
          {summary.healed > 0 && (
            <div className="flex justify-between">
              <span className="text-[#b7abc7]">Healing Garden Regen</span>
              <span className="font-mono-num font-semibold text-[#45ba93]">+{summary.healed} HP</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 min-h-[44px] w-full rounded-xl border border-[#e3ccff] bg-[#c4a3f5] px-5 py-2.5 text-sm font-bold text-[#1d152b] hover:bg-[#d8c0fa]"
      >
        Continue Adventure
      </button>
    </div>
  );
}
