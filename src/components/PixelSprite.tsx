import { useMemo } from 'react';
import {
  getPetRarityStyle,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
  type GearItem,
  type OwnedPet,
} from '../types/arcana';
import { buildHeroSpriteLayers, buildMerlinSpriteLayers } from '../sprites/heroSprite';
import {
  buildAchievementBadge,
  buildBossSprite,
  buildChallengeBadge,
  buildItemSprite,
  buildMarketSupplySprite,
  buildPetEggSprite,
  buildPetSprite,
  type AchievementBadgeId,
  type ChallengeBadgeId,
} from '../sprites/worldSprites';

interface HeroAvatarProps {
  avatar: Partial<AvatarConfig>;
  className: ClassName;
  equipped?: Partial<Record<EquipSlot, string>>;
  costume?: Partial<Record<EquipSlot, string>>;
  costumeMode?: boolean;
  activeCosmetics?: Partial<Record<'Frame' | 'Badge', string>>;
  showClassPreview?: boolean;
  showGear?: boolean;
  includeBackground?: boolean;
  activePet?: OwnedPet | null;
  animatePet?: boolean;
  classNameWrapper?: string;
}

export function HeroAvatar({
  avatar,
  className,
  equipped,
  costume,
  costumeMode,
  activeCosmetics,
  showClassPreview = false,
  showGear = true,
  includeBackground = true,
  activePet = null,
  animatePet = false,
  classNameWrapper = '',
}: HeroAvatarProps) {
  const layers = useMemo(
    () =>
      buildHeroSpriteLayers({
        avatar,
        className,
        equipped,
        costume,
        costumeMode,
        activeCosmetics,
        showClassPreview,
        showGear,
        includeBackground,
      }),
    [avatar, className, equipped, costume, costumeMode, activeCosmetics, showClassPreview, showGear, includeBackground]
  );

  const petData = useMemo(
    () => (activePet ? buildPetSprite(activePet) : null),
    [activePet]
  );

  const frameClass =
    activeCosmetics?.Frame === 'frame-gold'
      ? 'ring-2 ring-[#e8b84b]'
      : activeCosmetics?.Frame === 'frame-violet'
        ? 'ring-2 ring-[#9b7bf0]'
        : activeCosmetics?.Frame === 'time-rune'
          ? 'ring-2 ring-[#64c5eb]'
          : '';

  return (
    <div className={`relative select-none overflow-hidden ${frameClass} ${classNameWrapper}`}>
      <svg
        className="pixel-svg h-full w-full"
        viewBox="0 0 48 64"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {layers.bgRects && <g dangerouslySetInnerHTML={{ __html: layers.bgRects }} />}
        <g className="pixel-character-pop" dangerouslySetInnerHTML={{ __html: layers.charRects }} />
        {layers.wispRects && <g dangerouslySetInnerHTML={{ __html: layers.wispRects }} />}
        {petData && activePet && (
          <g
            transform="translate(1, 38)"
            style={{
              filter: `${getPetRarityStyle(activePet.rarity).spriteGlow} drop-shadow(0 2px 3px rgba(8, 6, 15, 0.72))`,
            }}
          >
            <g dangerouslySetInnerHTML={{ __html: petData.rects }} />
          </g>
        )}
      </svg>
    </div>
  );
}

export function MerlinAvatar({
  speaking = false,
  includeBackground = true,
  classNameWrapper = '',
}: {
  speaking?: boolean;
  includeBackground?: boolean;
  classNameWrapper?: string;
}) {
  const layers = useMemo(() => buildMerlinSpriteLayers(), []);

  return (
    <div className={`relative select-none overflow-hidden ${classNameWrapper}`}>
      <svg
        className="pixel-svg h-full w-full"
        viewBox="0 0 48 64"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {includeBackground && <g dangerouslySetInnerHTML={{ __html: layers.bgRects }} />}
        <g className="pixel-character-pop" dangerouslySetInnerHTML={{ __html: layers.charRects }} />
        {layers.wispRects && <g dangerouslySetInnerHTML={{ __html: layers.wispRects }} />}
        {speaking && <rect x="23" y="27" width="3" height="1" fill="#4f3554" />}
      </svg>
    </div>
  );
}

export function BossSprite({
  wins,
  className = '',
}: {
  wins: number;
  className?: string;
}) {
  const sprite = useMemo(() => buildBossSprite(wins), [wins]);

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${sprite.width} ${sprite.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: sprite.rects }} />
    </svg>
  );
}

export function PetSprite({
  pet,
  rarity,
  silhouette = false,
  className = '',
}: {
  pet: Pick<OwnedPet, 'sprite' | 'color'> & { rarity?: string; level?: number };
  rarity?: string;
  animate?: boolean;
  silhouette?: boolean;
  className?: string;
}) {
  const sprite = useMemo(
    () => buildPetSprite({ sprite: pet.sprite, color: pet.color, level: pet.level }),
    [pet.sprite, pet.color, pet.level]
  );
  const resolvedRarity = rarity ?? pet.rarity;
  const rarityStyle = resolvedRarity ? getPetRarityStyle(resolvedRarity) : null;

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${sprite.width} ${sprite.height}`}
      aria-hidden="true"
    >
      <g
        style={
          silhouette
            ? { filter: 'brightness(0) invert(0.85) opacity(0.18)' }
            : rarityStyle
              ? {
                  filter: `${rarityStyle.spriteGlow} drop-shadow(0 2px 2px rgba(8, 6, 15, 0.65))`,
                }
              : undefined
        }
      >
        <g dangerouslySetInnerHTML={{ __html: sprite.rects }} />
      </g>
    </svg>
  );
}

export function PetEggIcon({ className = '' }: { className?: string }) {
  const sprite = useMemo(() => buildPetEggSprite(), []);

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${sprite.width} ${sprite.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: sprite.rects }} />
    </svg>
  );
}

export function GearIcon({
  sprite,
  className = '',
}: {
  sprite: GearItem['sprite'];
  className?: string;
}) {
  const icon = useMemo(() => buildItemSprite(sprite), [sprite]);

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: icon.rects }} />
    </svg>
  );
}

export function AchievementBadgeIcon({
  badge,
  unlocked,
  className = '',
}: {
  badge: AchievementBadgeId;
  unlocked: boolean;
  className?: string;
}) {
  const icon = useMemo(() => buildAchievementBadge(badge, unlocked), [badge, unlocked]);

  return (
    <svg
      className={`pixel-svg pixel-badge-pop ${className}`}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: icon.rects }} />
    </svg>
  );
}

export function ChallengeBadgeIcon({
  id,
  completed,
  className = '',
}: {
  id: ChallengeBadgeId;
  completed: boolean;
  className?: string;
}) {
  const icon = useMemo(() => buildChallengeBadge(id, completed), [id, completed]);

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: icon.rects }} />
    </svg>
  );
}

export function MarketSupplyIcon({
  id,
  className = '',
}: {
  id: string;
  className?: string;
}) {
  const icon = useMemo(() => buildMarketSupplySprite(id), [id]);

  return (
    <svg
      className={`pixel-svg ${className}`}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: icon.rects }} />
    </svg>
  );
}

export function QuestBoardIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {/* Wooden Notice Backing */}
      <rect x="2" y="3" width="24" height="22" rx="4" fill="#6b4423" stroke="#2c190a" strokeWidth="1.5" />
      {/* Warm Parchment Sheet */}
      <rect x="5" y="6" width="18" height="16" rx="2" fill="#f7ead0" stroke="#c7a976" strokeWidth="1" />
      {/* Top Ruby Pushpin */}
      <circle cx="14" cy="5.5" r="2.4" fill="#e5484d" stroke="#591215" strokeWidth="1" />
      <circle cx="13.3" cy="4.8" r="0.7" fill="#ffd2d4" />
      {/* Colorful Quest Lines & Checkmarks */}
      <rect x="7.5" y="9.5" width="3" height="3" rx="0.8" fill="#30a46c" />
      <rect x="12" y="10.2" width="8.5" height="1.7" rx="0.8" fill="#2b2118" />
      <rect x="7.5" y="14" width="3" height="3" rx="0.8" fill="#3b82f6" />
      <rect x="12" y="14.7" width="7" height="1.7" rx="0.8" fill="#2b2118" />
      <rect x="7.5" y="18.2" width="5.5" height="1.7" rx="0.8" fill="#f59e0b" />
      {/* Gold Wax Seal */}
      <circle cx="19.5" cy="19" r="3.2" fill="#e8b84b" stroke="#855812" strokeWidth="1" />
      <circle cx="19.5" cy="19" r="1.4" fill="#fff3c4" />
    </svg>
  );
}
