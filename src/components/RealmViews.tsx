import { useState, type ChangeEvent } from 'react';
import {
  Award,
  BarChart3,
  CalendarCheck2,
  Check,
  Crown,
  Dumbbell,
  Flame,
  GitBranch,
  Globe,
  Home,
  Lock,
  Map as MapIcon,
  Package,
  Paintbrush,
  PawPrint,
  Pencil,
  Pin,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Store,
  Swords,
  Tag,
  X,
} from 'lucide-react';
import {
  CHALLENGES,
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
  WORLD_REGIONS,
  type AppLanguage,
  type EquipSlot,
  type HeroSave,
  type HomeRoomId,
  type OwnedPet,
  type RealmSection,
} from '../types/arcana';
import {
  calcStats,
  formatPetPerkTags,
  getActivePet,
  getBossForWins,
  getBossMaxHp,
  getDailyDealGear,
  getDiscountedCost,
  getHomeBonuses,
  getMarketItemPrice,
  getMerlinMarketQuote,
  getOnboardingTasks,
  getPetPerkEffects,
  getPetStageLabel,
  getPetStatBonus,
  getSkillTreeBonuses,
  isSunday,
  maxHp,
  maxMp,
  xpNeeded,
  type RegionEncounterResult,
} from '../engine/game';
import { getRealmSectionTitle, getT } from '../i18n/translations';
import {
  AchievementBadgeIcon,
  BossSprite,
  ChallengeBadgeIcon,
  GearIcon,
  HeroAvatar,
  MarketSupplyIcon,
  MerlinAvatar,
  PetEggIcon,
  PetSprite,
  SkillBadgeIcon,
} from './PixelSprite';
import { AnalyticsSection, SkillTreeSection, WeeklyReviewSection } from './GrowthAnalyticsViews';
import { HomeSection, WorldMapSection } from './WorldHomeViews';
import { PWAInstallButton } from './PwaControls';
import type { AchievementBadgeId, ChallengeBadgeId } from '../sprites/worldSprites';

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
  onHatchEgg: () => OwnedPet | null | undefined;
  onFeedPet: (petId: string) => void;
  onBuyPetTreats: () => void;
  onSetActivePet: (petId: string | null) => void;
  onRenamePet: (petId: string, nickname: string) => void;
  onOpenResolveDay: () => void;
  onJoinChallenge: (id: string) => void;
  onClaimChallenge: (id: string) => void;
  onUnlockSkillNode: (nodeId: string) => void;
  onTravelRegion: (regionId: string) => void;
  onExploreRegion: (regionId: string) => RegionEncounterResult | undefined;
  onUpgradeHomeRoom: (roomId: HomeRoomId) => void;
  onBuyHomeFurniture: (id: string) => void;
  onRenameHome: (name: string) => void;
  onEvaluateWeeklyBoss: () => void;
  onSaveWeeklyReview: (goals: string[]) => void;
  onBuyItem: (id: string) => void;
  onBuyQuestItem: (id: string) => void;
  onBuyCosmetic: (id: string) => void;
  onActivateCosmetic: (id: string) => void;
  onToggleSound: (enabled: boolean) => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onReplayOnboarding: () => void;
  onExportSave: () => void;
  onImportSave: (file: File) => void;
  onGoStart: () => void;
  onOpenResetConfirm: () => void;
}

export function RealmViews(props: RealmViewsProps) {
  const { save, section, onBack } = props;
  const lang = save.language || 'en';
  const t = getT(lang);
  const activePet = save.pets.find((p) => p.id === save.activePetId) || null;

  if (!section) {
    const activeSeason = getActiveSeason();
    const currentRegion =
      WORLD_REGIONS.find((r) => r.id === save.world.currentRegionId)?.name || 'Whispering Woods';

    const growthGroup: { name: RealmSection; icon: typeof Sparkles; subtitle?: string; badge?: string }[] = [
      {
        name: 'Skill Tree',
        icon: GitBranch,
        subtitle:
          lang === 'de'
            ? 'Wissen · Stärke · Disziplin · Achtsamkeit'
            : 'Knowledge · Strength · Discipline · Mindfulness',
        badge: save.skillTree.skillPoints > 0 ? `${save.skillTree.skillPoints} SP` : undefined,
      },
      {
        name: 'Stats',
        icon: Dumbbell,
        subtitle:
          lang === 'de'
            ? `Level ${save.level} · Klasse, Gear, Baum & Haus`
            : `Level ${save.level} · Class, Gear, Tree & Home`,
      },
      { name: 'Skills', icon: Sparkles },
      { name: 'Achievements', icon: Award },
    ];

    const worldGroup: { name: RealmSection; icon: typeof Sparkles; subtitle?: string; badge?: string }[] = [
      { name: 'World Map', icon: MapIcon, subtitle: currentRegion },
      { name: 'My Home', icon: Home, subtitle: save.home.houseName },
      {
        name: 'Boss',
        icon: Flame,
        subtitle: lang === 'de' ? 'Raid-Boss & Kampfprotokoll' : 'Raid Boss & Combat Log',
      },
      { name: 'Challenges', icon: Crown },
    ];

    const insightsGroup: { name: RealmSection; icon: typeof Sparkles; subtitle?: string; badge?: string }[] = [
      {
        name: 'Analytics',
        icon: BarChart3,
        subtitle: lang === 'de' ? 'Heatmap · Erfolgsrate · Quest-XP' : 'Heatmap · Success Rate · Quest XP',
      },
      {
        name: 'Weekly Review',
        icon: CalendarCheck2,
        subtitle:
          lang === 'de'
            ? 'Sonntags-Rückblick & Top 3 Wochenziele'
            : 'Sunday Reflection & Top 3 Next-Week Goals',
        badge: isSunday() && save.weeklyReview.lastReviewedWeek === '' ? (lang === 'de' ? 'Bereit' : 'Ready') : undefined,
      },
    ];

    const gearShopGroup: { name: RealmSection | 'Avatar Customization'; icon: typeof Store; subtitle?: string; badge?: string }[] = [
      { name: 'Equipment', icon: Swords },
      { name: 'Avatar Customization', icon: Paintbrush },
      { name: 'Pets', icon: PawPrint },
      {
        name: 'Market',
        icon: Store,
        subtitle: lang === 'de' ? 'Ausrüstung · Truhen · Kosmetik · Saisonales' : 'Gear · Chests · Cosmetics · Seasonal · Time Vault',
        badge: activeSeason === 'christmas' ? (lang === 'de' ? 'Winter-Event' : 'Winter Event') : (lang === 'de' ? 'Herbst-Event' : 'Fall Event'),
      },
    ];

    const handleRowClick = (name: RealmSection | 'Avatar Customization') => {
      if (name === 'Avatar Customization') {
        props.onOpenAvatarEdit();
      } else {
        props.onOpenSection(name);
      }
    };

    const handleTag = save.name.toLowerCase().replace(/[^a-z0-9_]+/g, '') || 'hero';

    const renderGroup = (
      rows: { name: RealmSection | 'Avatar Customization'; icon: typeof Sparkles; subtitle?: string; badge?: string }[]
    ) => (
      <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-[#18181b]">
        {rows.map((row) => {
          const Icon = row.icon;
          const displayTitle =
            row.name === 'Avatar Customization'
              ? lang === 'de'
                ? 'Avatar anpassen'
                : 'Avatar Customization'
              : getRealmSectionTitle(row.name, lang);
          return (
            <button
              key={row.name}
              type="button"
              onClick={() => handleRowClick(row.name)}
              className="flex min-h-[54px] w-full items-center gap-3.5 px-4 py-3 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[#202024]"
            >
              <Icon className="h-[18px] w-[18px] shrink-0 text-[#8e8e93]" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#f5f5f7]">
                  {displayTitle}
                </p>
                {row.subtitle && <p className="truncate text-xs text-[#8e8e93]">{row.subtitle}</p>}
              </div>
              {row.badge && (
                <span className="font-mono-num shrink-0 rounded-full border border-white/[0.08] bg-[#27272c] px-2.5 py-0.5 text-[11px] font-semibold text-[#f5f5f7]">
                  {row.badge}
                </span>
              )}
              <span className="text-sm text-[#636369]" aria-hidden="true">
                ›
              </span>
            </button>
          );
        })}
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Compact Top Realm Bar */}
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
              classNameWrapper="h-11 w-11 shrink-0 rounded-xl border border-white/[0.1]"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-tight text-[#f5f5f7]">{save.name}</p>
              <p className="truncate text-xs text-[#8e8e93]">@{handleTag}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <PWAInstallButton lang={lang} variant="compact" />
            <button
              type="button"
              onClick={() => props.onOpenSection('Settings')}
              aria-label={t.settings}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-[#18181b] text-[#8e8e93] transition-colors hover:bg-[#242429] hover:text-[#f5f5f7]"
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {renderGroup(growthGroup)}
        {renderGroup(worldGroup)}
        {renderGroup(insightsGroup)}
        {renderGroup(gearShopGroup)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.backToRealm}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#18181b] text-xl text-[#f5f5f7] transition-colors hover:bg-[#242429]"
        >
          ‹
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">{t.realmTitle}</p>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
            {getRealmSectionTitle(section, lang)}
          </h1>
        </div>
      </div>

      {section === 'Profile' && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-6 text-center">
          <HeroAvatar
            avatar={save.avatar}
            className={save.className}
            equipped={save.equipped}
            costume={save.costume}
            costumeMode={save.costumeMode}
            activeCosmetics={save.activeCosmetics}
            activePet={activePet}
            classNameWrapper="mx-auto aspect-[3/4] w-48 rounded-2xl border border-white/[0.1]"
          />
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">{save.name}</h2>
          <p className="mt-1 text-sm text-[#8e8e93]">
            Level {save.level} · {save.className} · {save.home.houseName}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={props.onOpenAvatarEdit}
              className="min-h-[42px] rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-white"
            >
              Customize Character
            </button>
            <button
              type="button"
              onClick={props.onOpenClassSwitch}
              className="min-h-[42px] rounded-full border border-white/[0.1] bg-[#202024] px-5 py-2 text-xs font-semibold text-[#f5f5f7] transition-colors hover:bg-[#2a2a30]"
            >
              Switch Class
            </button>
          </div>
        </div>
      )}

      {section === 'Skill Tree' && (
        <SkillTreeSection save={save} onUnlockNode={props.onUnlockSkillNode} />
      )}
      {section === 'World Map' && (
        <WorldMapSection
          save={save}
          onTravel={props.onTravelRegion}
          onExplore={props.onExploreRegion}
        />
      )}
      {section === 'My Home' && (
        <HomeSection
          save={save}
          onUpgradeRoom={props.onUpgradeHomeRoom}
          onBuyFurniture={props.onBuyHomeFurniture}
          onRenameHome={props.onRenameHome}
        />
      )}
      {section === 'Analytics' && <AnalyticsSection save={save} />}
      {section === 'Weekly Review' && (
        <WeeklyReviewSection
          save={save}
          onEvaluateBoss={props.onEvaluateWeeklyBoss}
          onSaveReview={props.onSaveWeeklyReview}
        />
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
          onRenamePet={props.onRenamePet}
        />
      )}
      {section === 'Boss' && (
        <BossSection
          save={save}
          onOpenResolve={props.onOpenResolveDay}
        />
      )}
      {section === 'Challenges' && (
        <ChallengesSection save={save} onJoin={props.onJoinChallenge} onClaim={props.onClaimChallenge} />
      )}
      {section === 'Market' && (
        <MarketSection
          save={save}
          onBuy={props.onBuyItem}
          onBuyQuestItem={props.onBuyQuestItem}
          onEquipItem={props.onEquipItem}
          onBuyCosmetic={props.onBuyCosmetic}
          onActivateCosmetic={props.onActivateCosmetic}
        />
      )}
      {section === 'Achievements' && <AchievementsSection save={save} />}
      {section === 'Settings' && (
        <SettingsSection
          save={save}
          onToggleSound={props.onToggleSound}
          onChangeLanguage={props.onChangeLanguage}
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#111114]">
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatsSection({ save }: { save: HeroSave }) {
  const st = calcStats(save);
  const classBonus = CLASS_BONUS[save.className];
  const petStats = getPetStatBonus(save);
  const treeStats = getSkillTreeBonuses(save).stats;
  const homeStats = getHomeBonuses(save).stats;
  const activePet = getActivePet(save);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <h2 className="mb-4 text-base font-semibold text-[#f5f5f7]">Vital Signs</h2>
        <div className="space-y-3.5">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-[#f5f5f7]">HP</span>
              <span className="font-mono-num text-[#ff6961]">
                {save.hp} / {maxHp(save.level)}
              </span>
            </div>
            <MeterBar value={save.hp} max={maxHp(save.level)} color="bg-gradient-to-r from-[#ff453a] to-[#ff6961]" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-[#f5f5f7]">EXP</span>
              <span className="font-mono-num text-[#ffd60a]">
                {save.xp} / {xpNeeded(save.level)}
              </span>
            </div>
            <MeterBar value={save.xp} max={xpNeeded(save.level)} color="bg-gradient-to-r from-[#d49b2a] to-[#f5c249]" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-[#f5f5f7]">MP</span>
              <span className="font-mono-num text-[#64d2ff]">
                {save.level < 10 ? 'Unlocks at level 10' : `${save.mp} / ${maxMp(save.level)}`}
              </span>
            </div>
            <MeterBar value={save.level < 10 ? 0 : save.mp} max={maxMp(save.level)} color="bg-gradient-to-r from-[#0a84ff] to-[#64d2ff]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['str', 'def', 'int', 'agi'] as const).map((k) => (
          <div key={k} className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">{k}</p>
            <p className="font-mono-num mt-1 text-3xl font-semibold text-[#f5f5f7]">{st[k]}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#636369]">
              Class +{classBonus[k]}
              {petStats[k] > 0 ? ` · Pet +${petStats[k]}` : ''}
              {treeStats[k] > 0 ? ` · Tree +${treeStats[k]}` : ''}
              {homeStats[k] > 0 ? ` · Home +${homeStats[k]}` : ''}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[#8e8e93]">
        STR increases Boss damage. DEF reduces HP lost from missed habits. INT boosts MP recovery. AGI increases Gold earned from quests.
        {activePet ? ` Active companion ${activePet.nickname || activePet.name} also grants passive perks.` : ''}
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
      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <span className="text-4xl" style={{ color: CLASS_COLORS[save.className] }}>
          {CLASS_GLYPHS[save.className]}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[#f5f5f7]">{save.className} Skills</h2>
          <p className="font-mono-num text-xs text-[#8e8e93]">
            {save.level < 10 ? 'Locked until level 10' : `${save.mp} / ${maxMp(save.level)} MP available`}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {CLASS_SKILLS[save.className].map(([name, cost, desc], idx) => (
          <div
            key={name}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111114] p-1.5">
                <SkillBadgeIcon
                  skillName={name}
                  classColor={CLASS_COLORS[save.className]}
                  locked={save.level < 10}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#f5f5f7]">{name}</p>
                  <span className="font-mono-num rounded-md bg-[#202024] px-2 py-0.5 text-[11px] font-semibold text-[#e8b84b]">
                    {cost} MP
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8e8e93]">{desc}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={save.level < 10 || save.mp < cost}
              onClick={() => onCast(idx)}
              className="min-h-[40px] shrink-0 rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-semibold text-[#111113] transition-colors hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369]"
            >
              {save.level < 10 ? 'Locked' : 'Cast Skill'}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSwitch}
        className="min-h-[40px] rounded-full border border-white/[0.08] bg-[#18181b] px-4 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#202024]"
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
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HeroAvatar
              avatar={save.avatar}
              className={save.className}
              equipped={save.equipped}
              costume={save.costume}
              costumeMode={save.costumeMode}
              activeCosmetics={save.activeCosmetics}
              classNameWrapper="h-24 w-[72px] shrink-0 rounded-xl border border-white/[0.1]"
            />
            <div>
              <p className="text-sm font-semibold text-[#f5f5f7]">
                Costume Mode {save.costumeMode ? '(Vanity Active)' : '(Battle Gear Visible)'}
              </p>
              <p className="mt-0.5 text-xs text-[#8e8e93]">
                Equipped items render directly onto your pixel avatar.
              </p>
              <p className="font-mono-num mt-2 text-xs font-semibold text-[#d1d1d6]">
                STR {st.str} · DEF {st.def} · INT {st.int} · AGI {st.agi}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleCostume(!save.costumeMode)}
            className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              save.costumeMode
                ? 'bg-[#30d158] text-[#0b2312]'
                : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
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
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3 text-center transition-colors hover:bg-[#202024]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#111114] p-1.5">
                {item ? (
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                ) : (
                  <Package className="h-5 w-5 text-[#636369]" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#f5f5f7]">{slot}</p>
                <p className="mt-0.5 text-[11px] text-[#8e8e93]">{item ? item.name : 'Empty'}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#f5f5f7]">Owned Equipment</h2>
        <div className="space-y-2">
          {save.owned.map((id) => {
            const item = ITEMS.find((i) => i.id === id);
            if (!item) return null;
            const equippedHere = activeMap[item.slot] === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#111114] p-1">
                  <GearIcon sprite={item.sprite} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f5f5f7]">{item.name}</p>
                  <p className="font-mono-num text-xs text-[#8e8e93]">
                    {item.slot} ·{' '}
                    {Object.entries(item.stats)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEquipItem(item.id)}
                  className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    equippedHere
                      ? 'bg-[#f5f5f7] text-[#111113]'
                      : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
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
  onRenamePet,
}: {
  save: HeroSave;
  onHatch: () => OwnedPet | null | undefined;
  onFeedPet: (petId: string) => void;
  onBuyTreats: () => void;
  onSetActivePet: (id: string | null) => void;
  onRenamePet: (petId: string, nickname: string) => void;
}) {
  const lang = save.language || 'en';
  const de = lang === 'de';
  const [rosterFilter, setRosterFilter] = useState<string>('All');
  const [compendiumFilter, setCompendiumFilter] = useState<string>('All');
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>('');
  const [lastHatched, setLastHatched] = useState<OwnedPet | null>(null);

  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as const;
  const activePet = save.pets.find((p) => p.id === save.activePetId) || null;
  const treatCost = getDiscountedCost(save, 15);
  const discoveredSprites = new Set(save.pets.map((p) => p.sprite));

  const rarityWeight: Record<string, number> = {
    Legendary: 5,
    Epic: 4,
    Rare: 3,
    Uncommon: 2,
    Common: 1,
  };

  const sortedPets = [...save.pets].sort((a, b) => {
    if (a.id === save.activePetId) return -1;
    if (b.id === save.activePetId) return 1;
    const lvlDiff = (b.level || 1) - (a.level || 1);
    if (lvlDiff !== 0) return lvlDiff;
    return (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0);
  });

  const filteredRoster = sortedPets.filter(
    (p) => rosterFilter === 'All' || p.rarity === rosterFilter
  );

  const filteredCompendium = PETS.filter(
    (p) => compendiumFilter === 'All' || p.rarity === compendiumFilter
  );

  const handleHatch = () => {
    const hatched = onHatch();
    if (hatched) {
      setLastHatched(hatched);
    }
  };

  const startRename = (pet: OwnedPet) => {
    setEditingPetId(pet.id);
    setNameDraft(pet.nickname || pet.name);
  };

  const submitRename = (petId: string) => {
    onRenamePet(petId, nameDraft);
    setEditingPetId(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Active Companion Sanctuary Stage */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        {activePet ? (
          (() => {
            const rarityStyle = getPetRarityStyle(activePet.rarity);
            const petLevel = activePet.level || 1;
            const feedCount = activePet.feedCount ?? Math.max(0, (petLevel - 1) * 2);
            const treatsIntoLevel = feedCount % 2;
            const treatsLeft = 2 - treatsIntoLevel;
            const perk = getPetPerkEffects(activePet);
            const perkTags = formatPetPerkTags(perk);
            const stageLabel = getPetStageLabel(petLevel, lang);
            const displayName = activePet.nickname || activePet.name;

            return (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  {/* Sanctuary Pedestal */}
                  <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-[#111114]">
                    <div
                      className="pointer-events-none absolute inset-2 rounded-full"
                      style={{ background: rarityStyle.auraBg }}
                    />
                    <div className="pointer-events-none absolute bottom-3 h-2.5 w-16 rounded-full bg-black/50 blur-[2px]" />
                    <PetSprite
                      pet={activePet}
                      rarity={activePet.rarity}
                      className="relative h-20 w-20"
                    />
                  </div>

                  {/* Identity, Evolution & Level Progress */}
                  <div className="min-w-0 text-center sm:text-left">
                    {editingPetId === activePet.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitRename(activePet.id);
                        }}
                        className="flex items-center justify-center gap-2 sm:justify-start"
                      >
                        <input
                          type="text"
                          maxLength={24}
                          autoFocus
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          className="w-44 rounded-lg border border-white/[0.15] bg-[#111114] px-2.5 py-1 text-sm font-semibold text-[#f5f5f7] focus:border-white/40 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="min-h-[34px] rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-[#111113]"
                        >
                          {de ? 'Speichern' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPetId(null)}
                          className="min-h-[34px] rounded-full border border-white/[0.1] px-2.5 py-1 text-xs text-[#8e8e93] hover:text-[#f5f5f7]"
                        >
                          {de ? 'Abbr.' : 'Cancel'}
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                          {displayName}
                        </h2>
                        <button
                          type="button"
                          onClick={() => startRename(activePet)}
                          aria-label={de ? 'Gefährten umbenennen' : 'Rename companion'}
                          className="grid h-7 w-7 place-items-center rounded-full text-[#8e8e93] transition-colors hover:bg-white/[0.07] hover:text-[#f5f5f7]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs sm:justify-start">
                      <span className="font-semibold" style={{ color: rarityStyle.hex }}>
                        {activePet.rarity}
                      </span>
                      {activePet.nickname && activePet.nickname !== activePet.name && (
                        <>
                          <span className="text-[#636369]" aria-hidden="true">·</span>
                          <span className="text-[#8e8e93]">{activePet.name}</span>
                        </>
                      )}
                      <span className="text-[#636369]" aria-hidden="true">·</span>
                      <span className="font-mono-num font-semibold text-[#f5f5f7]">
                        Lv. {petLevel}
                      </span>
                      <span className="text-[#636369]" aria-hidden="true">·</span>
                      <span className="text-[#8e8e93]">{stageLabel}</span>
                    </div>

                    {/* Pet XP Progress */}
                    <div className="mt-3 max-w-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#8e8e93]">
                        <span>{de ? 'Nächstes Pet-Level' : 'Next Pet Level'}</span>
                        <span className="font-mono-num">
                          {treatsIntoLevel} / 2 ·{' '}
                          {de
                            ? `noch ${treatsLeft} Treat${treatsLeft === 1 ? '' : 's'}`
                            : `${treatsLeft} treat${treatsLeft === 1 ? '' : 's'} left`}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#27272c]">
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${Math.max(12, (treatsIntoLevel / 2) * 100)}%`,
                            backgroundColor: rarityStyle.hex,
                          }}
                        />
                      </div>
                    </div>

                    {/* Active Companion Perk Readout */}
                    <div className="mt-3 text-xs">
                      <span className="font-semibold text-[#f5f5f7]">{perk.title}</span>
                      <span className="mx-1.5 text-[#636369]" aria-hidden="true">·</span>
                      <span className="font-mono-num text-[#8e8e93]">
                        {perkTags.join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage Actions */}
                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                  <button
                    type="button"
                    disabled={save.petFood < 1}
                    onClick={() => onFeedPet(activePet.id)}
                    className="min-h-[40px] flex-1 whitespace-nowrap rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369] sm:flex-none"
                  >
                    {de ? `Füttern (${save.petFood})` : `Feed Treat (${save.petFood})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetActivePet(null)}
                    className="min-h-[40px] flex-1 whitespace-nowrap rounded-full border border-white/[0.1] bg-[#202024] px-5 py-2 text-xs font-semibold text-[#f5f5f7] transition-colors hover:bg-[#2a2a30] sm:flex-none"
                  >
                    {de ? 'Ausruhen' : 'Rest Companion'}
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="flex flex-col items-center justify-between gap-4 py-2 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#111114] text-[#636369]">
                <PawPrint className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#f5f5f7]">
                  {de ? 'Kein aktiver Gefährte gerufen' : 'No Active Companion Summoned'}
                </h2>
                <p className="mt-0.5 text-xs text-[#8e8e93]">
                  {save.pets.length > 0
                    ? de
                      ? 'Rufe unten einen Gefährten, damit er neben deinem Avatar kämpft und Boni gewährt.'
                      : 'Summon a companion below to walk beside your hero and activate its passive bonuses.'
                    : de
                      ? 'Brüte dein erstes Ei aus, um deinen ersten Pixel-Begleiter freizuschalten.'
                      : 'Hatch an egg below to unlock your first pixel companion.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Hatchery & Treat Pantry */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#111114]">
              <PetEggIcon className="h-11 w-11" />
            </div>
            <div>
              <p className="font-mono-num text-base font-semibold text-[#f5f5f7]">
                {save.eggs}{' '}
                {de
                  ? save.eggs === 1
                    ? 'Ei bereit'
                    : 'Eier bereit'
                  : `Mystery Egg${save.eggs === 1 ? '' : 's'}`}
              </p>
              <p className="mt-0.5 text-xs text-[#8e8e93]">
                {de
                  ? 'Duplikate schlüpfen direkt auf Lv. 2.'
                  : 'Duplicates hatch straight at Lv. 2.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={save.eggs < 1}
            onClick={handleHatch}
            className="min-h-[40px] shrink-0 whitespace-nowrap rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369]"
          >
            {de ? 'Ausbrüten' : 'Hatch Egg'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#111114]">
              <MarketSupplyIcon id="pet-treats" className="h-10 w-10" />
            </div>
            <div>
              <p className="font-mono-num text-base font-semibold text-[#f5f5f7]">
                {save.petFood}{' '}
                {de ? 'Leckerli' : `Pet Treat${save.petFood === 1 ? '' : 's'}`}
              </p>
              <p className="mt-0.5 text-xs text-[#8e8e93]">
                {de ? '+6 XP · +2 Gold · ½ Pet-Level' : '+6 XP · +2 Gold · ½ Pet Level'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={save.gold < treatCost}
            onClick={onBuyTreats}
            className="font-mono-num min-h-[40px] shrink-0 whitespace-nowrap rounded-full bg-[#d4ab5a] px-4 py-2 text-xs font-semibold text-[#1c1508] transition-colors hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369]"
          >
            +3 ({treatCost}G)
          </button>
        </div>
      </div>

      {/* Just Hatched Reveal */}
      {lastHatched && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.12] bg-[#1d1d22] p-4">
          <div className="flex items-center gap-3.5">
            <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#111114]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: getPetRarityStyle(lastHatched.rarity).auraBg }}
              />
              <PetSprite pet={lastHatched} rarity={lastHatched.rarity} className="relative h-12 w-12" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#e8b84b]">
                {de ? 'Neu geschlüpft!' : 'Newly Hatched!'}
                {(lastHatched.level || 1) >= 2
                  ? de
                    ? ' · Duplikat-Bund (Lv. 2)'
                    : ' · Duplicate Bond (Lv. 2)'
                  : ''}
              </p>
              <p className="text-sm font-semibold text-[#f5f5f7]">
                {lastHatched.name}{' '}
                <span
                  className="ml-1 text-xs font-semibold"
                  style={{ color: getPetRarityStyle(lastHatched.rarity).hex }}
                >
                  {lastHatched.rarity}
                </span>
              </p>
              <p className="font-mono-num text-xs text-[#8e8e93]">
                {formatPetPerkTags(getPetPerkEffects(lastHatched)).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {save.activePetId !== lastHatched.id && (
              <button
                type="button"
                onClick={() => onSetActivePet(lastHatched.id)}
                className="min-h-[36px] whitespace-nowrap rounded-full bg-[#30d158] px-4 py-1.5 text-xs font-semibold text-[#092110]"
              >
                {de ? 'Rufen' : 'Summon'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setLastHatched(null)}
              aria-label={de ? 'Hinweis schließen' : 'Dismiss hatch reveal'}
              className="grid h-8 w-8 place-items-center rounded-full text-[#8e8e93] hover:bg-white/[0.08] hover:text-[#f5f5f7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Owned Companions Roster */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#f5f5f7]">
              {de ? `Deine Gefährten (${save.pets.length})` : `Your Companions (${save.pets.length})`}
            </h3>
            <p className="text-xs text-[#8e8e93]">
              {de
                ? 'Ab Lv. 5 erwacht · Ab Lv. 10 erhabene Sternen-Details'
                : 'Lv. 5+ Awakened · Lv. 10+ Ascended starlight crest'}
            </p>
          </div>

          {save.pets.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#18181b] p-1">
              {rarities.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRosterFilter(r)}
                  className={`min-h-[30px] whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    rosterFilter === r
                      ? 'bg-[#2a2a30] text-[#f5f5f7]'
                      : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                  }`}
                >
                  {r === 'All' && de ? 'Alle' : r}
                </button>
              ))}
            </div>
          )}
        </div>

        {save.pets.length > 0 ? (
          filteredRoster.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRoster.map((p) => {
                const isActive = save.activePetId === p.id;
                const petLevel = p.level || 1;
                const feedCount = p.feedCount ?? Math.max(0, (petLevel - 1) * 2);
                const treatsIntoLevel = feedCount % 2;
                const rarityStyle = getPetRarityStyle(p.rarity);
                const perk = getPetPerkEffects(p);
                const perkTags = formatPetPerkTags(perk);
                const displayName = p.nickname || p.name;
                const stageLabel = getPetStageLabel(petLevel, lang);

                return (
                  <div
                    key={p.id}
                    style={{
                      borderColor: isActive ? 'rgba(48, 209, 88, 0.55)' : rarityStyle.cardBorder,
                      backgroundColor: isActive ? '#152019' : '#18181b',
                    }}
                    className="flex flex-col justify-between rounded-2xl border p-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#111114]">
                          <div
                            className="pointer-events-none absolute inset-0 rounded-xl"
                            style={{ background: rarityStyle.auraBg }}
                          />
                          <PetSprite
                            pet={p}
                            rarity={p.rarity}
                            className="relative h-14 w-14"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-[#f5f5f7]">
                              {displayName}
                            </p>
                            {isActive && (
                              <span className="shrink-0 text-[11px] font-semibold text-[#30d158]">
                                {de ? 'Aktiv' : 'Active'}
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs">
                            <span className="font-semibold" style={{ color: rarityStyle.hex }}>
                              {p.rarity}
                            </span>
                            <span className="mx-1.5 text-[#636369]" aria-hidden="true">·</span>
                            <span className="font-mono-num text-[#f5f5f7]">Lv. {petLevel}</span>
                            <span className="mx-1.5 text-[#636369]" aria-hidden="true">·</span>
                            <span className="text-[#8e8e93]">{stageLabel}</span>
                          </p>

                          {/* Compact XP bar */}
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#27272c]">
                            <div
                              className="h-full rounded-full transition-all duration-200"
                              style={{
                                width: `${treatsIntoLevel === 1 ? 50 : 12}%`,
                                backgroundColor: rarityStyle.hex,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-white/[0.06] pt-2.5 text-xs">
                        <p className="font-semibold text-[#f5f5f7]">{perk.title}</p>
                        <p className="font-mono-num mt-0.5 text-[11px] text-[#8e8e93]">
                          {perkTags.join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSetActivePet(isActive ? null : p.id)}
                        className={`min-h-[40px] flex-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#30d158] text-[#092110]'
                            : 'border border-white/[0.1] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                        }`}
                      >
                        {isActive
                          ? de
                            ? 'Begleitet ✓'
                            : 'Following ✓'
                          : de
                            ? 'Rufen'
                            : 'Summon'}
                      </button>
                      <button
                        type="button"
                        disabled={save.petFood < 1}
                        onClick={() => onFeedPet(p.id)}
                        className="min-h-[40px] flex-1 whitespace-nowrap rounded-full bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369]"
                      >
                        {de ? 'Füttern' : 'Feed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5 text-center text-xs text-[#8e8e93]">
              {de
                ? `Keine Gefährten der Seltenheit „${rosterFilter}“ vorhanden.`
                : `No ${rosterFilter} companions in your roster yet.`}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#18181b] p-6 text-center text-sm text-[#8e8e93]">
            {de
              ? 'Brüte oben dein Start-Ei aus oder besiege einen Raid-Boss, um Gefährten zu sammeln.'
              : 'Hatch your starting egg above or defeat a Raid Boss to collect companions.'}
          </div>
        )}
      </div>

      {/* 4. Visual Companion Compendium */}
      <div className="border-t border-white/[0.07] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xs flex-1">
            <h3 className="text-base font-semibold text-[#f5f5f7]">
              {de ? 'Begleiter-Kompendium' : 'Companion Compendium'}
            </h3>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono-num text-xs text-[#8e8e93]">
                {discoveredSprites.size} / {PETS.length}{' '}
                {de ? 'Spezies entdeckt' : 'species discovered'}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#27272c]">
              <div
                className="h-full rounded-full bg-[#f5f5f7] transition-all duration-200"
                style={{ width: `${(discoveredSprites.size / PETS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#18181b] p-1">
            {rarities.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCompendiumFilter(r)}
                className={`min-h-[30px] whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  compendiumFilter === r
                    ? 'bg-[#2a2a30] text-[#f5f5f7]'
                    : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                }`}
              >
                {r === 'All' && de ? 'Alle' : r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {filteredCompendium.map((p) => {
            const discovered = discoveredSprites.has(p.sprite);
            const rarityStyle = getPetRarityStyle(p.rarity);
            const perkTags = formatPetPerkTags(getPetPerkEffects({ sprite: p.sprite, level: 1 }));

            return (
              <div
                key={p.name}
                className="flex flex-col items-center rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5 text-center"
              >
                <div className="relative grid h-14 w-14 place-items-center">
                  {discovered && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{ background: rarityStyle.auraBg }}
                    />
                  )}
                  <PetSprite
                    pet={p}
                    rarity={discovered ? p.rarity : undefined}
                    silhouette={!discovered}
                    className="relative h-12 w-12"
                  />
                </div>

                <p className="mt-2 truncate text-xs font-semibold text-[#f5f5f7]">
                  {discovered ? p.name : '???'}
                </p>
                <p className="font-mono-num mt-0.5 text-[11px]">
                  <span style={{ color: rarityStyle.hex }}>{p.rarity}</span>
                  <span className="mx-1 text-[#636369]" aria-hidden="true">·</span>
                  <span className="text-[#8e8e93]">{p.weight}%</span>
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#8e8e93]">
                  {discovered
                    ? perkTags.join(' · ')
                    : de
                      ? 'Aus Eiern ausbrüten'
                      : 'Hatch from eggs'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BossSection({
  save,
  onOpenResolve,
}: {
  save: HeroSave;
  onOpenResolve: () => void;
}) {
  const boss = getBossForWins(save.bossWins);
  const maxBossHp = getBossMaxHp(save.bossWins);

  return (
    <div className="space-y-4">
      {/* Simple Raid Boss Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#e3a4a9]">
          Raid Boss · Encounter {save.bossWins + 1}
        </p>
        <div className="mx-auto my-4 h-36 max-w-xs">
          <BossSprite wins={save.bossWins} className="h-full w-full" />
        </div>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#f5f5f7]">{boss.name}</h2>
        <p className="mt-1 text-sm text-[#8e8e93]">{boss.subtitle}</p>

        <div className="mx-auto mt-5 max-w-md">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-[#d1d1d6]">Boss HP</span>
            <span className="font-mono-num font-bold text-[#f5f5f7]">
              {save.bossHp} / {maxBossHp}
            </span>
          </div>
          <MeterBar value={save.bossHp} max={maxBossHp} color="bg-gradient-to-r from-[#ff453a] to-[#ff6961]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 text-center">
          <p className="font-mono-num text-2xl font-semibold text-[#e8b84b]">{save.damageQueued}</p>
          <p className="mt-1 text-xs text-[#8e8e93]">Queued DMG</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 text-center">
          <p className="font-mono-num text-2xl font-semibold text-[#f5f5f7]">{save.bossWins}</p>
          <p className="mt-1 text-xs text-[#8e8e93]">Victories</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 text-center">
          <p className="font-mono-num text-2xl font-semibold text-[#30d158]">{save.eggs}</p>
          <p className="mt-1 text-xs text-[#8e8e93]">Eggs Ready</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <div className="max-w-md">
          <h3 className="text-base font-semibold text-[#f5f5f7]">Daily Battle Resolution</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#8e8e93]">
            Completed quests queue damage. Strike the boss whenever your day is done.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenResolve}
          className="min-h-[40px] rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111113] hover:bg-white whitespace-nowrap"
        >
          End Day &amp; Strike Boss
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-[#f5f5f7]">Combat Log</h3>
        <div className="space-y-2">
          {save.combatLog.length > 0 ? (
            save.combatLog.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#18181b] p-3.5"
              >
                <span className="text-base font-bold text-[#e8b84b]">
                  {c.type === 'victory' ? '✦' : c.type === 'hurt' ? '−' : '⚔'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f5f5f7]">{c.text}</p>
                  <p className="font-mono-num text-xs text-[#636369]">{c.day}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/[0.1] p-5 text-center text-sm text-[#8e8e93]">
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
      <p className="text-sm text-[#8e8e93]">
        Join any challenge for a 20 Gold bonus and earn its signature badge upon completion.
      </p>
      {CHALLENGES.map((c) => {
        const st = save.challenges[c.id];
        const progress = st?.progress || 0;
        const badgeCompleted = Boolean(st?.done || st?.claimed);
        return (
          <div key={c.id} className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
            <div className="flex items-start gap-4">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border bg-[#111114] p-1.5"
                style={{
                  borderColor: badgeCompleted ? `${c.color}66` : 'rgba(255,255,255,0.08)',
                }}
              >
                <ChallengeBadgeIcon
                  id={c.id as ChallengeBadgeId}
                  completed={badgeCompleted}
                  className="h-12 w-12"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-[#f5f5f7]">{c.name}</h3>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: c.color }}
                    >
                      Badge · {c.badgeName}
                    </p>
                  </div>
                  <span className="font-mono-num text-xs font-semibold text-[#e8b84b]">
                    +{c.completionXP} XP · +{c.completionGold} Gold
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#8e8e93]">{c.desc}</p>
              </div>
            </div>

            <div className="my-3.5">
              <MeterBar value={progress} max={c.target} color="bg-gradient-to-r from-[#d49b2a] to-[#f5c249]" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono-num text-xs text-[#8e8e93]">
                {progress} / {c.target}
              </span>
              {!st ? (
                <button
                  type="button"
                  onClick={() => onJoin(c.id)}
                  className="min-h-[36px] rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-semibold text-[#111113] hover:bg-white"
                >
                  Join +20 Gold
                </button>
              ) : st.claimed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30d158]">
                  <Check className="h-3.5 w-3.5" />
                  Badge Earned · Claimed
                </span>
              ) : st.done ? (
                <button
                  type="button"
                  onClick={() => onClaim(c.id)}
                  className="min-h-[36px] rounded-full bg-[#30d158] px-4 py-1.5 text-xs font-semibold text-[#092110] hover:bg-[#4cd96e]"
                >
                  Claim Badge &amp; Reward
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#8e8e93]">In Progress</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShopDiscountBanner({ save }: { save: HeroSave }) {
  if ((save.world?.merchantDiscountPct || 0) <= 0) return null;
  const t = getT(save.language);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#eab949]/35 bg-[#292214] px-3.5 py-2.5 text-xs font-semibold text-[#f3ca6b]">
      <Tag className="h-3.5 w-3.5 shrink-0" />
      <span>{t.merchantDiscountBanner}</span>
    </div>
  );
}

type MarketFilter = 'All' | 'Supplies' | 'Cosmetics' | 'Seasonal' | 'Time Traveler' | EquipSlot;

function MarketSection({
  save,
  onBuy,
  onBuyQuestItem,
  onEquipItem,
  onBuyCosmetic,
  onActivateCosmetic,
}: {
  save: HeroSave;
  onBuy: (id: string) => void;
  onBuyQuestItem: (id: string) => void;
  onEquipItem: (id: string) => void;
  onBuyCosmetic: (id: string) => void;
  onActivateCosmetic: (id: string) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<MarketFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideOwned, setHideOwned] = useState(false);

  const lang = save.language || 'en';
  const dailyDeal = getDailyDealGear();
  const dailyDealPrice = getMarketItemPrice(save, dailyDeal.id);
  const dailyDealOwned = save.owned.includes(dailyDeal.id);
  const dailyDealEquipped = save.equipped[dailyDeal.slot] === dailyDeal.id;
  const merlinQuote = getMerlinMarketQuote(save, lang);

  const featuredSupplies = QUEST_SHOP.filter((q) => q.id === 'mystery-chest' || q.id === 'healing-elixir' || q.id === 'pet-treats');
  const [selectedFeaturedKey, setSelectedFeaturedKey] = useState<string>('daily-deal');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeSeason = getActiveSeason();
  const upcomingSeason = activeSeason === 'fall' ? 'christmas' : 'fall';
  const seasonLabel = activeSeason === 'christmas' ? 'Christmas Collection' : 'Fall / Halloween Collection';
  const upcomingLabel =
    upcomingSeason === 'christmas'
      ? 'Arriving December 1 · Christmas Collection'
      : 'Returns Next Autumn · Fall / Halloween';

  const isSlotFilter = (EQUIP_SLOTS as readonly string[]).includes(categoryFilter);

  const filteredSupplies = QUEST_SHOP.filter((q) => {
    if (categoryFilter !== 'All' && categoryFilter !== 'Supplies') return false;
    if (!normalizedQuery) return true;
    return (
      q.name.toLowerCase().includes(normalizedQuery) ||
      q.desc.toLowerCase().includes(normalizedQuery) ||
      q.category.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredGear = ITEMS.filter((item) => {
    if (item.seasonal) return false;
    if (categoryFilter !== 'All' && !isSlotFilter) return false;
    if (isSlotFilter && item.slot !== categoryFilter) return false;
    if (hideOwned && save.owned.includes(item.id)) return false;
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.slot.toLowerCase().includes(normalizedQuery) ||
      item.rarity.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredSeasonalGear = ITEMS.filter((item) => {
    if (item.seasonal !== activeSeason) return false;
    if (categoryFilter !== 'All' && categoryFilter !== 'Seasonal' && !isSlotFilter) return false;
    if (isSlotFilter && item.slot !== categoryFilter) return false;
    if (hideOwned && save.owned.includes(item.id)) return false;
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.slot.toLowerCase().includes(normalizedQuery) ||
      'seasonal'.includes(normalizedQuery)
    );
  });

  const filteredSeasonalCosmetics = COSMETICS.filter((c) => {
    if (c.shop !== 'Seasonal Shop' || c.seasonal !== activeSeason) return false;
    if (categoryFilter !== 'All' && categoryFilter !== 'Seasonal' && categoryFilter !== 'Cosmetics') return false;
    if (hideOwned && save.ownedCosmetics.includes(c.id)) return false;
    if (!normalizedQuery) return true;
    return (
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.type.toLowerCase().includes(normalizedQuery) ||
      'seasonal'.includes(normalizedQuery)
    );
  });

  const upcomingGear = ITEMS.filter((i) => i.seasonal === upcomingSeason);
  const upcomingCosmetics = COSMETICS.filter((c) => c.shop === 'Seasonal Shop' && c.seasonal === upcomingSeason);

  const filteredStyleAndTimeCosmetics = COSMETICS.filter((c) => {
    if (c.shop === 'Seasonal Shop') return false;
    if (categoryFilter === 'Time Traveler' && c.shop !== 'Time Traveler Shop') return false;
    if (categoryFilter === 'Cosmetics' && c.shop !== 'Customization Shop' && c.shop !== 'Time Traveler Shop') return false;
    if (categoryFilter !== 'All' && categoryFilter !== 'Cosmetics' && categoryFilter !== 'Time Traveler') return false;
    if (hideOwned && save.ownedCosmetics.includes(c.id)) return false;
    if (!normalizedQuery) return true;
    return (
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.type.toLowerCase().includes(normalizedQuery) ||
      c.shop.toLowerCase().includes(normalizedQuery)
    );
  });

  const selectedSupply =
    selectedFeaturedKey !== 'daily-deal'
      ? QUEST_SHOP.find((q) => q.id === selectedFeaturedKey) || featuredSupplies[0]
      : null;
  const selectedSupplyCost = selectedSupply ? getDiscountedCost(save, selectedSupply.cost) : 0;

  return (
    <div className="space-y-5">
      <ShopDiscountBanner save={save} />

      {/* Pixel Storefront Showcase Banner (Merlin's Market) */}
      <div className="overflow-hidden rounded-2xl border border-[#3a3642] shadow-lg">
        <div
          className="relative px-4 pt-4 pb-0"
          style={{
            backgroundColor: '#b7bcc3',
            backgroundImage:
              'linear-gradient(90deg, rgba(112,117,126,0.28) 2px, transparent 2px), linear-gradient(180deg, rgba(112,117,126,0.34) 2px, transparent 2px)',
            backgroundSize: '28px 14px',
          }}
        >
          {/* Subtle Top Mortar Texture Overlay */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-7 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#7c828d 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              backgroundPosition: '0 0, 9px 9px',
            }}
          />

          {/* Merlin Situational Remark Banner */}
          <div className="relative z-10 mb-3 rounded-xl border border-[#2d2536]/30 bg-[#141418]/90 px-3.5 py-2 text-xs text-[#f5f5f7] shadow">
            <span className="font-bold text-[#eab949]">Merlin:</span>{' '}
            <span className="text-[#e4e4e7]">&ldquo;{merlinQuote}&rdquo;</span>
          </div>

          <div className="relative z-10 grid grid-cols-1 items-end gap-5 sm:grid-cols-[185px_1fr]">
            {/* Left Stall: Merlin's Counter Booth */}
            <div className="relative mx-auto flex w-[180px] flex-col items-center pb-0 sm:mx-0">
              {/* Hanging Sword Shop Sign */}
              <div className="relative mb-[-6px] flex h-10 w-36 items-center justify-center rounded-md border-[3px] border-[#1f130a] bg-[#8f582c] shadow-md">
                <div className="flex items-center gap-1.5 px-2">
                  <GearIcon sprite="moonblade" className="h-7 w-7 -rotate-45" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fde68a]">
                    Arcana Goods
                  </span>
                </div>
              </div>

              {/* Merlin Behind Counter */}
              <div className="relative flex w-full items-end justify-center pt-1">
                <div className="relative z-10 -mb-6">
                  <MerlinAvatar
                    speaking={false}
                    includeBackground={false}
                    classNameWrapper="h-24 w-[72px]"
                  />
                </div>
              </div>

              {/* Wooden Shop Counter + Props */}
              <div className="relative z-20 flex h-11 w-full items-center justify-between rounded-t-sm border-[3px] border-[#1f130a] bg-[#78431e] px-2.5 shadow-inner">
                <div className="h-5 w-7 rounded-[2px] border-2 border-[#1f130a] bg-[#d48b2c]">
                  <div className="mt-1.5 h-1 w-full bg-[#6b3f14]" />
                </div>
                <div className="h-6 w-12 rounded-[2px] border border-[#4f2b12] bg-[#5d3316]" />
                <div className="h-5 w-6 rounded-[2px] border-2 border-[#1f130a] bg-[#a66634]" />
              </div>
            </div>

            {/* Right Shelf: Featured Items! + Pinned Daily Deal (-25%) + 3 White Cards */}
            <div className="flex flex-col items-center pb-3">
              <div className="mb-4 inline-flex items-center gap-2 border-2 border-[#7c3e06] bg-[#c96f0e] px-4 py-1 text-xs font-extrabold tracking-wide text-white shadow">
                <span className="text-[#fde047]">◆</span>
                <span>Featured Items!</span>
                <span className="text-[#fde047]">◆</span>
              </div>

              <div className="grid w-full max-w-[440px] grid-cols-4 gap-2.5 sm:gap-3">
                {/* Slot 1: Pinned Daily Deal (-25% Gold) */}
                <button
                  type="button"
                  onClick={() => setSelectedFeaturedKey('daily-deal')}
                  className={`group relative flex flex-col items-center justify-between rounded-lg bg-white px-2 pt-3.5 pb-2 text-[#111113] shadow-md transition-transform hover:-translate-y-0.5 ${
                    selectedFeaturedKey === 'daily-deal' ? 'ring-2 ring-[#f59e0b]' : 'ring-1 ring-black/15'
                  }`}
                >
                  <span
                    aria-label="Daily Deal"
                    className="absolute -top-2.5 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-[#5b21b6] text-white shadow"
                  >
                    <Pin className="h-3 w-3 rotate-45" />
                  </span>
                  <span className="absolute top-1 right-1 rounded bg-[#5b21b6] px-1 py-0.5 text-[8px] font-extrabold text-white">
                    −25%
                  </span>
                  <div className="grid h-11 w-11 place-items-center sm:h-12 sm:w-12">
                    <GearIcon sprite={dailyDeal.sprite} className="h-full w-full" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    {dailyDealOwned ? (
                      <span className="text-[10px] font-extrabold text-[#16a34a]">Owned</span>
                    ) : (
                      <>
                        <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#a16207] bg-[#facc15]" />
                        <span
                          className={`font-mono-num text-xs font-extrabold ${
                            save.gold >= dailyDealPrice.finalCost ? 'text-[#d97706]' : 'text-[#8e8e93]'
                          }`}
                        >
                          {dailyDealPrice.finalCost}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Slots 2-4: Mystery Chest, Healing Elixir, Pet Treats */}
                {featuredSupplies.map((item) => {
                  const cost = getDiscountedCost(save, item.cost);
                  const isSelected = selectedFeaturedKey === item.id;
                  const canAfford = save.gold >= cost;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFeaturedKey(item.id)}
                      className={`group relative flex flex-col items-center justify-between rounded-lg bg-white px-2 pt-3.5 pb-2 text-[#111113] shadow-md transition-transform hover:-translate-y-0.5 ${
                        isSelected ? 'ring-2 ring-[#f59e0b]' : 'ring-1 ring-black/15'
                      }`}
                    >
                      <div className="grid h-11 w-11 place-items-center sm:h-12 sm:w-12">
                        <MarketSupplyIcon id={item.id} className="h-full w-full" />
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#a16207] bg-[#facc15]" />
                        <span
                          className={`font-mono-num text-xs font-extrabold ${
                            canAfford ? 'text-[#d97706]' : 'text-[#8e8e93]'
                          }`}
                        >
                          {cost}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Warm Wooden Plank Floor Strip */}
          <div
            className="relative z-10 -mx-4 h-7 border-t-[3px] border-[#42230f]"
            style={{
              backgroundColor: '#855029',
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(58,29,11,0.35) 0 2px, transparent 2px 38px), repeating-linear-gradient(180deg, rgba(46,22,8,0.22) 0 1px, transparent 1px 14px)',
            }}
          >
            {/* Merlin Nameplate Sitting on Counter Floor */}
            <div className="absolute -top-2.5 left-11 inline-flex items-center gap-1.5 border border-[#7c3e06] bg-[#c96f0e] px-3 py-0.5 text-[11px] font-extrabold text-white shadow">
              <span className="text-[#fde047]">◆</span>
              <span>Merlin</span>
              <span className="text-[#fde047]">◆</span>
            </div>
          </div>
        </div>

        {/* Selected Featured Item Action Strip */}
        {selectedFeaturedKey === 'daily-deal' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[#18181b] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#111114] p-1">
                <GearIcon sprite={dailyDeal.sprite} className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#f5f5f7]">{dailyDeal.name}</p>
                  <span className="rounded bg-[#5b21b6] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Daily Deal −25%
                  </span>
                </div>
                <p className="font-mono-num truncate text-xs text-[#8e8e93]">
                  {dailyDeal.slot} · {dailyDeal.rarity} ·{' '}
                  {Object.entries(dailyDeal.stats)
                    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                    .join(' · ')}
                </p>
              </div>
            </div>
            {dailyDealOwned ? (
              <button
                type="button"
                onClick={() => onEquipItem(dailyDeal.id)}
                className={`min-h-[38px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
                  dailyDealEquipped
                    ? 'bg-[#30d158] text-[#092110]'
                    : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                }`}
              >
                {dailyDealEquipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <button
                type="button"
                disabled={save.gold < dailyDealPrice.finalCost}
                onClick={() => onBuy(dailyDeal.id)}
                className="font-mono-num min-h-[38px] shrink-0 rounded-full bg-[#e8b84b] px-4 py-1.5 text-xs font-semibold text-[#1a1305] transition-colors hover:bg-[#f2c65e] disabled:bg-[#27272c] disabled:text-[#636369]"
              >
                Buy · {dailyDealPrice.finalCost}G{' '}
                <span className="ml-1 line-through opacity-60">{dailyDeal.cost}G</span>
              </button>
            )}
          </div>
        ) : (
          selectedSupply && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[#18181b] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#111114] p-1">
                  <MarketSupplyIcon id={selectedSupply.id} className="h-full w-full" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f5f5f7]">{selectedSupply.name}</p>
                  <p className="truncate text-xs text-[#8e8e93]">{selectedSupply.desc}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={save.gold < selectedSupplyCost}
                onClick={() => onBuyQuestItem(selectedSupply.id)}
                className="font-mono-num min-h-[38px] shrink-0 rounded-full bg-[#e8b84b] px-4 py-1.5 text-xs font-semibold text-[#1a1305] transition-colors hover:bg-[#f2c65e] disabled:bg-[#27272c] disabled:text-[#636369]"
              >
                Buy · {selectedSupplyCost} Gold
              </button>
            </div>
          )
        )}
      </div>

      {/* Marketplace Search, Balance & Filter Controls */}
      <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#636369]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear, chests, cosmetics & seasonal..."
              className="min-h-[38px] w-full rounded-full border border-white/[0.08] bg-[#111114] pr-4 pl-9 text-xs text-[#f5f5f7] placeholder:text-[#636369] focus:border-white/25 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHideOwned((v) => !v)}
              className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                hideOwned
                  ? 'bg-[#f5f5f7] text-[#111113]'
                  : 'border border-white/[0.08] bg-[#202024] text-[#8e8e93] hover:text-[#f5f5f7]'
              }`}
            >
              Hide Owned
            </button>
            <div className="font-mono-num inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#e8b84b]/30 bg-[#241f14] px-3.5 py-1 text-xs font-semibold text-[#e8b84b]">
              <span className="h-2 w-2 rounded-full bg-[#e8b84b]" />
              {save.gold} Gold
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Supplies', 'Cosmetics', 'Seasonal', 'Time Traveler', ...EQUIP_SLOTS] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`min-h-[32px] rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#f5f5f7] text-[#111113]'
                  : 'border border-white/[0.07] bg-[#202024] text-[#8e8e93] hover:bg-[#27272c] hover:text-[#f5f5f7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplies & Chests Catalog */}
      {filteredSupplies.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#f5f5f7]">Merlin&apos;s Supplies &amp; Chests</h2>
            <span className="font-mono-num text-xs text-[#8e8e93]">{filteredSupplies.length} items</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredSupplies.map((q) => {
              const cost = getDiscountedCost(save, q.cost);
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#111114] p-1.5">
                    <MarketSupplyIcon id={q.id} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#f5f5f7]">{q.name}</p>
                    <p className="line-clamp-2 text-xs text-[#8e8e93]">{q.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={save.gold < cost}
                    onClick={() => onBuyQuestItem(q.id)}
                    className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#e8b84b] px-4 py-1.5 text-xs font-semibold text-[#1a1305] hover:bg-[#f2c65e] disabled:bg-[#27272c] disabled:text-[#636369]"
                  >
                    {cost}G
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Armory Equipment Catalog */}
      {(categoryFilter === 'All' || isSlotFilter) && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#f5f5f7]">Armory Equipment</h2>
            <span className="font-mono-num text-xs text-[#8e8e93]">{filteredGear.length} items</span>
          </div>
          {filteredGear.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredGear.map((item) => {
                const owned = save.owned.includes(item.id);
                const equipped = save.equipped[item.slot] === item.id;
                const price = getMarketItemPrice(save, item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3.5 rounded-2xl border bg-[#18181b] p-3.5 ${
                      price.isDailyDeal && !owned ? 'border-[#a78bfa]/40' : 'border-white/[0.07]'
                    }`}
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#111114] p-1">
                      <GearIcon sprite={item.sprite} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-[#f5f5f7]">{item.name}</p>
                        {price.isDailyDeal && !owned && (
                          <span className="shrink-0 rounded bg-[#5b21b6] px-1.5 py-0.5 text-[9px] font-bold text-white">
                            −25%
                          </span>
                        )}
                      </div>
                      <p className="font-mono-num truncate text-xs text-[#8e8e93]">
                        {item.slot} · {item.rarity}
                      </p>
                      <p className="font-mono-num mt-0.5 truncate text-[11px] text-[#30d158]">
                        {Object.entries(item.stats)
                          .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                          .join(' · ')}
                      </p>
                    </div>
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipItem(item.id)}
                        className={`min-h-[36px] shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          equipped
                            ? 'bg-[#30d158] text-[#092110]'
                            : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                        }`}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={save.gold < price.finalCost}
                        onClick={() => onBuy(item.id)}
                        className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#d4ab5a] px-4 py-1.5 text-xs font-semibold text-[#1c1508] hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369]"
                      >
                        {price.finalCost < item.cost ? `${price.finalCost}G (${item.cost})` : `${price.finalCost}G`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/[0.08] bg-[#18181b] p-6 text-center text-xs text-[#8e8e93]">
              No equipment matches your current filters.
            </p>
          )}
        </div>
      )}

      {/* Customization & Time Traveler Vault (Frames & Badges) */}
      {filteredStyleAndTimeCosmetics.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#f5f5f7]">
              {categoryFilter === 'Time Traveler' ? 'Time Traveler Vault' : 'Style & Time Traveler Cosmetics'}
            </h2>
            <span className="font-mono-num text-xs text-[#8e8e93]">
              {filteredStyleAndTimeCosmetics.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredStyleAndTimeCosmetics.map((c) => {
              const owned = save.ownedCosmetics.includes(c.id);
              const active = save.activeCosmetics[c.type] === c.id;
              const cost = getDiscountedCost(save, c.cost);
              const originLabel = c.shop === 'Time Traveler Shop' ? 'Time Traveler' : 'Customization';
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#111114] text-xl text-[#f5f5f7]">
                      {c.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f5f5f7]">{c.name}</p>
                      <p className="truncate text-xs text-[#8e8e93]">
                        {c.type} · {originLabel}
                      </p>
                    </div>
                  </div>
                  {owned ? (
                    <button
                      type="button"
                      onClick={() => onActivateCosmetic(c.id)}
                      className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
                        active
                          ? 'bg-[#30d158] text-[#092110]'
                          : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                      }`}
                    >
                      {active ? 'Active' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={save.gold < cost}
                      onClick={() => onBuyCosmetic(c.id)}
                      className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#d4ab5a] px-4 py-1.5 text-xs font-semibold text-[#1c1508] hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369]"
                    >
                      {cost}G
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seasonal Event Collection & Upcoming Preview */}
      {(categoryFilter === 'All' ||
        categoryFilter === 'Seasonal' ||
        filteredSeasonalGear.length > 0 ||
        filteredSeasonalCosmetics.length > 0) &&
        categoryFilter !== 'Supplies' &&
        categoryFilter !== 'Time Traveler' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#18181b] p-4">
              <div>
                <p className="text-xs font-semibold text-[#e8b84b]">Active Seasonal Event</p>
                <h2 className="text-base font-semibold text-[#f5f5f7]">{seasonLabel}</h2>
                <p className="mt-0.5 text-xs text-[#8e8e93]">
                  {activeSeason === 'christmas'
                    ? 'Festive winter gear & cosmetics are available now and also decorate your Sanctuary.'
                    : 'Autumn & Halloween gear and cosmetics are active now. Christmas unlocks December 1.'}
                </p>
              </div>
              <span className="font-mono-num text-xs text-[#8e8e93]">
                {filteredSeasonalGear.length + filteredSeasonalCosmetics.length} active
              </span>
            </div>

            {(filteredSeasonalGear.length > 0 || filteredSeasonalCosmetics.length > 0) && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {filteredSeasonalGear.map((item) => {
                  const owned = save.owned.includes(item.id);
                  const equipped = save.equipped[item.slot] === item.id;
                  const cost = getDiscountedCost(save, item.cost);
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#111114] p-1">
                        <GearIcon sprite={item.sprite} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#f5f5f7]">{item.name}</p>
                        <p className="font-mono-num truncate text-xs text-[#8e8e93]">
                          {item.slot} · Seasonal
                        </p>
                        <p className="font-mono-num mt-0.5 truncate text-[11px] text-[#30d158]">
                          {Object.entries(item.stats)
                            .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                            .join(' · ')}
                        </p>
                      </div>
                      {owned ? (
                        <button
                          type="button"
                          onClick={() => onEquipItem(item.id)}
                          className={`min-h-[36px] shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                            equipped
                              ? 'bg-[#30d158] text-[#092110]'
                              : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                          }`}
                        >
                          {equipped ? 'Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={save.gold < cost}
                          onClick={() => onBuy(item.id)}
                          className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#d4ab5a] px-4 py-1.5 text-xs font-semibold text-[#1c1508] hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369]"
                        >
                          {cost}G
                        </button>
                      )}
                    </div>
                  );
                })}

                {filteredSeasonalCosmetics.map((c) => {
                  const owned = save.ownedCosmetics.includes(c.id);
                  const active = save.activeCosmetics[c.type] === c.id;
                  const cost = getDiscountedCost(save, c.cost);
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#111114] text-xl text-[#f5f5f7]">
                          {c.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#f5f5f7]">{c.name}</p>
                          <p className="truncate text-xs text-[#8e8e93]">{c.type} · Seasonal</p>
                        </div>
                      </div>
                      {owned ? (
                        <button
                          type="button"
                          onClick={() => onActivateCosmetic(c.id)}
                          className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
                            active
                              ? 'bg-[#30d158] text-[#092110]'
                              : 'border border-white/[0.08] bg-[#202024] text-[#f5f5f7] hover:bg-[#2a2a30]'
                          }`}
                        >
                          {active ? 'Active' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={save.gold < cost}
                          onClick={() => onBuyCosmetic(c.id)}
                          className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#d4ab5a] px-4 py-1.5 text-xs font-semibold text-[#1c1508] hover:bg-[#e3ba68] disabled:bg-[#27272c] disabled:text-[#636369]"
                        >
                          {cost}G
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {(categoryFilter === 'All' || categoryFilter === 'Seasonal') && !normalizedQuery && (
              <div className="space-y-2.5 rounded-2xl border border-dashed border-white/[0.1] bg-[#18181b]/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#d1d1d6]">{upcomingLabel}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8e8e93]">
                    <Lock className="h-3.5 w-3.5" />
                    Preview
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {upcomingGear.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#202024]/80 p-2.5 opacity-80">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#111114] p-1">
                        <GearIcon sprite={item.sprite} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#f5f5f7]">{item.name}</p>
                        <p className="font-mono-num truncate text-[11px] text-[#8e8e93]">
                          {item.slot} ·{' '}
                          {Object.entries(item.stats)
                            .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className="font-mono-num text-[11px] font-semibold text-[#e8b84b]">{item.cost}G</span>
                    </div>
                  ))}
                  {upcomingCosmetics.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl bg-[#202024]/80 p-2.5 opacity-80">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#111114] text-lg text-[#f5f5f7]">
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#f5f5f7]">{c.name}</p>
                        <p className="text-[11px] text-[#8e8e93]">{c.type} · Cosmetic</p>
                      </div>
                      <span className="font-mono-num text-[11px] font-semibold text-[#e8b84b]">{c.cost}G</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
      todoText: 'Buy gear from the Market.',
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
      title: 'Sanctuary Builder',
      desc:
        Object.values(save.home.rooms).reduce((a, b) => a + b, 0) > 1 || save.home.furniture.length > 0
          ? `Upgraded ${save.home.houseName}.`
          : 'Upgrade a room or place furniture in My Home.',
      unlocked:
        Object.values(save.home.rooms).reduce((a, b) => a + b, 0) > 1 || save.home.furniture.length > 0,
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
          <h2 className="text-sm font-semibold text-[#f5f5f7]">Onboarding Achievements</h2>
          <span className="font-mono-num grid h-6 min-w-[24px] place-items-center rounded-full border border-white/[0.08] bg-[#18181b] px-2 text-xs font-semibold text-[#d1d1d6]">
            {onboardingDoneCount}
          </span>
        </div>
        <div className="space-y-2">
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
                    ? 'border-white/[0.1] bg-[#202024]'
                    : 'border-white/[0.05] bg-[#18181b] opacity-65'
                }`}
              >
                <AchievementBadgeIcon badge={meta.badge} unlocked={t.done} className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f5f5f7]">{t.title}</p>
                  <p className="mt-0.5 text-xs text-[#8e8e93]">
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
          <h2 className="text-sm font-semibold text-[#f5f5f7]">Basic Achievements</h2>
          <span className="font-mono-num grid h-6 min-w-[24px] place-items-center rounded-full border border-white/[0.08] bg-[#18181b] px-2 text-xs font-semibold text-[#d1d1d6]">
            {basicDoneCount}
          </span>
        </div>
        <div className="space-y-2">
          {basicList.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-colors ${
                a.unlocked
                  ? 'border-[#d4ab5a]/35 bg-[#202024]'
                  : 'border-white/[0.05] bg-[#18181b] opacity-75'
              }`}
            >
              <AchievementBadgeIcon badge={a.badge} unlocked={a.unlocked} className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#f5f5f7]">{a.title}</p>
                <p className="mt-0.5 text-xs text-[#8e8e93]">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  save,
  onToggleSound,
  onChangeLanguage,
  onReplay,
  onExport,
  onImport,
  onGoStart,
  onReset,
}: {
  save: HeroSave;
  onToggleSound: (enabled: boolean) => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onReplay: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onGoStart: () => void;
  onReset: () => void;
}) {
  const lang = save.language || 'en';
  const t = getT(lang);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-[#18181b]">
      {/* Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#8e8e93]" />
          <div>
            <p className="text-sm font-semibold text-[#f5f5f7]">{t.languageLabel}</p>
            <p className="text-xs text-[#8e8e93]">{t.languageDesc}</p>
          </div>
        </div>
        <div className="flex rounded-full border border-white/[0.08] bg-[#111114] p-0.5">
          {(['en', 'de'] as const).map((code) => {
            const active = lang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChangeLanguage(code)}
                className={`min-h-[32px] rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  active ? 'bg-[#f5f5f7] text-[#111113]' : 'text-[#8e8e93] hover:text-[#f5f5f7]'
                }`}
              >
                {code === 'en' ? 'English' : 'Deutsch'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline PWA Install */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-[#8e8e93]" />
          <div>
            <p className="text-sm font-semibold text-[#f5f5f7]">{t.pwaSectionTitle}</p>
            <p className="text-xs text-[#8e8e93]">{t.pwaSectionDesc}</p>
          </div>
        </div>
        <PWAInstallButton lang={lang} variant="settings" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-[#f5f5f7]">{t.soundLabel}</p>
          <p className="text-xs text-[#8e8e93]">{t.soundDesc}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleSound(!save.soundEnabled)}
          className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-semibold ${
            save.soundEnabled
              ? 'bg-[#30d158] text-[#092110]'
              : 'border border-white/[0.08] bg-[#202024] text-[#8e8e93]'
          }`}
        >
          {save.soundEnabled ? t.soundOn : t.soundOff}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-[#f5f5f7]">{t.revisitMerlin}</p>
          <p className="text-xs text-[#8e8e93]">{t.revisitMerlinDesc}</p>
        </div>
        <button
          type="button"
          onClick={onReplay}
          className="min-h-[36px] rounded-full border border-white/[0.08] bg-[#202024] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
        >
          {t.replayOnboarding}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-[#f5f5f7]">{t.saveBackup}</p>
          <p className="text-xs text-[#8e8e93]">{t.saveBackupDesc}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            className="min-h-[36px] rounded-full border border-white/[0.08] bg-[#202024] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
          >
            {t.exportJson}
          </button>
          <label className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-white/[0.08] bg-[#202024] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]">
            {t.importJson}
            <input type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-[#f5f5f7]">{t.titleScreen}</p>
          <p className="text-xs text-[#8e8e93]">{t.titleScreenDesc}</p>
        </div>
        <button
          type="button"
          onClick={onGoStart}
          className="min-h-[36px] rounded-full border border-white/[0.08] bg-[#202024] px-4 py-1.5 text-xs font-semibold text-[#f5f5f7] hover:bg-[#2a2a30]"
        >
          {t.goToStart}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-[#ff453a]">{t.resetProgress}</p>
          <p className="text-xs text-[#8e8e93]">{t.resetProgressDesc}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[36px] rounded-full bg-[#ff453a]/15 px-4 py-1.5 text-xs font-semibold text-[#ff6961] hover:bg-[#ff453a]/25"
        >
          {t.resetGame}
        </button>
      </div>
    </div>
  );
}
