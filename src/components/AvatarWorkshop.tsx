import { useState } from 'react';
import { Dices } from 'lucide-react';
import {
  AVATAR_OPTIONS,
  BG_NAMES,
  PALETTES,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
} from '../types/arcana';
import { HeroAvatar } from './PixelSprite';

interface AvatarWorkshopProps {
  avatar: AvatarConfig;
  className: ClassName;
  equipped?: Partial<Record<EquipSlot, string>>;
  costume?: Partial<Record<EquipSlot, string>>;
  costumeMode?: boolean;
  activeCosmetics?: Partial<Record<'Frame' | 'Badge', string>>;
  allowGearToggle?: boolean;
  onChange: (next: AvatarConfig) => void;
}

const SWATCH_KEYS = new Set<keyof AvatarConfig>(['skin', 'hairColor', 'eyeColor']);

const LABELS: Record<keyof AvatarConfig, string> = {
  skin: 'Skin Tone',
  hair: 'Hairstyle',
  hairColor: 'Hair Color',
  eyes: 'Eye Style',
  eyeColor: 'Eye Color',
  glasses: 'Eyewear',
  top: 'Base Top',
  pants: 'Base Pants',
  accessory: 'Accessory',
  bg: 'Biome Backdrop',
};

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
  allowGearToggle = false,
  onChange,
}: AvatarWorkshopProps) {
  const [previewGear, setPreviewGear] = useState(allowGearToggle);

  const handleRandomize = () => {
    const next: AvatarConfig = { ...avatar };
    (Object.keys(AVATAR_OPTIONS) as (keyof AvatarConfig)[]).forEach((k) => {
      const len = AVATAR_OPTIONS[k].length;
      next[k] = Math.floor(Math.random() * len);
    });
    onChange(next);
  };

  const stepOption = (key: keyof AvatarConfig, delta: number) => {
    const len = AVATAR_OPTIONS[key].length;
    onChange({
      ...avatar,
      [key]: (avatar[key] + delta + len) % len,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr] md:items-start">
      <div className="rounded-2xl border border-[#343340] bg-[#222229] p-4 md:sticky md:top-5">
        <HeroAvatar
          avatar={avatar}
          className={className}
          equipped={equipped}
          costume={costume}
          costumeMode={costumeMode}
          activeCosmetics={activeCosmetics}
          showGear={previewGear}
          classNameWrapper="aspect-[3/4] w-full rounded-xl border border-[#3a3947]"
        />
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#a2a2b3]">
          <span className="font-bold text-[#f4f4f8]">Pixel Hero</span>
          <span className="truncate">{BG_NAMES[avatar.bg % BG_NAMES.length]}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#3d3c4c] bg-[#2b2a34] px-3 py-2 text-xs font-bold text-[#f4f4f8] transition-colors hover:bg-[#363542] whitespace-nowrap"
          >
            <Dices className="h-4 w-4 text-[#9b7bf0]" />
            Randomize
          </button>

          {allowGearToggle && (
            <button
              type="button"
              onClick={() => setPreviewGear((prev) => !prev)}
              className={`min-h-[40px] rounded-xl border px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                previewGear
                  ? 'border-[#9b7bf0] bg-[#362f4f] text-[#f4f4f8]'
                  : 'border-[#3d3c4c] bg-[#25242e] text-[#a2a2b3]'
              }`}
            >
              {previewGear ? 'Gear: On' : 'Base Outfit'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#343340] bg-[#222229] p-4 sm:p-5">
        <div className="mb-4 border-b border-[#302f3b] pb-3">
          <p className="text-xs font-bold text-[#9b7bf0]">Appearance Workshop</p>
          <h2 className="mt-1 text-xl font-bold text-[#f4f4f8]">Customize Your Pixel Hero</h2>
          <p className="mt-1 text-sm text-[#a2a2b3]">
            Hair, eyes, and base clothing stay independent of your combat class and remain editable anytime.
          </p>
        </div>

        <div className="space-y-4">
          {(Object.keys(AVATAR_OPTIONS) as (keyof AvatarConfig)[]).map((key) => {
            const options = AVATAR_OPTIONS[key];
            const current = avatar[key] ?? 0;
            const isSwatch = SWATCH_KEYS.has(key);

            return (
              <div key={key} className="border-b border-[#2e2d38] pb-4 last:border-b-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#f4f4f8]">
                    {LABELS[key]}{' '}
                    <span className="font-normal text-[#a2a2b3]">· {options[current]}</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#a2a2b3]">
                    <button
                      type="button"
                      onClick={() => stepOption(key, -1)}
                      aria-label={`Previous ${LABELS[key]}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#3d3c4c] bg-[#2b2a34] text-base text-[#f4f4f8] hover:bg-[#383745]"
                    >
                      ‹
                    </button>
                    <span className="font-mono-num w-10 text-center">
                      {current + 1}/{options.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => stepOption(key, 1)}
                      aria-label={`Next ${LABELS[key]}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#3d3c4c] bg-[#2b2a34] text-base text-[#f4f4f8] hover:bg-[#383745]"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="arcana-scroll flex gap-2 overflow-x-auto pb-1.5">
                  {options.map((label, idx) => {
                    const active = current === idx;
                    if (isSwatch) {
                      return (
                        <button
                          key={label}
                          type="button"
                          title={label}
                          aria-label={`${LABELS[key]}: ${label}`}
                          onClick={() => onChange({ ...avatar, [key]: idx })}
                          style={{ backgroundColor: getSwatchColor(key, idx) }}
                          className={`h-9 w-9 shrink-0 rounded-lg border transition-transform ${
                            active
                              ? 'scale-105 border-2 border-[#ffffff] ring-2 ring-[#9b7bf0]'
                              : 'border-[#3d3c4c] hover:scale-105'
                          }`}
                        />
                      );
                    }
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onChange({ ...avatar, [key]: idx })}
                        className={`min-h-[38px] shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                          active
                            ? 'border-[#b9a0f8] bg-[#4e3d7a] text-[#ffffff]'
                            : 'border-[#3a3947] bg-[#2b2a34] text-[#d3d2de] hover:bg-[#363542]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
