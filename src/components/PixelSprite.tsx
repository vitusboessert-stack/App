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
  buildItemSprite,
  buildPetSprite,
  type AchievementBadgeId,
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
            <g className={animatePet ? 'animate-pet-idle' : undefined}>
              <g dangerouslySetInnerHTML={{ __html: petData.rects }} />
              {animatePet && petData.blinkRects && (
                <g
                  className="animate-pet-blink"
                  dangerouslySetInnerHTML={{ __html: petData.blinkRects }}
                />
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export function MerlinAvatar({
  speaking = false,
  classNameWrapper = '',
}: {
  speaking?: boolean;
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
        <g dangerouslySetInnerHTML={{ __html: layers.bgRects }} />
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
  animate = false,
  className = '',
}: {
  pet: Pick<OwnedPet, 'sprite' | 'color'> & { rarity?: string };
  rarity?: string;
  animate?: boolean;
  className?: string;
}) {
  const sprite = useMemo(() => buildPetSprite(pet), [pet.sprite, pet.color]);
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
          rarityStyle
            ? {
                filter: `${rarityStyle.spriteGlow} drop-shadow(0 2px 2px rgba(8, 6, 15, 0.65))`,
              }
            : undefined
        }
      >
        <g className={animate ? 'animate-pet-idle' : undefined}>
          <g dangerouslySetInnerHTML={{ __html: sprite.rects }} />
          {animate && sprite.blinkRects && (
            <g
              className="animate-pet-blink"
              dangerouslySetInnerHTML={{ __html: sprite.blinkRects }}
            />
          )}
        </g>
      </g>
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
