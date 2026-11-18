import { useState, type ChangeEvent } from 'react';
import {
  Award,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Hourglass,
  Leaf,
  Lock,
  Package,
  Paintbrush,
  PawPrint,
  Scroll,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  Swords,
  Users,
} from 'lucide-react';
import {
  CHALLENGES,
  CITY_BUILDINGS,
  CLASS_BONUS,
  CLASS_COLORS,
  CLASS_GLYPHS,
  CLASS_SKILLS,
  COSMETICS,
  EQUIP_SLOTS,
  getActiveSeason,
  getPetRarityStyle,
  ITEMS,
  PETS,
  QUEST_SHOP,
  type EquipSlot,
  type HeroSave,
  type RealmSection,
} from '../types/arcana';
import {
  calcStats,
  formatPetPerkTags,
  getActivePet,
  getBossForWins,
  getBossMaxHp,
  getOnboardingTasks,
  getPetPerkEffects,
  getPetStatBonus,
  maxHp,
  maxMp,
  xpNeeded,
} from '../engine/game';
import {
  AchievementBadgeIcon,
  BossSprite,
  GearIcon,
  HeroAvatar,
  PetSprite,
} from './PixelSprite';
import type { AchievementBadgeId } from '../sprites/worldSprites';

interface RealmViewsProps {
  save: HeroSave;
  section: RealmSection;
  onBack: () => void;
  onOpenSection: (sec: RealmSection) => void;
  onOpenAvatarEdit: () => void;
  onOpenClassSwitch: () => void;
  onCastSkill: (idx: number) => void;
  onToggleCostumeMode: (enabled: boolean) => void;
  onOpenEquipSelect: (slot: EquipSlot) => void;
  onEquipItem: (id: string) => void;
  onHatchEgg: () => void;
  onFeedPet: (petId: string) => void;
  onBuyPetTreats: () => void;
  onSetActivePet: (petId: string | null) => void;
  onOpenResolveDay: () => void;
  onJoinChallenge: (id: string) => void;
  onClaimChallenge: (id: string) => void;
  onOpenGuildCreate: () => void;
  onUpgradeBuilding: (id: string) => void;
  onBuyItem: (id: string) => void;
  onBuyQuestItem: (id: string) => void;
  onBuyCosmetic: (id: string) => void;
  onActivateCosmetic: (id: string) => void;
  onOpenAddFriend: () => void;
  onRemoveFriend: (index: number) => void;
  onToggleRestriction: (cat: string, checked: boolean) => void;
  onOpenRewardsTab: () => void;
  onToggleSound: (enabled: boolean) => void;
  onReplayOnboarding: () => void;
  onExportSave: () => void;
  onImportSave: (file: File) => void;
  onGoStart: () => void;
  onOpenResetConfirm: () => void;
}

export function RealmViews(props: RealmViewsProps) {
  const { save, section, onBack } = props;
  const activePet = save.pets.find((p) => p.id === save.activePetId) || null;

  if (!section) {
    // Clean grouped Realm menu matching Screenshot 3
    const characterGroup: { name: RealmSection; icon: typeof Sparkles; subtitle?: string; locked?: boolean }[] = [
      { name: 'Skills', icon: Sparkles },
      { name: 'Stats', icon: Dumbbell, subtitle: save.level < 10 ? `Level ${save.level} · Class & Gear attributes` : undefined },
      { name: 'Achievements', icon: Award },
    ];

    const activeSeason = getActiveSeason();
    const shopGroup: { name: RealmSection; icon: typeof Store; badge?: string }[] = [
      { name: 'Market', icon: Store },
      { name: 'Quest Shop', icon: Scroll },
      { name: 'Customization Shop', icon: ShoppingBag },
      {
        name: 'Seasonal Shop',
        icon: Leaf,
        badge: activeSeason === 'christmas' ? 'Christmas' : 'Fall / Halloween',
      },
      { name: 'Time Traveler Shop', icon: Hourglass },
    ];

    const inventoryGroup: { name: RealmSection | 'Avatar Customization'; icon: typeof Swords }[] = [
      { name: 'Equipment', icon: Swords },
      { name: 'Avatar Customization', icon: Paintbrush },
      { name: 'Pets', icon: PawPrint },
      { name: 'Boss', icon: Flame },
      { name: 'Challenges', icon: Crown },
      { name: 'Guild', icon: Shield },
      { name: 'Friends', icon: Users },
      { name: 'Focus', icon: Compass },
    ];

    const handleRowClick = (name: RealmSection | 'Avatar Customization') => {
      if (name === 'Avatar Customization') {
        props.onOpenAvatarEdit();
      } else {
        props.onOpenSection(name);
      }
    };

    const handleTag = save.name.toLowerCase().replace(/[^a-z0-9_]+/g, '') || 'hero';

    return (
      <div className="space-y-4">
        {/* Compact Top Realm Bar matching Inspo (Avatar + Username/@handle left, Settings gear far right) */}
        <div className="flex items-center justify-between gap-3 px-1 pb-1">
          <button
            type="button"
            onClick={() => props.onOpenSection('Profile')}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <HeroAvatar
              avatar={save.avatar}
              className={save.className}
              equipped={save.equipped}
              costume={save.costume}
              costumeMode={save.costumeMode}
              activeCosmetics={save.activeCosmetics}
              activePet={null}
              classNameWrapper="h-11 w-11 shrink-0 rounded-xl border border-[#3a3947]"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight text-[#f4f4f8]">{save.name}</p>
              <p className="truncate text-xs text-[#8c8ca1]">@{handleTag}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => props.onOpenSection('Settings')}
            aria-label="Settings"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#d3d2de] transition-colors hover:bg-[#222229] hover:text-[#ffffff]"
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Group 1: Character */}
        <div className="divide-y divide-[#2d2c37] rounded-2xl bg-[#222229]">
          {characterGroup.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.name}
                type="button"
                onClick={() => handleRowClick(row.name)}
                className="flex min-h-[56px] w-full items-center gap-4 px-4 py-3 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[#2a2933]"
              >
                <Icon className="h-5 w-5 shrink-0 text-[#a2a2b3]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#f4f4f8]">{row.name}</p>
                  {row.subtitle && <p className="text-xs text-[#767687]">{row.subtitle}</p>}
                </div>
                {row.locked && <Lock className="h-4 w-4 text-[#767687]" />}
              </button>
            );
          })}
        </div>

        {/* Group 2: Shops */}
        <div className="divide-y divide-[#2d2c37] rounded-2xl bg-[#222229]">
          {shopGroup.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.name}
                type="button"
                onClick={() => handleRowClick(row.name)}
                className="flex min-h-[56px] w-full items-center gap-4 px-4 py-3 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[#2a2933]"
              >
                <Icon className="h-5 w-5 shrink-0 text-[#a2a2b3]" />
                <span className="flex-1 text-[15px] font-bold text-[#f4f4f8]">{row.name}</span>
                {row.badge && (
                  <span className="text-xs font-bold text-[#a2a2b3]">{row.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Group 3: Inventory & World */}
        <div className="divide-y divide-[#2d2c37] rounded-2xl bg-[#222229]">
          {inventoryGroup.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.name}
                type="button"
                onClick={() => handleRowClick(row.name)}
                className="flex min-h-[56px] w-full items-center gap-4 px-4 py-3 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[#2a2933]"
              >
                <Icon className="h-5 w-5 shrink-0 text-[#a2a2b3]" />
                <span className="flex-1 text-[15px] font-bold text-[#f4f4f8]">
                  {row.name === 'Pets' ? 'Pets & Companions' : row.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Realm"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#222229] text-2xl text-[#f4f4f8] hover:bg-[#2b2a34]"
        >
          ‹
        </button>
        <div>
          <p className="text-xs font-bold text-[#9b7bf0]">Realm</p>
          <h1 className="text-2xl font-bold text-[#f4f4f8]">{section}</h1>
        </div>
      </div>

      {section === 'Profile' && (
        <div className="rounded-2xl bg-[#222229] p-6 text-center">
          <HeroAvatar
            avatar={save.avatar}
            className={save.className}
            equipped={save.equipped}
            costume={save.costume}
            costumeMode={save.costumeMode}
            activeCosmetics={save.activeCosmetics}
            activePet={activePet}
            classNameWrapper="mx-auto aspect-[3/4] w-48 rounded-2xl border border-[#3a3947]"
          />
          <h2 className="mt-5 text-2xl font-bold text-[#f4f4f8]">{save.name}</h2>
          <p className="mt-1 text-sm text-[#a2a2b3]">
            Level {save.level} · {save.className}
            {save.guild.name ? ` · ${save.guild.name}` : ''}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={props.onOpenAvatarEdit}
              className="min-h-[44px] rounded-xl bg-[#9b7bf0] px-5 py-2 text-sm font-bold text-[#14111c] hover:bg-[#b094f7]"
            >
              Customize Character
            </button>
            <button
              type="button"
              onClick={props.onOpenClassSwitch}
              className="min-h-[44px] rounded-xl border border-[#3d3c4c] bg-[#2b2a34] px-5 py-2 text-sm font-bold text-[#f4f4f8] hover:bg-[#353440]"
            >
              Switch Class
            </button>
          </div>
        </div>
      )}

      {section === 'Stats' && <StatsSection save={save} />}
      {section === 'Skills' && <SkillsSection save={save} onCast={props.onCastSkill} onSwitch={props.onOpenClassSwitch} />}
      {section === 'Equipment' && (
        <EquipmentSection
          save={save}
          onToggleCostume={props.onToggleCostumeMode}
          onOpenSlot={props.onOpenEquipSelect}
          onEquipItem={props.onEquipItem}
        />
      )}
      {section === 'Pets' && (
        <PetsSection
          save={save}
          onHatch={props.onHatchEgg}
          onFeedPet={props.onFeedPet}
          onBuyTreats={props.onBuyPetTreats}
          onSetActivePet={props.onSetActivePet}
        />
      )}
      {section === 'Boss' && <BossSection save={save} onOpenResolve={props.onOpenResolveDay} />}
      {section === 'Challenges' && (
        <ChallengesSection save={save} onJoin={props.onJoinChallenge} onClaim={props.onClaimChallenge} />
      )}
      {section === 'Guild' && (
        <GuildSection save={save} onCreate={props.onOpenGuildCreate} onUpgrade={props.onUpgradeBuilding} />
      )}
      {section === 'Market' && <MarketSection save={save} onBuy={props.onBuyItem} />}
      {section === 'Quest Shop' && <QuestShopSection save={save} onBuy={props.onBuyQuestItem} />}
      {section === 'Seasonal Shop' && (
        <SeasonalShopSection
          save={save}
          onBuyItem={props.onBuyItem}
          onBuyCosmetic={props.onBuyCosmetic}
          onActivateCosmetic={props.onActivateCosmetic}
        />
      )}
      {(section === 'Customization Shop' || section === 'Time Traveler Shop') && (
        <CosmeticShopSection
          save={save}
          shop={section}
          onBuy={props.onBuyCosmetic}
          onActivate={props.onActivateCosmetic}
        />
      )}
      {section === 'Friends' && (
        <FriendsSection save={save} onAdd={props.onOpenAddFriend} onRemove={props.onRemoveFriend} />
      )}
      {section === 'Achievements' && <AchievementsSection save={save} />}
      {section === 'Focus' && (
        <FocusSection
          save={save}
          onToggle={props.onToggleRestriction}
          onOpenRewards={props.onOpenRewardsTab}
        />
      )}
      {section === 'Settings' && (
        <SettingsSection
          save={save}
          onToggleSound={props.onToggleSound}
          onReplay={props.onReplayOnboarding}
          onExport={props.onExportSave}
          onImport={props.onImportSave}
          onGoStart={props.onGoStart}
          onReset={props.onOpenResetConfirm}
        />
      )}
    </div>
  );
}

function MeterBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (100 * value) / Math.max(1, max)));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#15151a]">
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatsSection({ save }: { save: HeroSave }) {
  const st = calcStats(save);
  const classBonus = CLASS_BONUS[save.className];
  const petStats = getPetStatBonus(save);
  const activePet = getActivePet(save);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#222229] p-5">
        <h2 className="mb-4 text-lg font-bold text-[#f4f4f8]">Vital Signs</h2>
        <div className="space-y-3.5">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-bold text-[#f4f4f8]">HP</span>
              <span className="font-mono-num text-[#e25f5f]">
                {save.hp} / {maxHp(save.level)}
              </span>
            </div>
            <MeterBar value={save.hp} max={maxHp(save.level)} color="bg-gradient-to-r from-[#e05265] to-[#f78a6b]" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-bold text-[#f4f4f8]">EXP</span>
              <span className="font-mono-num text-[#e8b84b]">
                {save.xp} / {xpNeeded(save.level)}
              </span>
            </div>
            <MeterBar value={save.xp} max={xpNeeded(save.level)} color="bg-gradient-to-r from-[#d48b35] to-[#f4b952]" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-bold text-[#f4f4f8]">MP</span>
              <span className="font-mono-num text-[#76a9ea]">
                {save.level < 10 ? 'Unlocks at level 10' : `${save.mp} / ${maxMp(save.level)}`}
              </span>
            </div>
            <MeterBar value={save.level < 10 ? 0 : save.mp} max={maxMp(save.level)} color="bg-gradient-to-r from-[#4b78c7] to-[#6eb6f0]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['str', 'def', 'int', 'agi'] as const).map((k) => (
          <div key={k} className="rounded-2xl bg-[#222229] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#a2a2b3]">{k}</p>
            <p className="font-mono-num mt-1 text-3xl font-bold text-[#f4f4f8]">{st[k]}</p>
            <p className="mt-1 text-[11px] text-[#767687]">
              Class +{classBonus[k]}
              {petStats[k] > 0 ? ` · Pet +${petStats[k]}` : ''}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[#a2a2b3]">
        STR increases daily Raid Boss damage. DEF reduces HP lost from missed habits. INT boosts MP recovery. AGI increases Gold earned from quests.
        {activePet ? ` Active companion ${activePet.name} also grants passive perks.` : ''}
      </p>
    </div>
  );
}

function SkillsSection({
  save,
  onCast,
  onSwitch,
}: {
  save: HeroSave;
  onCast: (idx: number) => void;
  onSwitch: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl bg-[#222229] p-5">
        <span className="text-4xl" style={{ color: CLASS_COLORS[save.className] }}>
          {CLASS_GLYPHS[save.className]}
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#f4f4f8]">{save.className} Skills</h2>
          <p className="font-mono-num text-xs text-[#a2a2b3]">
            {save.level < 10 ? 'Locked until level 10' : `${save.mp} / ${maxMp(save.level)} MP available`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {CLASS_SKILLS[save.className].map(([name, cost, desc], idx) => (
          <div
            key={name}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#222229] p-4"
          >
            <div>
              <p className="font-bold text-[#f4f4f8]">{name}</p>
              <p className="mt-0.5 text-xs text-[#a2a2b3]">{desc}</p>
              <p className="font-mono-num mt-1 text-xs font-bold text-[#e8b84b]">{cost} MP</p>
            </div>
            <button
              type="button"
              disabled={save.level < 10 || save.mp < cost}
              onClick={() => onCast(idx)}
              className="min-h-[42px] rounded-xl bg-[#2b2a34] px-5 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#363542] disabled:opacity-40"
            >
              {save.level < 10 ? 'Locked' : 'Cast Skill'}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSwitch}
        className="min-h-[42px] rounded-xl bg-[#222229] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#2b2a34]"
      >
        View Class Options
      </button>
    </div>
  );
}

function EquipmentSection({
  save,
  onToggleCostume,
  onOpenSlot,
  onEquipItem,
}: {
  save: HeroSave;
  onToggleCostume: (enabled: boolean) => void;
  onOpenSlot: (slot: EquipSlot) => void;
  onEquipItem: (id: string) => void;
}) {
  const st = calcStats(save);
  const activeMap = save.costumeMode ? save.costume : save.equipped;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#222229] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HeroAvatar
              avatar={save.avatar}
              className={save.className}
              equipped={save.equipped}
              costume={save.costume}
              costumeMode={save.costumeMode}
              activeCosmetics={save.activeCosmetics}
              classNameWrapper="h-24 w-[72px] shrink-0 rounded-xl border border-[#3a3947]"
            />
            <div>
              <p className="text-sm font-bold text-[#f4f4f8]">
                Costume Mode {save.costumeMode ? '(Vanity Active)' : '(Battle Gear Visible)'}
              </p>
              <p className="mt-0.5 text-xs text-[#a2a2b3]">
                Equipped items render directly onto your pixel avatar.
              </p>
              <p className="font-mono-num mt-2 text-xs font-bold text-[#9b7bf0]">
                STR {st.str} · DEF {st.def} · INT {st.int} · AGI {st.agi}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleCostume(!save.costumeMode)}
            className={`min-h-[42px] rounded-xl px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
              save.costumeMode
                ? 'bg-[#26a66c] text-[#0c261a]'
                : 'bg-[#2b2a34] text-[#d3d2de] hover:bg-[#353440]'
            }`}
          >
            {save.costumeMode ? 'Costume: On' : 'Costume: Off'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EQUIP_SLOTS.map((slot) => {
          const item = ITEMS.find((i) => i.id === activeMap[slot]);
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onOpenSlot(slot)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl bg-[#222229] p-3 text-center transition-colors hover:bg-[#2b2a34]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#18181c] p-1.5">
                {item ? (
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                ) : (
                  <Package className="h-5 w-5 text-[#5c5b6e]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[#f4f4f8]">{slot}</p>
                <p className="mt-0.5 text-[11px] text-[#a2a2b3]">{item ? item.name : 'Empty'}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-[#f4f4f8]">Owned Equipment</h2>
        <div className="space-y-2.5">
          {save.owned.map((id) => {
            const item = ITEMS.find((i) => i.id === id);
            if (!item) return null;
            const equippedHere = activeMap[item.slot] === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 rounded-2xl bg-[#222229] p-3"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#18181c] p-1">
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#f4f4f8]">{item.name}</p>
                  <p className="font-mono-num text-xs text-[#a2a2b3]">
                    {item.slot} ·{' '}
                    {Object.entries(item.stats)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEquipItem(item.id)}
                  className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap ${
                    equippedHere
                      ? 'bg-[#9b7bf0] text-[#14111c]'
                      : 'bg-[#2b2a34] text-[#f4f4f8] hover:bg-[#353440]'
                  }`}
                >
                  {equippedHere ? 'Equipped' : 'Equip'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PetsSection({
  save,
  onHatch,
  onFeedPet,
  onBuyTreats,
  onSetActivePet,
}: {
  save: HeroSave;
  onHatch: () => void;
  onFeedPet: (petId: string) => void;
  onBuyTreats: () => void;
  onSetActivePet: (id: string | null) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#222229] p-5">
          <div>
            <p className="text-base font-bold text-[#f4f4f8]">
              {save.eggs} Unhatched Egg{save.eggs === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-[#a2a2b3]">
              Hatch eggs to unlock pixel companions.
            </p>
          </div>
          <button
            type="button"
            disabled={save.eggs < 1}
            onClick={onHatch}
            className="min-h-[42px] shrink-0 rounded-xl bg-[#9b7bf0] px-4 py-2 text-xs font-bold text-[#14111c] hover:bg-[#b094f7] disabled:opacity-40"
          >
            Hatch Egg
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#222229] p-5">
          <div>
            <p className="text-base font-bold text-[#f4f4f8]">
              {save.petFood} Pet Treat{save.petFood === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-[#a2a2b3]">
              Feed companions for +6 XP &amp; pet levels.
            </p>
          </div>
          <button
            type="button"
            disabled={save.gold < 15}
            onClick={onBuyTreats}
            className="font-mono-num min-h-[42px] shrink-0 rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] hover:bg-[#deb978] disabled:opacity-40"
          >
            +3 (15 Gold)
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-[#f4f4f8]">
          Companions ({save.pets.length})
        </h2>
        {save.pets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {save.pets.map((p) => {
              const isActive = save.activePetId === p.id;
              const petLevel = p.level || 1;
              const rarityStyle = getPetRarityStyle(p.rarity);
              const perk = getPetPerkEffects(p);
              const perkTags = formatPetPerkTags(perk);

              return (
                <div
                  key={p.id}
                  style={{
                    borderColor: isActive ? '#26a66c' : rarityStyle.cardBorder,
                    backgroundColor: isActive ? '#1e2d27' : '#222229',
                    boxShadow: rarityStyle.cardGlow,
                  }}
                  className="flex flex-col items-center rounded-2xl border p-4 text-center transition-colors"
                >
                  <div className="relative grid h-16 w-16 place-items-center">
                    <div
                      className="animate-pet-aura pointer-events-none absolute inset-0 rounded-full"
                      style={{ background: rarityStyle.auraBg }}
                    />
                    <PetSprite pet={p} rarity={p.rarity} animate className="relative h-14 w-14" />
                  </div>

                  <span
                    style={{
                      color: rarityStyle.hex,
                      backgroundColor: rarityStyle.tagBg,
                      borderColor: rarityStyle.tagBorder,
                      boxShadow: `0 0 10px ${rarityStyle.tagBg}`,
                    }}
                    className="mt-2 inline-block rounded-md border px-2.5 py-0.5 text-sm font-bold"
                  >
                    {p.name}
                  </span>
                  <p style={{ color: rarityStyle.hex }} className="mt-1 text-xs font-bold opacity-90">
                    {p.rarity} · Lv. {petLevel}
                  </p>

                  <div className="mt-2.5 w-full rounded-xl bg-[#16161c]/80 px-2.5 py-2 text-[11px]">
                    <p className="font-bold text-[#f4f4f8]">{perk.title}</p>
                    <p className="mt-0.5 text-[#a2a2b3]">{perkTags.join(' · ')}</p>
                  </div>

                  <div className="mt-3 flex w-full gap-2">
                    <button
                      type="button"
                      onClick={() => onSetActivePet(isActive ? null : p.id)}
                      className={`min-h-[38px] flex-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#26a66c] text-[#0c261a]'
                          : 'bg-[#2b2a34] text-[#f4f4f8] hover:bg-[#353440]'
                      }`}
                    >
                      {isActive ? 'Following ✓' : 'Summon'}
                    </button>
                    <button
                      type="button"
                      disabled={save.petFood < 1}
                      onClick={() => onFeedPet(p.id)}
                      className="min-h-[38px] flex-1 rounded-xl bg-[#9b7bf0] px-2.5 py-1.5 text-xs font-bold text-[#14111c] hover:bg-[#b094f7] disabled:opacity-40"
                    >
                      Feed Pet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#3d3c4c] bg-[#1d1d24] p-6 text-center text-sm text-[#a2a2b3]">
            Hatch your starting egg above or defeat a Raid Boss to collect companions.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#222229] p-4">
        <h3 className="mb-2 text-sm font-bold text-[#f4f4f8]">Hatching Odds &amp; Companion Perks</h3>
        <div className="divide-y divide-[#2e2d38] text-xs">
          {PETS.map((p) => {
            const rarityStyle = getPetRarityStyle(p.rarity);
            const perkTags = formatPetPerkTags(getPetPerkEffects({ sprite: p.sprite, level: 1 }));
            return (
              <div key={p.name} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <span style={{ color: rarityStyle.hex }} className="font-bold">
                    {p.rarity} · {p.name}
                  </span>
                  <p className="mt-0.5 truncate text-[11px] text-[#9c9cb0]">{perkTags.join(' · ')}</p>
                </div>
                <span className="font-mono-num shrink-0 text-[#a2a2b3]">{p.weight}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BossSection({ save, onOpenResolve }: { save: HeroSave; onOpenResolve: () => void }) {
  const boss = getBossForWins(save.bossWins);
  const maxBossHp = getBossMaxHp(save.bossWins);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#593442] bg-[#241921] p-6 text-center">
        <p className="text-xs font-bold tracking-wider text-[#e3a4a9]">
          Raid Boss · Encounter {save.bossWins + 1}
        </p>
        <div className="mx-auto my-4 h-40 max-w-xs">
          <BossSprite wins={save.bossWins} className="h-full w-full" />
        </div>
        <h2 className="text-2xl font-bold text-[#ffe8ea]">{boss.name}</h2>
        <p className="mt-1 text-sm text-[#cfaab8]">{boss.subtitle}</p>

        <div className="mx-auto mt-5 max-w-md">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-bold text-[#f5d5d9]">Boss HP</span>
            <span className="font-mono-num font-bold text-[#ffe8ea]">
              {save.bossHp} / {maxBossHp}
            </span>
          </div>
          <MeterBar value={save.bossHp} max={maxBossHp} color="bg-gradient-to-r from-[#e05265] to-[#f78a6b]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#222229] p-4 text-center">
          <p className="font-mono-num text-2xl font-bold text-[#e8b84b]">{save.damageQueued}</p>
          <p className="mt-1 text-xs text-[#a2a2b3]">Queued DMG</p>
        </div>
        <div className="rounded-2xl bg-[#222229] p-4 text-center">
          <p className="font-mono-num text-2xl font-bold text-[#f4f4f8]">{save.bossWins}</p>
          <p className="mt-1 text-xs text-[#a2a2b3]">Victories</p>
        </div>
        <div className="rounded-2xl bg-[#222229] p-4 text-center">
          <p className="font-mono-num text-2xl font-bold text-[#26a66c]">{save.eggs}</p>
          <p className="mt-1 text-xs text-[#a2a2b3]">Eggs Ready</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#222229] p-5">
        <div className="max-w-md">
          <h3 className="text-base font-bold text-[#f4f4f8]">Daily Battle Resolution</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#a2a2b3]">
            Completed habits and To-Dos queue boss damage. Trigger battle resolution manually when your day is done, or let automatic midnight rollover resolve it.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenResolve}
          className="min-h-[44px] rounded-xl bg-[#9b7bf0] px-5 py-2.5 text-sm font-bold text-[#14111c] hover:bg-[#b094f7] whitespace-nowrap"
        >
          End Day & Strike Boss
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-[#f4f4f8]">Combat Log</h3>
        <div className="space-y-2">
          {save.combatLog.length > 0 ? (
            save.combatLog.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl bg-[#222229] p-3.5"
              >
                <span className="text-base font-bold text-[#e8b84b]">
                  {c.type === 'victory' ? '✦' : c.type === 'hurt' ? '−' : '⚔'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#f4f4f8]">{c.text}</p>
                  <p className="font-mono-num text-xs text-[#767687]">{c.day}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-[#3d3c4c] p-5 text-center text-sm text-[#a2a2b3]">
              No battles logged yet. Complete quests and resolve a day to strike the boss.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChallengesSection({
  save,
  onJoin,
  onClaim,
}: {
  save: HeroSave;
  onJoin: (id: string) => void;
  onClaim: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#a2a2b3]">
        Join any challenge for a 20 Gold bonus and earn larger rewards upon completing its target.
      </p>
      {CHALLENGES.map((c) => {
        const st = save.challenges[c.id];
        const progress = st?.progress || 0;
        return (
          <div key={c.id} className="rounded-2xl bg-[#222229] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#f4f4f8]">{c.name}</h3>
                <p className="mt-1 text-xs text-[#a2a2b3]">{c.desc}</p>
              </div>
              <span className="font-mono-num text-xs font-bold text-[#e8b84b]">
                +{c.completionXP} XP · +{c.completionGold} Gold
              </span>
            </div>
            <div className="my-3.5">
              <MeterBar value={progress} max={c.target} color="bg-gradient-to-r from-[#d48b35] to-[#f4b952]" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono-num text-xs text-[#a2a2b3]">
                {progress} / {c.target}
              </span>
              {!st ? (
                <button
                  type="button"
                  onClick={() => onJoin(c.id)}
                  className="min-h-[40px] rounded-xl bg-[#9b7bf0] px-4 py-1.5 text-xs font-bold text-[#14111c] hover:bg-[#b094f7]"
                >
                  Join +20 Gold
                </button>
              ) : st.claimed ? (
                <span className="text-xs font-bold text-[#26a66c]">Reward Claimed</span>
              ) : st.done ? (
                <button
                  type="button"
                  onClick={() => onClaim(c.id)}
                  className="min-h-[40px] rounded-xl bg-[#9b7bf0] px-4 py-1.5 text-xs font-bold text-[#14111c] hover:bg-[#b094f7]"
                >
                  Claim Reward
                </button>
              ) : (
                <span className="text-xs font-bold text-[#9b7bf0]">In Progress</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GuildSection({
  save,
  onCreate,
  onUpgrade,
}: {
  save: HeroSave;
  onCreate: () => void;
  onUpgrade: (id: string) => void;
}) {
  const g = save.guild;
  if (!g.name) {
    return (
      <div className="rounded-2xl bg-[#222229] p-8 text-center">
        <p className="text-5xl text-[#9b7bf0]">♜</p>
        <h2 className="mt-3 text-2xl font-bold text-[#f4f4f8]">Build Your Guild</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#a2a2b3]">
          Found your guild for free. Upgrade city buildings with Guild XP earned from habits, To-Dos, and Bosses to unlock passive hero bonuses.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 min-h-[44px] rounded-xl bg-[#9b7bf0] px-6 py-2.5 text-sm font-bold text-[#14111c] hover:bg-[#b094f7]"
        >
          Found Guild
        </button>
      </div>
    );
  }

  const cityLevel = Object.values(g.buildings).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#222229] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#9b7bf0]">Guild Citadel</p>
            <h2 className="text-2xl font-bold text-[#f4f4f8]">{g.name}</h2>
          </div>
          <p className="font-mono-num text-sm font-bold text-[#e8b84b]">
            City Level {cityLevel} · {g.xp} Guild XP
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CITY_BUILDINGS.map((b) => (
            <div key={b.id} className="rounded-xl bg-[#18181c] p-3 text-center">
              <span className="text-2xl text-[#e8b84b]">{b.icon}</span>
              <p className="mt-1 text-xs font-bold text-[#f4f4f8]">{b.name}</p>
              <p className="font-mono-num text-xs text-[#a2a2b3]">Lv. {g.buildings[b.id] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CITY_BUILDINGS.map((b) => {
          const lvl = g.buildings[b.id] || 0;
          const cost = b.base + lvl * 25;
          return (
            <div key={b.id} className="flex flex-col justify-between rounded-2xl bg-[#222229] p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#f4f4f8]">
                    {b.icon} {b.name}
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#e8b84b]">Lv. {lvl}</span>
                </div>
                <p className="mt-1.5 text-xs text-[#a2a2b3]">{b.desc}</p>
              </div>
              <button
                type="button"
                disabled={g.xp < cost}
                onClick={() => onUpgrade(b.id)}
                className="mt-4 min-h-[40px] w-full rounded-xl bg-[#2b2a34] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#353440] disabled:opacity-40"
              >
                Upgrade · {cost} Guild XP
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketSection({ save, onBuy }: { save: HeroSave; onBuy: (id: string) => void }) {
  const [slotFilter, setSlotFilter] = useState<'All' | EquipSlot>('All');
  const standardGear = ITEMS.filter((i) => !i.seasonal && (slotFilter === 'All' || i.slot === slotFilter));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#2e2d38] pb-3">
        <p className="text-sm text-[#a2a2b3]">Purchase gear to equip directly onto your pixel avatar.</p>
        <p className="font-mono-num text-sm font-bold text-[#e8b84b]">{save.gold} Gold</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['All', ...EQUIP_SLOTS] as const).map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setSlotFilter(slot)}
            className={`min-h-[34px] rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
              slotFilter === slot
                ? 'bg-[#9b7bf0] text-[#14111c]'
                : 'bg-[#222229] text-[#a2a2b3] hover:bg-[#2b2a34] hover:text-[#f4f4f8]'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {standardGear.map((item) => {
          const owned = save.owned.includes(item.id);
          return (
            <div key={item.id} className="flex items-center gap-3.5 rounded-2xl bg-[#222229] p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#18181c] p-1">
                <GearIcon sprite={item.sprite} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#f4f4f8]">{item.name}</p>
                <p className="font-mono-num text-xs text-[#a2a2b3]">
                  {item.slot} · {item.rarity} ·{' '}
                  {Object.entries(item.stats)
                    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                    .join(' · ')}
                </p>
              </div>
              {owned ? (
                <span className="px-3 text-xs font-bold text-[#26a66c]">Owned</span>
              ) : (
                <button
                  type="button"
                  disabled={save.gold < item.cost}
                  onClick={() => onBuy(item.id)}
                  className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] hover:bg-[#deb978] disabled:opacity-40 whitespace-nowrap"
                >
                  {item.cost} Gold
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeasonalShopSection({
  save,
  onBuyItem,
  onBuyCosmetic,
  onActivateCosmetic,
}: {
  save: HeroSave;
  onBuyItem: (id: string) => void;
  onBuyCosmetic: (id: string) => void;
  onActivateCosmetic: (id: string) => void;
}) {
  const activeSeason = getActiveSeason();
  const upcomingSeason = activeSeason === 'fall' ? 'christmas' : 'fall';
  const activeGear = ITEMS.filter((i) => i.seasonal === activeSeason);
  const upcomingGear = ITEMS.filter((i) => i.seasonal === upcomingSeason);
  const activeCosmetics = COSMETICS.filter((c) => c.shop === 'Seasonal Shop' && c.seasonal === activeSeason);
  const upcomingCosmetics = COSMETICS.filter((c) => c.shop === 'Seasonal Shop' && c.seasonal === upcomingSeason);

  const seasonLabel = activeSeason === 'christmas' ? 'Christmas Collection' : 'Fall / Halloween Collection';
  const upcomingLabel =
    upcomingSeason === 'christmas'
      ? 'Arriving December 1 · Christmas Collection'
      : 'Returns Next Autumn · Fall / Halloween';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4c4063] bg-[#241f30] p-4">
        <div>
          <p className="text-xs font-bold text-[#e8b84b]">Active Seasonal Event</p>
          <h2 className="text-lg font-bold text-[#f4f4f8]">{seasonLabel}</h2>
          <p className="mt-0.5 text-xs text-[#b7abc7]">
            {activeSeason === 'christmas'
              ? 'Festive holiday equipment and frosty cosmetics are available through winter.'
              : 'Autumn & Halloween seasonal equipment is active now. Christmas collection unlocks automatically on December 1.'}
          </p>
        </div>
        <p className="font-mono-num text-sm font-bold text-[#e8b84b]">{save.gold} Gold</p>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-[#f4f4f8]">Seasonal Equipment</h3>
        {activeGear.map((item) => {
          const owned = save.owned.includes(item.id);
          return (
            <div key={item.id} className="flex items-center gap-3.5 rounded-2xl bg-[#222229] p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#18181c] p-1">
                <GearIcon sprite={item.sprite} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#f4f4f8]">{item.name}</p>
                <p className="font-mono-num text-xs text-[#a2a2b3]">
                  {item.slot} · Seasonal ·{' '}
                  {Object.entries(item.stats)
                    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                    .join(' · ')}
                </p>
              </div>
              {owned ? (
                <span className="px-3 text-xs font-bold text-[#26a66c]">Owned</span>
              ) : (
                <button
                  type="button"
                  disabled={save.gold < item.cost}
                  onClick={() => onBuyItem(item.id)}
                  className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] hover:bg-[#deb978] disabled:opacity-40 whitespace-nowrap"
                >
                  {item.cost} Gold
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeCosmetics.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#f4f4f8]">Seasonal Cosmetics</h3>
          {activeCosmetics.map((c) => {
            const owned = save.ownedCosmetics.includes(c.id);
            const active = save.activeCosmetics[c.type] === c.id;
            return (
              <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#222229] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#18181c] text-xl text-[#9b7bf0]">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#f4f4f8]">{c.name}</p>
                    <p className="text-xs text-[#a2a2b3]">{c.type} · Seasonal</p>
                  </div>
                </div>
                {owned ? (
                  <button
                    type="button"
                    onClick={() => onActivateCosmetic(c.id)}
                    className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold ${
                      active ? 'bg-[#26a66c] text-[#0c261a]' : 'bg-[#2b2a34] text-[#f4f4f8]'
                    }`}
                  >
                    {active ? 'Active' : 'Equip'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={save.gold < c.cost}
                    onClick={() => onBuyCosmetic(c.id)}
                    className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] disabled:opacity-40 whitespace-nowrap"
                  >
                    {c.cost} Gold
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming / Off-Season Preview */}
      <div className="space-y-2.5 rounded-2xl border border-dashed border-[#3a3947] bg-[#1a1a22] p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#d3d2de]">{upcomingLabel}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8c8ca1]">
            <Lock className="h-3.5 w-3.5" />
            Preview
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {upcomingGear.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#222229]/70 p-2.5 opacity-80">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#15151a] p-1">
                <GearIcon sprite={item.sprite} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#e6e5f0]">{item.name}</p>
                <p className="font-mono-num truncate text-[11px] text-[#8c8ca1]">
                  {item.slot} ·{' '}
                  {Object.entries(item.stats)
                    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                    .join(' · ')}
                </p>
              </div>
              <span className="font-mono-num text-[11px] font-bold text-[#e8b84b]">{item.cost}G</span>
            </div>
          ))}
          {upcomingCosmetics.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl bg-[#222229]/70 p-2.5 opacity-80">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#15151a] text-lg text-[#9b7bf0]">
                {c.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#e6e5f0]">{c.name}</p>
                <p className="text-[11px] text-[#8c8ca1]">{c.type} · Cosmetic</p>
              </div>
              <span className="font-mono-num text-[11px] font-bold text-[#e8b84b]">{c.cost}G</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestShopSection({ save, onBuy }: { save: HeroSave; onBuy: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#2e2d38] pb-3">
        <p className="text-sm text-[#a2a2b3]">Consumables that take effect immediately.</p>
        <p className="font-mono-num text-sm font-bold text-[#e8b84b]">{save.gold} Gold</p>
      </div>
      {QUEST_SHOP.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#222229] p-4">
          <div>
            <p className="text-sm font-bold text-[#f4f4f8]">{item.name}</p>
            <p className="mt-0.5 text-xs text-[#a2a2b3]">{item.desc}</p>
          </div>
          <button
            type="button"
            disabled={save.gold < item.cost}
            onClick={() => onBuy(item.id)}
            className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] hover:bg-[#deb978] disabled:opacity-40 whitespace-nowrap"
          >
            {item.cost} Gold
          </button>
        </div>
      ))}
    </div>
  );
}

function CosmeticShopSection({
  save,
  shop,
  onBuy,
  onActivate,
}: {
  save: HeroSave;
  shop: 'Customization Shop' | 'Time Traveler Shop';
  onBuy: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  const list = COSMETICS.filter((c) => c.shop === shop);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#2e2d38] pb-3">
        <p className="text-sm text-[#a2a2b3]">Portrait frames and pixel badges for your avatar.</p>
        <p className="font-mono-num text-sm font-bold text-[#e8b84b]">{save.gold} Gold</p>
      </div>
      {list.map((c) => {
        const owned = save.ownedCosmetics.includes(c.id);
        const active = save.activeCosmetics[c.type] === c.id;
        return (
          <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#222229] p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#18181c] text-xl text-[#9b7bf0]">
                {c.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-[#f4f4f8]">{c.name}</p>
                <p className="text-xs text-[#a2a2b3]">{c.type} · Cosmetic</p>
              </div>
            </div>
            {owned ? (
              <button
                type="button"
                onClick={() => onActivate(c.id)}
                className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold ${
                  active
                    ? 'bg-[#26a66c] text-[#0c261a]'
                    : 'bg-[#2b2a34] text-[#f4f4f8]'
                }`}
              >
                {active ? 'Active' : 'Equip'}
              </button>
            ) : (
              <button
                type="button"
                disabled={save.gold < c.cost}
                onClick={() => onBuy(c.id)}
                className="font-mono-num min-h-[40px] rounded-xl bg-[#cfa969] px-4 py-2 text-xs font-bold text-[#24190f] disabled:opacity-40 whitespace-nowrap"
              >
                {c.cost} Gold
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FriendsSection({
  save,
  onAdd,
  onRemove,
}: {
  save: HeroSave;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#222229] p-4">
        <p className="text-xs text-[#a2a2b3]">
          Keep a local roster of friends for your guild. Stored privately on this device.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="min-h-[40px] rounded-xl bg-[#9b7bf0] px-4 py-2 text-xs font-bold text-[#14111c]"
        >
          + Add Friend
        </button>
      </div>
      {save.friends.length > 0 ? (
        <div className="space-y-2">
          {save.friends.map((name, idx) => (
            <div key={`${name}-${idx}`} className="flex items-center justify-between rounded-xl bg-[#222229] p-3.5">
              <span className="text-sm font-bold text-[#f4f4f8]">✦ {name}</span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="min-h-[38px] rounded-lg bg-[#2b2a34] px-3 py-1.5 text-xs font-bold text-[#d3d2de] hover:bg-[#363542]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#3d3c4c] p-5 text-center text-sm text-[#a2a2b3]">
          Your local friends roster is empty.
        </p>
      )}
    </div>
  );
}

function AchievementsSection({ save }: { save: HeroSave }) {
  const onboarding = getOnboardingTasks(save);
  const onboardingBadgeMap: Record<string, { badge: AchievementBadgeId; doneText: string; todoText: string }> = {
    'create-task': {
      badge: 'onb-create',
      doneText: 'Created their first task.',
      todoText: 'Add your first Habit or To-Do.',
    },
    'complete-task': {
      badge: 'onb-complete',
      doneText: 'Completed their first task.',
      todoText: 'Check off any Habit or To-Do.',
    },
    'hatch-pet': {
      badge: 'onb-hatch',
      doneText: 'Hatched their first pet.',
      todoText: 'Hatch an egg in Pets & Companions.',
    },
    'feed-pet': {
      badge: 'onb-feed',
      doneText: 'Fed their first pet.',
      todoText: 'Feed any pet a treat in Pets.',
    },
    'buy-gear': {
      badge: 'onb-gear',
      doneText: 'Purchased their first piece of equipment.',
      todoText: 'Buy gear from Market or Seasonal Shop.',
    },
  };
  const onboardingDoneCount = onboarding.filter((t) => t.done).length;

  const maxStreak = save.habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
  const basicList: {
    id: string;
    badge: AchievementBadgeId;
    title: string;
    desc: string;
    unlocked: boolean;
  }[] = [
    {
      id: 'streak',
      badge: 'streak',
      title: `${maxStreak} Streak Achievement${maxStreak === 1 ? '' : 's'}`,
      desc: `Reached ${maxStreak} / 7 day streak on a habit`,
      unlocked: maxStreak >= 7,
    },
    {
      id: 'clean',
      badge: 'clean',
      title: `${save.cleanDays} Clean Day${save.cleanDays === 1 ? '' : 's'}`,
      desc: `Completed ${save.cleanDays} / 3 clean day rollovers`,
      unlocked: save.cleanDays >= 3,
    },
    {
      id: 'boss',
      badge: 'boss',
      title: 'Boss Slayer',
      desc: save.bossWins > 0 ? `Defeated ${save.bossWins} Raid Boss(es).` : 'Defeat your first Raid Boss.',
      unlocked: save.bossWins > 0,
    },
    {
      id: 'lvl5',
      badge: 'lvl5',
      title: 'Seasoned Hero',
      desc: save.level >= 5 ? 'Reached Hero Level 5.' : `Hero Level ${save.level} / 5.`,
      unlocked: save.level >= 5,
    },
    {
      id: 'lvl10',
      badge: 'lvl10',
      title: 'Awakened Class',
      desc: save.level >= 10 ? 'Unlocked Class Skills at Level 10.' : `Hero Level ${save.level} / 10.`,
      unlocked: save.level >= 10,
    },
    {
      id: 'pets',
      badge: 'pets',
      title: 'Companion Keeper',
      desc: `Collected ${save.pets.length} / 3 unique companions.`,
      unlocked: save.pets.length >= 3,
    },
    {
      id: 'guild',
      badge: 'guild',
      title: 'Guild Founder',
      desc: save.guild.name ? `Founded guild ${save.guild.name}.` : 'Found your own Guild Citadel.',
      unlocked: Boolean(save.guild.name),
    },
    {
      id: 'challenge',
      badge: 'challenge',
      title: 'Challenge Champion',
      desc: Object.values(save.challenges).some((c) => c.claimed)
        ? 'Completed and claimed a Realm Challenge.'
        : 'Finish any Realm Challenge.',
      unlocked: Object.values(save.challenges).some((c) => c.claimed),
    },
    {
      id: 'equipped',
      badge: 'equipped',
      title: 'Equipped Adventurer',
      desc: `Equipped ${Object.keys(save.equipped).length} / 3 gear slots.`,
      unlocked: Object.keys(save.equipped).length >= 3,
    },
  ];
  const basicDoneCount = basicList.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Onboarding Achievements */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#f4f4f8]">Onboarding Achievements</h2>
          <span className="font-mono-num grid h-6 min-w-[24px] place-items-center rounded-full bg-[#24242f] px-2 text-xs font-bold text-[#d3d2de]">
            {onboardingDoneCount}
          </span>
        </div>
        <div className="space-y-2.5">
          {onboarding.map((t) => {
            const meta = onboardingBadgeMap[t.id] || {
              badge: 'onb-create' as AchievementBadgeId,
              doneText: t.hint,
              todoText: t.hint,
            };
            return (
              <div
                key={t.id}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-colors ${
                  t.done
                    ? 'border-[#384254] bg-[#20222b]'
                    : 'border-white/[0.04] bg-[#1a1a22] opacity-65'
                }`}
              >
                <AchievementBadgeIcon badge={meta.badge} unlocked={t.done} className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#f4f4f8]">{t.title}</p>
                  <p className="mt-0.5 text-xs text-[#9c9cb0]">
                    {t.done ? meta.doneText : meta.todoText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Basic Achievements */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#f4f4f8]">Basic Achievements</h2>
          <span className="font-mono-num grid h-6 min-w-[24px] place-items-center rounded-full bg-[#24242f] px-2 text-xs font-bold text-[#d3d2de]">
            {basicDoneCount}
          </span>
        </div>
        <div className="space-y-2.5">
          {basicList.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-colors ${
                a.unlocked
                  ? 'border-[#615232] bg-[#232026]'
                  : 'border-white/[0.04] bg-[#1a1a22] opacity-75'
              }`}
            >
              <AchievementBadgeIcon badge={a.badge} unlocked={a.unlocked} className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#f4f4f8]">{a.title}</p>
                <p className="mt-0.5 text-xs text-[#9c9cb0]">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FocusSection({
  save,
  onToggle,
  onOpenRewards,
}: {
  save: HeroSave;
  onToggle: (cat: string, checked: boolean) => void;
  onOpenRewards: () => void;
}) {
  const categories = ['adult content', 'social media', 'short videos', 'games', 'news'];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#222229] p-5">
        <h2 className="text-base font-bold text-[#f4f4f8]">Restriction Planner</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#a2a2b3]">
          Select categories you intend to limit. Standalone browser apps cannot enforce OS-level blocking outside the browser; this tracks your commitment alongside your break allowance.
        </p>
        <div className="mt-4 space-y-2">
          {categories.map((cat) => {
            const checked = save.selectedRestrictions.includes(cat);
            return (
              <label
                key={cat}
                className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl bg-[#18181c] px-4 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(cat, e.target.checked)}
                  className="h-4 w-4 accent-[#9b7bf0]"
                />
                <span className="text-sm capitalize text-[#f4f4f8]">{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenRewards}
        className="min-h-[44px] rounded-xl bg-[#222229] px-5 py-2 text-sm font-bold text-[#f4f4f8] hover:bg-[#2b2a34]"
      >
        Open Rewards Allowance
      </button>
    </div>
  );
}

function SettingsSection({
  save,
  onToggleSound,
  onReplay,
  onExport,
  onImport,
  onGoStart,
  onReset,
}: {
  save: HeroSave;
  onToggleSound: (enabled: boolean) => void;
  onReplay: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onGoStart: () => void;
  onReset: () => void;
}) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="divide-y divide-[#2d2c37] rounded-2xl bg-[#222229]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-[#f4f4f8]">16-Bit Sound Effects</p>
          <p className="text-xs text-[#a2a2b3]">Play subtle synthesized chimes on quest completions and level ups.</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleSound(!save.soundEnabled)}
          className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold ${
            save.soundEnabled
              ? 'bg-[#26a66c] text-[#0c261a]'
              : 'bg-[#2b2a34] text-[#a2a2b3]'
          }`}
        >
          {save.soundEnabled ? 'Sound: On' : 'Sound: Off'}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-[#f4f4f8]">Revisit Merlin</p>
          <p className="text-xs text-[#a2a2b3]">Replay onboarding without losing your habits, pets, or stats.</p>
        </div>
        <button
          type="button"
          onClick={onReplay}
          className="min-h-[40px] rounded-xl bg-[#2b2a34] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#353440]"
        >
          Replay Onboarding
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-[#f4f4f8]">Save Backup</p>
          <p className="text-xs text-[#a2a2b3]">Export or import an ARCANA JSON save file.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            className="min-h-[40px] rounded-xl bg-[#2b2a34] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#353440]"
          >
            Export JSON
          </button>
          <label className="inline-flex min-h-[40px] cursor-pointer items-center rounded-xl bg-[#2b2a34] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#353440]">
            Import JSON
            <input type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-[#f4f4f8]">Title Screen</p>
          <p className="text-xs text-[#a2a2b3]">Return to the ARCANA welcome screen.</p>
        </div>
        <button
          type="button"
          onClick={onGoStart}
          className="min-h-[40px] rounded-xl bg-[#2b2a34] px-4 py-2 text-xs font-bold text-[#f4f4f8] hover:bg-[#353440]"
        >
          Go to Start
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-[#e25f5f]">Reset All Progress</p>
          <p className="text-xs text-[#a2a2b3]">Permanently erase this browser&apos;s save file.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[40px] rounded-xl bg-[#6e2a38] px-4 py-2 text-xs font-bold text-[#ffe8ed] hover:bg-[#873446]"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
