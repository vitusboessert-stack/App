import { useState } from 'react';
import { Dices, Glasses, Scissors, Shirt, User } from 'lucide-react';
import {
  AVATAR_OPTIONS,
  PALETTES,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
} from '../types/arcana';
import { AvatarAttributeIcon, HeroAvatar } from './PixelSprite';

interface AvatarWorkshopProps {
  avatar: AvatarConfig;
  className: ClassName;
  equipped?: Partial<Record<EquipSlot, string>>;
  costume?: Partial<Record<EquipSlot, string>>;
  costumeMode?: boolean;
  activeCosmetics?: Partial<Record<'Frame' | 'Badge', string>>;
  onChange: (next: AvatarConfig) => void;
  merlinSection?: React.ReactNode;
}

type CategoryId = 'skin' | 'body' | 'hair' | 'extras';

interface SubAttrDef {
  key: keyof AvatarConfig;
  label: string;
  isSwatch?: boolean;
}

const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: typeof User;
  attrs: SubAttrDef[];
}[] = [
  {
    id: 'skin',
    label: 'Skin',
    icon: User,
    attrs: [
      { key: 'skin', label: 'Color', isSwatch: true },
      { key: 'eyes', label: 'Eyes' },
      { key: 'eyeColor', label: 'Eye Color', isSwatch: true },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    icon: Shirt,
    attrs: [
      { key: 'top', label: 'Shirt' },
      { key: 'pants', label: 'Pants' },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: Scissors,
    attrs: [
      { key: 'hair', label: 'Style' },
      { key: 'hairColor', label: 'Color', isSwatch: true },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    icon: Glasses,
    attrs: [
      { key: 'glasses', label: 'Eyewear' },
      { key: 'accessory', label: 'Accessory' },
      { key: 'bg', label: 'Backdrop' },
    ],
  },
];

function getSwatchColor(key: keyof AvatarConfig, idx: number): string {
  if (key === 'skin') return PALETTES.skin[idx % PALETTES.skin.length];
  if (key === 'hairColor') return PALETTES.hair[idx % PALETTES.hair.length];
  if (key === 'eyeColor') return PALETTES.eye[idx % PALETTES.eye.length];
  return '#666';
}

export function AvatarWorkshop({
  avatar,
  className,
  equipped,
  costume,
  costumeMode,
  activeCosmetics,
  onChange,
  merlinSection,
}: AvatarWorkshopProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('skin');
  const [subAttrIndex, setSubAttrIndex] = useState<Record<CategoryId, number>>({
    skin: 0,
    body: 0,
    hair: 0,
    extras: 0,
  });

  const currentCat = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const currentSub = currentCat.attrs[subAttrIndex[activeCategory] % currentCat.attrs.length];
  const activeKey = currentSub.key;
  const options = AVATAR_OPTIONS[activeKey];
  const currentVal = avatar[activeKey] ?? 0;

  const handleRandomize = () => {
    const next: AvatarConfig = { ...avatar };
    (Object.keys(AVATAR_OPTIONS) as (keyof AvatarConfig)[]).forEach((k) => {
      next[k] = Math.floor(Math.random() * AVATAR_OPTIONS[k].length);
    });
    onChange(next);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      {/* Top Randomize Button + Hero Preview */}
      <button
        type="button"
        onClick={handleRandomize}
        className="mb-4 inline-flex min-h-[38px] items-center gap-2 rounded-full bg-[#6d45c7] px-6 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#6d45c7]/30 transition hover:bg-[#7d56d6]"
      >
        <Dices className="h-4 w-4" />
        Randomize
      </button>

      <HeroAvatar
        avatar={avatar}
        className={className}
        equipped={equipped}
        costume={costume}
        costumeMode={costumeMode}
        activeCosmetics={activeCosmetics}
        showGear={false}
        classNameWrapper="h-40 w-44 rounded-3xl border border-white/10 shadow-2xl"
      />

      {/* Optional Merlin Dialogue Positioned Between Hero & Option Strip */}
      {merlinSection && <div className="mt-5 w-full">{merlinSection}</div>}

      {/* Bottom Violet Horizontal Customization Deck */}
      <div className="mt-5 w-full overflow-hidden rounded-3xl border border-[#5f3dc4]/40 bg-[#2d1e54] shadow-2xl">
        {/* Sub-Attribute Tabs (e.g., COLOR / EYES / EYE COLOR) */}
        <div className="flex items-center justify-center gap-6 border-b border-white/10 px-4 pt-3">
          {currentCat.attrs.map((attr, idx) => {
            const isSubActive = (subAttrIndex[activeCategory] % currentCat.attrs.length) === idx;
            return (
              <button
                key={attr.key}
                type="button"
                onClick={() =>
                  setSubAttrIndex((prev) => ({
                    ...prev,
                    [activeCategory]: idx,
                  }))
                }
                className={`border-b-2 pb-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                  isSubActive
                    ? 'border-[#b996ff] text-white'
                    : 'border-transparent text-[#b8abdb]/65 hover:text-white'
                }`}
              >
                {attr.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Scrollable Options Strip */}
        <div className="bg-[#3d2673] px-3 py-4">
          <div className="arcana-scroll flex items-center gap-3 overflow-x-auto px-1 pb-1">
            {options.map((label, idx) => {
              const active = currentVal === idx;
              if (currentSub.isSwatch) {
                return (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={`${currentSub.label}: ${label}`}
                    onClick={() => onChange({ ...avatar, [activeKey]: idx })}
                    className={`relative h-12 w-12 shrink-0 rounded-full p-0.5 transition-transform ${
                      active
                        ? 'scale-105 bg-white ring-2 ring-[#b996ff]'
                        : 'bg-white/25 hover:scale-105 hover:bg-white/50'
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-black/25"
                      style={{ backgroundColor: getSwatchColor(activeKey, idx) }}
                    />
                  </button>
                );
              }

              return (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onClick={() => onChange({ ...avatar, [activeKey]: idx })}
                  className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition-all ${
                    active
                      ? 'bg-[#6d45c7] ring-2 ring-white'
                      : 'bg-[#2a1b4f]/90 hover:bg-[#4c3091]'
                  }`}
                >
                  <div className="h-11 w-11 overflow-hidden rounded-xl bg-[#1d1438] p-1">
                    <AvatarAttributeIcon attrKey={activeKey} value={idx} avatar={avatar} />
                  </div>
                  <span className="w-full truncate text-center text-[10px] font-semibold text-[#f3efff]">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom 4 Main Attribute Category Tabs (Skin, Body, Hair, Extras) */}
        <div className="grid grid-cols-4 bg-[#4e2d96]">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#5c37ad] text-white'
                    : 'text-[#d4c7f5]/70 hover:bg-[#5633a1] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 h-3 w-3 rotate-45 bg-[#3d2673]" aria-hidden="true" />
                )}
                <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
