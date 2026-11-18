import type { GearItem, OwnedPet } from '../types/arcana';
import { PixelGrid, SPRITE_INK, mixHex, shadeHex } from './PixelGrid';

export function buildBossSprite(index: number): { width: number; height: number; rects: string } {
  const kind = (['wyrm', 'golem', 'hydra'] as const)[index % 3];
  const g = new PixelGrid(64, 48);

  if (kind === 'wyrm') {
    g.poly([[16, 24], [4, 10], [8, 28], [18, 30]], '#59273d');
    g.poly([[48, 24], [60, 10], [56, 28], [46, 30]], '#59273d');
    g.line(6, 14, 16, 26, '#8c3d59', 1);
    g.line(58, 14, 48, 26, '#8c3d59', 1);
    g.poly([[44, 36], [58, 32], [60, 36], [46, 41]], '#7a314c');
    g.ellipse(32, 31, 14, 11, '#7a314c');
    g.ellipse(29, 28, 9, 7, '#a84764');
    g.box(26, 31, 11, 9, '#cfa08c');
    g.box(27, 34, 9, 1, '#9c6e60');
    g.box(27, 37, 9, 1, '#9c6e60');
    g.poly([[20, 17], [15, 6], [24, 15]], '#e6d3b8');
    g.poly([[44, 17], [49, 6], [40, 15]], '#e6d3b8');
    g.ellipse(32, 20, 11, 7, '#993d5a');
    g.ellipse(30, 18, 7, 4, '#c45a76');
    g.box(24, 18, 4, 3, '#240f1a');
    g.box(36, 18, 4, 3, '#240f1a');
    g.box(25, 19, 2, 2, '#ff6e6e');
    g.box(37, 19, 2, 2, '#ff6e6e');
    g.set(25, 19, '#fff2b2');
    g.set(37, 19, '#fff2b2');
    g.box(25, 24, 14, 3, '#290e19');
    for (const fx of [26, 30, 34, 37]) {
      g.box(fx, 24, 2, 2, '#f5e9dc');
    }
  } else if (kind === 'golem') {
    g.box(7, 14, 9, 14, '#546685');
    g.box(9, 16, 4, 10, '#859ec4');
    g.box(48, 14, 9, 14, '#546685');
    g.box(50, 16, 4, 10, '#859ec4');
    g.box(17, 16, 30, 26, '#485570');
    g.box(19, 18, 12, 22, '#6d80a3');
    g.box(21, 9, 22, 9, '#627394');
    g.box(23, 6, 4, 4, '#92e8ff');
    g.box(37, 6, 4, 4, '#92e8ff');
    g.ellipse(32, 29, 5, 5, '#2b3447');
    g.ellipse(32, 29, 3, 3, '#7ce4ff');
    g.set(31, 28, '#ffffff');
    g.box(24, 13, 16, 3, '#1a1f2e');
    g.box(26, 14, 4, 2, '#8cebff');
    g.box(35, 14, 4, 2, '#8cebff');
    g.box(21, 38, 22, 2, '#7ce4ff');
  } else {
    g.ellipse(32, 34, 16, 9, '#3e6b5b');
    g.ellipse(30, 32, 10, 6, '#59947b');
    g.line(23, 29, 15, 17, '#4c806c', 4);
    g.line(32, 28, 32, 12, '#59947b', 4);
    g.line(41, 29, 49, 17, '#4c806c', 4);
    g.box(28, 5, 8, 3, '#e8c468');
    for (const [hx, hy, tint] of [
      [15, 16, '#59947b'],
      [32, 11, '#7858a6'],
      [49, 16, '#59947b'],
    ] as const) {
      g.ellipse(hx, hy, 6, 5, tint);
      g.box(hx - 3, hy - 1, 2, 2, '#b8ffcf');
      g.box(hx + 2, hy - 1, 2, 2, '#b8ffcf');
      g.box(hx - 2, hy + 3, 5, 1, '#f2e8dc');
    }
  }

  g.applyOutline(SPRITE_INK);
  return { width: 64, height: 48, rects: g.toSvgRects() };
}

export function buildPetSprite(pet: Pick<OwnedPet, 'sprite' | 'color'>): {
  width: number;
  height: number;
  rects: string;
  blinkRects: string;
} {
  // High-detail 24x24 pixel pet matching 48x64 Hero pixel density
  const g = new PixelGrid(24, 24);
  const blink = new PixelGrid(24, 24);
  const base = pet.color || '#77d3ad';
  const light = mixHex(base, '#ffffff', 0.3);
  const dark = shadeHex(base, 0.72);
  const lid = shadeHex(base, 0.85);

  if (pet.sprite === 'slime') {
    g.ellipse(12, 16, 8, 6, base);
    g.ellipse(10, 13, 4, 3, light);
    g.box(6, 19, 12, 3, dark);
    g.box(11, 7, 2, 3, '#568f4d');
    g.box(9, 6, 2, 2, '#8ce079');
    g.box(13, 7, 2, 2, '#73c462');
    g.box(8, 14, 2, 3, SPRITE_INK);
    g.box(14, 14, 2, 3, SPRITE_INK);
    g.set(8, 14, '#ffffff');
    g.set(14, 14, '#ffffff');
    blink.box(8, 14, 2, 2, lid);
    blink.box(14, 14, 2, 2, lid);
  } else if (pet.sprite === 'crab') {
    // Pebble Crab with claws & shell highlights
    g.box(4, 10, 3, 4, light);
    g.box(17, 10, 3, 4, light);
    g.set(5, 9, base);
    g.set(18, 9, base);
    g.ellipse(12, 16, 7, 4, base);
    g.ellipse(10, 14, 4, 2, light);
    g.box(8, 18, 8, 2, dark);
    g.box(5, 19, 2, 3, dark);
    g.box(17, 19, 2, 3, dark);
    g.box(9, 13, 2, 2, SPRITE_INK);
    g.box(13, 13, 2, 2, SPRITE_INK);
    g.set(9, 13, '#ffffff');
    g.set(13, 13, '#ffffff');
    blink.box(9, 13, 2, 1, lid);
    blink.box(13, 13, 2, 1, lid);
  } else if (pet.sprite === 'squirrel') {
    // Acorn Squirrel with fluffy curl tail
    g.ellipse(18, 13, 4, 6, light);
    g.ellipse(17, 15, 3, 4, base);
    g.ellipse(10, 17, 4, 4, base);
    g.ellipse(10, 11, 4, 4, base);
    g.box(7, 6, 2, 3, dark);
    g.box(11, 6, 2, 3, dark);
    g.box(8, 12, 4, 2, '#f5e1c8');
    g.box(7, 10, 2, 2, SPRITE_INK);
    g.set(7, 10, '#ffffff');
    g.box(8, 20, 4, 2, dark);
    blink.box(7, 10, 2, 1, lid);
  } else if (pet.sprite === 'frog') {
    // Dewdrop Frog with bright crest & plump body
    g.ellipse(12, 16, 7, 5, base);
    g.ellipse(12, 17, 4, 3, '#d7f7c8');
    g.ellipse(8, 10, 3, 3, light);
    g.ellipse(16, 10, 3, 3, light);
    g.box(8, 9, 2, 2, SPRITE_INK);
    g.box(15, 9, 2, 2, SPRITE_INK);
    g.set(8, 9, '#ffffff');
    g.set(15, 9, '#ffffff');
    g.box(6, 20, 3, 2, dark);
    g.box(15, 20, 3, 2, dark);
    blink.box(8, 9, 2, 1, light);
    blink.box(15, 9, 2, 1, light);
  } else if (pet.sprite === 'fox') {
    // Detailed Moon Fox with fluffy tipped tail & paws
    g.ellipse(18, 16, 4, 3, light);
    g.ellipse(20, 15, 2, 2, '#ffffff');
    g.ellipse(11, 17, 5, 4, base);
    g.ellipse(11, 11, 5, 4, base);
    g.poly([[6, 9], [7, 4], [10, 8]], dark);
    g.poly([[16, 9], [15, 4], [12, 8]], dark);
    g.set(8, 6, '#f7cde0');
    g.set(14, 6, '#f7cde0');
    g.box(8, 12, 6, 2, '#fff0f5');
    g.box(8, 10, 2, 2, SPRITE_INK);
    g.box(13, 10, 2, 2, SPRITE_INK);
    g.set(8, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    g.box(8, 20, 2, 2, dark);
    g.box(13, 20, 2, 2, dark);
    blink.box(8, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  } else if (pet.sprite === 'tortoise') {
    // Moss Tortoise with mossy domed shell
    g.ellipse(12, 15, 7, 5, dark);
    g.ellipse(12, 14, 6, 4, base);
    g.box(9, 12, 4, 2, light);
    g.box(11, 9, 3, 2, '#9ce890');
    g.box(4, 15, 4, 3, '#88c996');
    g.set(5, 16, SPRITE_INK);
    g.box(7, 19, 3, 2, '#5c9169');
    g.box(14, 19, 3, 2, '#5c9169');
    blink.set(5, 16, '#88c996');
  } else if (pet.sprite === 'moth') {
    // Lantern Moth with glowing wing eyespots
    g.ellipse(7, 13, 4, 5, base);
    g.ellipse(17, 13, 4, 5, base);
    g.ellipse(7, 12, 2, 2, '#fff6cc');
    g.ellipse(17, 12, 2, 2, '#fff6cc');
    g.ellipse(12, 14, 2, 5, '#5e493c');
    g.box(10, 8, 1, 2, '#ffe082');
    g.box(13, 8, 1, 2, '#ffe082');
    blink.ellipse(7, 12, 2, 2, light);
    blink.ellipse(17, 12, 2, 2, light);
  } else if (pet.sprite === 'cat') {
    // Shadow Cat with emerald eyes & curved tail
    g.poly([[16, 18], [20, 12], [19, 10], [17, 16]], dark);
    g.ellipse(11, 17, 4, 4, base);
    g.ellipse(11, 11, 5, 4, base);
    g.poly([[7, 8], [7, 4], [10, 7]], dark);
    g.poly([[15, 8], [15, 4], [12, 7]], dark);
    g.box(8, 10, 2, 2, '#62f5a8');
    g.box(13, 10, 2, 2, '#62f5a8');
    g.set(11, 12, '#f5a6c0');
    g.box(8, 20, 2, 2, dark);
    g.box(12, 20, 2, 2, dark);
    blink.box(8, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  } else if (pet.sprite === 'owl') {
    g.ellipse(12, 14, 6, 6, base);
    g.ellipse(12, 17, 3, 3, '#eef7fa');
    g.poly([[6, 10], [5, 5], [9, 9]], dark);
    g.poly([[18, 10], [19, 5], [15, 9]], dark);
    g.ellipse(9, 11, 2, 2, '#ffffff');
    g.ellipse(15, 11, 2, 2, '#ffffff');
    g.set(9, 11, SPRITE_INK);
    g.set(15, 11, SPRITE_INK);
    g.box(11, 13, 2, 2, '#f0be5b');
    blink.box(8, 10, 3, 2, lid);
    blink.box(14, 10, 3, 2, lid);
  } else if (pet.sprite === 'bunny') {
    // Frost Bunny with tall ears & cotton tail
    g.box(8, 3, 2, 6, light);
    g.box(13, 3, 2, 6, light);
    g.box(9, 4, 1, 4, '#ffd4e5');
    g.box(14, 4, 1, 4, '#ffd4e5');
    g.ellipse(12, 17, 5, 4, base);
    g.ellipse(11, 11, 4, 4, light);
    g.ellipse(17, 17, 2, 2, '#ffffff');
    g.box(9, 10, 2, 2, '#4d73b8');
    g.box(13, 10, 2, 2, '#4d73b8');
    g.set(9, 10, '#ffffff');
    blink.box(9, 10, 2, 1, light);
    blink.box(13, 10, 2, 1, light);
  } else if (pet.sprite === 'beetle') {
    // Clockwork Beetle with gilded carapace & horn
    g.box(11, 4, 2, 4, '#f5d47a');
    g.box(9, 5, 6, 1, '#f5d47a');
    g.ellipse(12, 14, 6, 6, base);
    g.ellipse(10, 12, 3, 3, light);
    g.box(12, 10, 1, 10, dark);
    g.box(5, 11, 2, 2, dark);
    g.box(17, 11, 2, 2, dark);
    g.box(5, 16, 2, 2, dark);
    g.box(17, 16, 2, 2, dark);
    g.set(10, 9, '#72f0ff');
    g.set(13, 9, '#72f0ff');
    blink.set(10, 9, '#ffffff');
    blink.set(13, 9, '#ffffff');
  } else if (pet.sprite === 'pup') {
    g.ellipse(11, 17, 5, 4, base);
    g.ellipse(11, 11, 5, 4, base);
    g.box(5, 10, 2, 5, dark);
    g.box(16, 10, 2, 5, dark);
    g.poly([[16, 17], [20, 12], [21, 17]], '#ffdc6b');
    g.box(8, 10, 2, 2, SPRITE_INK);
    g.box(13, 10, 2, 2, SPRITE_INK);
    g.set(8, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    blink.box(8, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  } else if (pet.sprite === 'axolotl') {
    // Abyssal Axolotl with coral gill fronds
    g.box(4, 9, 2, 5, '#e85a93');
    g.box(18, 9, 2, 5, '#e85a93');
    g.set(3, 10, '#ffadd0');
    g.set(20, 10, '#ffadd0');
    g.ellipse(12, 17, 5, 4, base);
    g.ellipse(12, 11, 5, 4, light);
    g.box(9, 10, 2, 2, SPRITE_INK);
    g.box(14, 10, 2, 2, SPRITE_INK);
    g.set(9, 10, '#ffffff');
    g.set(14, 10, '#ffffff');
    g.box(11, 13, 3, 1, '#c4527e');
    blink.box(9, 10, 2, 1, light);
    blink.box(14, 10, 2, 1, light);
  } else if (pet.sprite === 'griffin') {
    // Storm Griffin with silver wings & golden beak
    g.poly([[6, 14], [2, 8], [6, 18]], '#d7e6ff');
    g.poly([[18, 14], [22, 8], [18, 18]], '#d7e6ff');
    g.ellipse(12, 17, 5, 4, base);
    g.ellipse(12, 11, 4, 4, '#eef4ff');
    g.box(11, 11, 2, 2, '#f2c14e');
    g.box(9, 9, 2, 2, SPRITE_INK);
    g.box(14, 9, 2, 2, SPRITE_INK);
    blink.box(9, 9, 2, 1, '#dce6f7');
    blink.box(14, 9, 2, 1, '#dce6f7');
  } else if (pet.sprite === 'phoenix') {
    // Solar Phoenix with blazing crest & golden tail plumes
    g.poly([[12, 18], [8, 22], [16, 22]], '#ffcf4d');
    g.poly([[6, 13], [2, 8], [7, 17]], '#ffaa47');
    g.poly([[18, 13], [22, 8], [17, 17]], '#ffaa47');
    g.ellipse(12, 15, 5, 5, base);
    g.ellipse(12, 10, 4, 3, light);
    g.poly([[10, 7], [12, 3], [14, 7]], '#ffe675');
    g.box(10, 9, 1, 2, '#fff8cc');
    g.box(13, 9, 1, 2, '#fff8cc');
    g.box(11, 11, 2, 1, '#ffe066');
    blink.box(10, 9, 1, 2, light);
    blink.box(13, 9, 1, 2, light);
  } else {
    // Astral Wyrmling
    g.poly([[7, 14], [3, 9], [6, 17]], light);
    g.poly([[17, 14], [21, 9], [18, 17]], light);
    g.ellipse(12, 17, 5, 4, base);
    g.ellipse(12, 10, 4, 3, base);
    g.poly([[8, 8], [7, 4], [10, 7]], '#fff4cc');
    g.poly([[16, 8], [17, 4], [14, 7]], '#fff4cc');
    g.box(9, 10, 2, 2, '#4a3066');
    g.box(13, 10, 2, 2, '#4a3066');
    g.set(9, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    blink.box(9, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  }

  g.applyOutline(SPRITE_INK);
  return {
    width: 24,
    height: 24,
    rects: g.toSvgRects(),
    blinkRects: blink.toSvgRects(),
  };
}

export type AchievementBadgeId =
  | 'onb-create'
  | 'onb-complete'
  | 'onb-hatch'
  | 'onb-feed'
  | 'onb-gear'
  | 'boss'
  | 'streak'
  | 'clean'
  | 'lvl5'
  | 'lvl10'
  | 'pets'
  | 'guild'
  | 'challenge'
  | 'equipped';

export function buildAchievementBadge(
  badge: AchievementBadgeId,
  unlocked: boolean
): { width: number; height: number; rects: string } {
  const g = new PixelGrid(24, 24);
  const isOnboarding = badge.startsWith('onb-');

  if (isOnboarding) {
    // Pixel Shield Crest inspired by Habitica onboarding shields
    const rim = unlocked ? '#c7d4e6' : '#585c6b';
    const rimLight = unlocked ? '#f2f7ff' : '#73788a';
    const rimDark = unlocked ? '#7e8da3' : '#3a3d47';
    const face = unlocked ? '#7c8ba1' : '#2e313b';
    const faceHi = unlocked ? '#99a8bf' : '#3c404d';
    const glyph = unlocked ? '#ffe587' : '#858a99';
    const glyphHi = unlocked ? '#ffffff' : '#a8adbd';

    g.poly([[12, 2], [20, 6], [20, 14], [12, 21], [4, 14], [4, 6]], rim);
    g.poly([[12, 3], [19, 6], [19, 13], [12, 19], [5, 13], [5, 6]], face);
    g.poly([[12, 3], [12, 19], [5, 13], [5, 6]], faceHi);
    g.line(5, 6, 12, 3, rimLight, 1);
    g.line(12, 3, 19, 6, rimLight, 1);
    g.line(5, 13, 12, 20, rimDark, 1);
    g.line(12, 20, 19, 13, rimDark, 1);

    if (badge === 'onb-create') {
      // Pixel Pencil inside shield
      g.line(8, 15, 15, 8, glyph, 2);
      g.set(16, 7, glyphHi);
      g.set(8, 16, '#d9d2be');
    } else if (badge === 'onb-complete') {
      // Pixel Check Box inside shield
      g.box(8, 8, 8, 8, rimDark);
      g.box(9, 9, 6, 6, face);
      g.line(9, 12, 11, 14, unlocked ? '#74f0ad' : glyphHi, 1);
      g.line(11, 14, 15, 10, unlocked ? '#74f0ad' : glyphHi, 1);
    } else if (badge === 'onb-hatch') {
      // Pixel Pet Egg inside shield
      g.ellipse(12, 12, 4, 5, glyph);
      g.ellipse(11, 10, 2, 3, glyphHi);
      g.set(10, 13, unlocked ? '#5cd6a6' : rimDark);
      g.set(13, 11, unlocked ? '#5cd6a6' : rimDark);
    } else if (badge === 'onb-feed') {
      // Pixel Berry / Treat inside shield
      g.box(11, 7, 2, 2, unlocked ? '#68d98a' : glyphHi);
      g.ellipse(12, 12, 4, 4, unlocked ? '#f07188' : glyph);
      g.set(10, 11, unlocked ? '#ffc2ce' : glyphHi);
    } else {
      // Pixel Armor & Plus inside shield
      g.box(7, 9, 5, 6, glyph);
      g.set(9, 11, rimDark);
      g.box(14, 10, 4, 2, glyphHi);
      g.box(15, 9, 2, 4, glyphHi);
    }
  } else {
    // Circular Pixel Medal Coin (Stone '?' when locked; rich gold/arcane coin when unlocked)
    const coinRim = unlocked ? '#e6ba4c' : '#857e72';
    const coinHi = unlocked ? '#fff0a8' : '#aba396';
    const coinFace = unlocked ? '#ba8529' : '#b8b0a2';
    const coinShade = unlocked ? '#875b17' : '#696259';

    g.ellipse(12, 12, 9, 9, coinRim);
    g.ellipse(12, 12, 7, 7, coinFace);
    g.line(7, 5, 15, 5, coinHi, 1);
    g.line(8, 19, 16, 19, coinShade, 1);

    if (!unlocked) {
      // Classic Pixel '?' emblem matching Inspo screenshot
      g.box(10, 7, 4, 2, '#fff5e0');
      g.box(13, 9, 2, 2, '#fff5e0');
      g.box(11, 11, 2, 3, '#fff5e0');
      g.box(11, 15, 2, 2, '#fff5e0');
      g.box(9, 8, 1, 2, coinShade);
    } else if (badge === 'boss') {
      g.line(8, 16, 16, 8, '#eef6ff', 2);
      g.box(8, 13, 3, 3, '#ffd978');
    } else if (badge === 'streak') {
      g.poly([[12, 6], [16, 12], [14, 17], [10, 17], [8, 12]], '#ff8847');
      g.box(11, 12, 2, 4, '#fff294');
    } else if (badge === 'clean') {
      g.ellipse(12, 12, 3, 3, '#fff099');
      g.set(12, 7, '#fff099');
      g.set(12, 17, '#fff099');
      g.set(7, 12, '#fff099');
      g.set(17, 12, '#fff099');
    } else if (badge === 'lvl5') {
      g.box(11, 7, 2, 10, '#fff5b8');
      g.box(7, 11, 10, 2, '#fff5b8');
      g.box(10, 10, 4, 4, '#ffffff');
    } else if (badge === 'lvl10') {
      g.box(8, 13, 8, 3, '#fff099');
      g.box(8, 9, 2, 4, '#fff099');
      g.box(11, 8, 2, 5, '#ffffff');
      g.box(14, 9, 2, 4, '#fff099');
    } else if (badge === 'pets') {
      g.box(10, 12, 4, 4, '#ffe8b8');
      g.set(9, 10, '#ffe8b8');
      g.set(11, 9, '#ffe8b8');
      g.set(13, 9, '#ffe8b8');
      g.set(15, 10, '#ffe8b8');
    } else if (badge === 'guild') {
      g.box(9, 9, 6, 8, '#eef3ff');
      g.box(9, 7, 2, 2, '#eef3ff');
      g.box(13, 7, 2, 2, '#eef3ff');
      g.box(11, 13, 2, 4, coinShade);
    } else if (badge === 'challenge') {
      g.box(9, 8, 6, 5, '#fff3ad');
      g.box(11, 13, 2, 3, '#fff3ad');
      g.box(9, 16, 6, 1, '#fff3ad');
    } else {
      g.poly([[12, 7], [16, 10], [15, 15], [12, 17], [9, 15], [8, 10]], '#8ce8ff');
      g.set(11, 10, '#ffffff');
    }
  }

  g.applyOutline(SPRITE_INK);
  return { width: 24, height: 24, rects: g.toSvgRects() };
}

export function buildItemSprite(sprite: GearItem['sprite']): {
  width: number;
  height: number;
  rects: string;
} {
  const g = new PixelGrid(32, 32);

  if (sprite === 'sword' || sprite === 'copper-sword' || sprite === 'moonblade') {
    const blade =
      sprite === 'moonblade' ? '#85b9ed' : sprite === 'copper-sword' ? '#d48255' : '#b7c7d9';
    const edge =
      sprite === 'moonblade' ? '#e8f7ff' : sprite === 'copper-sword' ? '#ffc49e' : '#eef5fc';
    const guard =
      sprite === 'moonblade' ? '#70d9ff' : sprite === 'copper-sword' ? '#e0b863' : '#dbb25c';
    g.line(8, 24, 24, 8, blade, 3);
    g.line(9, 23, 25, 7, edge, 1);
    g.line(8, 19, 13, 24, guard, 2);
    g.line(5, 27, 9, 23, '#6b4931', 2);
  } else if (sprite === 'greataxe') {
    g.line(6, 26, 23, 9, '#6e4930', 2);
    g.poly([[16, 7], [26, 7], [25, 18], [18, 13]], '#e08943');
    g.poly([[19, 8], [26, 7], [25, 14]], '#ffd478');
    g.box(17, 10, 3, 3, '#fff5cc');
  } else if (sprite === 'katana') {
    g.line(9, 23, 25, 6, '#e0e6f0', 2);
    g.line(10, 22, 26, 6, '#ffffff', 1);
    g.box(8, 21, 5, 2, '#d9b559');
    g.line(5, 27, 9, 23, '#a62e46', 2);
  } else if (sprite === 'dagger') {
    g.line(10, 22, 22, 10, '#7c6aa6', 2);
    g.line(11, 21, 23, 9, '#d8cef5', 1);
    g.line(9, 19, 13, 23, '#3c364d', 2);
    g.line(7, 25, 10, 22, '#a3405f', 2);
  } else if (sprite === 'staff' || sprite === 'wand' || sprite === 'froststaff') {
    const shaft = sprite === 'froststaff' ? '#c2d8eb' : '#8c613e';
    const orbOuter =
      sprite === 'wand' ? '#6b469c' : sprite === 'froststaff' ? '#4f8dc4' : '#584182';
    const orbInner =
      sprite === 'wand' ? '#ff9ee0' : sprite === 'froststaff' ? '#a6f4ff' : '#72ebe8';
    g.line(7, 26, 21, 12, shaft, 2);
    g.ellipse(22, 10, 4, 4, orbOuter);
    g.ellipse(22, 10, 3, 3, orbInner);
    g.set(21, 9, '#ffffff');
    if (sprite === 'froststaff') {
      g.set(22, 5, '#ffffff');
      g.set(27, 10, '#ffffff');
    }
  } else if (sprite === 'scythe') {
    g.line(8, 27, 21, 7, '#594238', 2);
    g.poly([[19, 6], [27, 9], [25, 18], [22, 12], [17, 10]], '#8c9eb5');
    g.line(21, 7, 26, 13, '#e3edfa', 1);
    g.set(20, 9, '#ff9447');
  } else if (sprite === 'candycane') {
    g.line(8, 25, 22, 11, '#f7f7fc', 3);
    g.line(10, 23, 12, 21, '#d93644', 3);
    g.line(14, 19, 16, 17, '#d93644', 3);
    g.line(18, 15, 20, 13, '#d93644', 3);
    g.box(7, 21, 5, 2, '#5cc474');
    g.line(5, 27, 9, 23, '#b82836', 2);
  } else if (sprite === 'bow') {
    g.poly([[11, 5], [7, 12], [7, 20], [11, 27], [13, 25], [10, 19], [10, 13], [13, 7]], '#9e6f40');
    g.line(13, 6, 13, 26, '#e6dec8', 1);
    g.line(9, 16, 25, 16, '#d9d0b4', 1);
    g.poly([[23, 14], [27, 16], [23, 18]], '#cfe2ed');
  } else if (sprite === 'shield' || sprite === 'buckler' || sprite === 'dragonshield') {
    if (sprite === 'buckler') {
      g.ellipse(16, 16, 9, 9, '#7a8a9e');
      g.ellipse(16, 16, 6, 6, '#b8c8db');
      g.ellipse(16, 16, 2, 2, '#e6be60');
    } else if (sprite === 'dragonshield') {
      g.box(8, 7, 16, 15, '#7a2c3b');
      g.box(10, 9, 12, 11, '#a83c50');
      g.box(8, 7, 16, 2, '#ebd074');
      g.box(10, 22, 12, 3, '#7a2c3b');
      g.box(14, 11, 4, 7, '#ffcf66');
    } else {
      g.box(8, 7, 16, 16, '#875a38');
      g.box(10, 9, 12, 12, '#ab784e');
      g.box(8, 7, 16, 2, '#9ca8b8');
      g.box(10, 23, 12, 3, '#875a38');
      g.box(14, 12, 4, 6, '#efd076');
    }
  } else if (sprite === 'book') {
    g.box(7, 7, 18, 18, '#66489e');
    g.box(9, 9, 14, 14, '#8763c7');
    g.box(21, 9, 3, 14, '#f0e7d8');
    g.box(13, 13, 4, 4, '#f5d47a');
  } else if (sprite === 'orb') {
    g.ellipse(16, 16, 8, 8, '#4684b5');
    g.ellipse(15, 14, 5, 5, '#8ce8ff');
    g.set(13, 12, '#ffffff');
    g.box(12, 23, 8, 3, '#d9b559');
  } else if (sprite === 'lantern') {
    g.box(14, 6, 4, 3, '#4c733d');
    g.ellipse(16, 17, 8, 8, '#eb7c28');
    g.ellipse(14, 15, 4, 5, '#ffa747');
    g.box(12, 14, 2, 2, '#fff194');
    g.box(18, 14, 2, 2, '#fff194');
    g.box(12, 19, 8, 2, '#fff194');
  } else if (sprite === 'helm' || sprite === 'paladinhelm') {
    const base = sprite === 'paladinhelm' ? '#c2cfde' : '#8d9cb0';
    const hi = sprite === 'paladinhelm' ? '#f0f6fc' : '#cbd7e6';
    g.box(7, 10, 18, 11, base);
    g.box(9, 11, 8, 4, hi);
    g.box(15, 13, 3, 5, sprite === 'paladinhelm' ? '#f0cc62' : '#72d5eb');
    if (sprite === 'paladinhelm') {
      g.box(14, 6, 4, 4, '#c9425b');
    }
  } else if (sprite === 'hood') {
    g.poly([[6, 22], [10, 8], [21, 8], [26, 22]], '#58428c');
    g.box(11, 13, 10, 7, '#291f42');
    g.box(9, 19, 14, 2, '#e3c06b');
  } else if (sprite === 'rangerhat') {
    g.poly([[9, 18], [14, 9], [22, 18]], '#4e7342');
    g.box(6, 18, 20, 3, '#38542e');
    g.line(19, 15, 25, 8, '#e85d5d', 2);
  } else if (sprite === 'crown') {
    g.box(7, 16, 18, 6, '#e8bc4a');
    g.poly([[7, 16], [9, 9], [13, 16]], '#ffe175');
    g.poly([[13, 16], [16, 7], [19, 16]], '#ffe175');
    g.poly([[19, 16], [23, 9], [25, 16]], '#ffe175');
    g.box(15, 18, 2, 2, '#e84868');
  } else if (sprite === 'pumpkinhelm') {
    g.box(14, 7, 4, 3, '#4c733d');
    g.ellipse(16, 17, 9, 8, '#e36f1e');
    g.ellipse(14, 15, 4, 5, '#ff9940');
    g.box(11, 14, 3, 2, '#fff08a');
    g.box(18, 14, 3, 2, '#fff08a');
    g.box(12, 19, 8, 2, '#fff08a');
  } else if (sprite === 'witchhat') {
    g.poly([[10, 18], [16, 5], [22, 18]], '#46336e');
    g.box(5, 18, 22, 3, '#332354');
    g.box(10, 16, 12, 2, '#eb802d');
    g.box(15, 16, 2, 2, '#ffe078');
  } else if (sprite === 'santahat') {
    g.poly([[9, 18], [16, 7], [23, 14], [21, 18]], '#cf3244');
    g.box(7, 18, 17, 4, '#f5f7fc');
    g.ellipse(24, 15, 3, 3, '#ffffff');
  } else if (
    sprite === 'armor' ||
    sprite === 'steelplate' ||
    sprite === 'starrobe' ||
    sprite === 'shadowleather' ||
    sprite === 'verdanthide' ||
    sprite === 'autumncoat' ||
    sprite === 'holidaycoat'
  ) {
    const body =
      sprite === 'steelplate'
        ? '#8898ad'
        : sprite === 'starrobe'
          ? '#523d8c'
          : sprite === 'shadowleather'
            ? '#333845'
            : sprite === 'verdanthide'
              ? '#48734d'
              : sprite === 'autumncoat'
                ? '#a8512c'
                : sprite === 'holidaycoat'
                  ? '#b82e3f'
                  : '#576b8a';
    const hi =
      sprite === 'steelplate'
        ? '#cddae8'
        : sprite === 'starrobe'
          ? '#8267c9'
          : sprite === 'shadowleather'
            ? '#52596e'
            : sprite === 'verdanthide'
              ? '#6da36f'
              : sprite === 'autumncoat'
                ? '#db7c48'
                : sprite === 'holidaycoat'
                  ? '#e6495c'
                  : '#7a93b8';
    const trim =
      sprite === 'holidaycoat'
        ? '#ffffff'
        : sprite === 'starrobe'
          ? '#f0ce6e'
          : sprite === 'autumncoat'
            ? '#f0b856'
            : '#c9b385';
    g.box(8, 7, 16, 17, body);
    g.box(10, 9, 6, 13, hi);
    g.box(11, 7, 10, 3, trim);
    g.box(8, 19, 16, 2, sprite === 'holidaycoat' ? '#2c2529' : '#5c3f2e');
    g.box(15, 19, 3, 2, '#ebd07a');
  } else if (
    sprite === 'cape' ||
    sprite === 'crimsonmantle' ||
    sprite === 'batcloak' ||
    sprite === 'frostcloak'
  ) {
    const base =
      sprite === 'crimsonmantle'
        ? '#942e44'
        : sprite === 'batcloak'
          ? '#2f2442'
          : sprite === 'frostcloak'
            ? '#5ea8d6'
            : '#4a3b70';
    const hi =
      sprite === 'crimsonmantle'
        ? '#c74c66'
        : sprite === 'batcloak'
          ? '#644d8a'
          : sprite === 'frostcloak'
            ? '#a3e0ff'
            : '#7962b0';
    g.poly([[10, 7], [22, 7], [25, 25], [16, 27], [7, 25]], base);
    g.line(11, 9, 9, 24, hi, 1);
    g.box(11, 7, 10, 2, sprite === 'frostcloak' ? '#ffffff' : '#e3c06b');
  } else if (sprite === 'wings') {
    g.poly([[15, 16], [5, 7], [7, 19], [13, 22]], '#eef5fc');
    g.poly([[17, 16], [27, 7], [25, 19], [19, 22]], '#eef5fc');
    g.box(14, 15, 4, 4, '#ffd978');
  } else if (sprite === 'glasses' || sprite === 'monocle' || sprite === 'visor') {
    if (sprite === 'monocle') {
      g.ellipse(16, 15, 6, 6, '#e8c45e');
      g.ellipse(16, 15, 4, 4, '#b8e8fa');
      g.line(21, 16, 23, 25, '#e8c45e', 1);
    } else if (sprite === 'visor') {
      g.box(6, 12, 20, 6, '#394159');
      g.box(8, 14, 16, 3, '#63ecff');
    } else {
      g.box(6, 12, 8, 7, '#e0be67');
      g.box(14, 14, 4, 2, '#e0be67');
      g.box(18, 12, 8, 7, '#e0be67');
      g.box(8, 14, 4, 3, '#b0dcf0');
      g.box(20, 14, 4, 3, '#b0dcf0');
    }
  } else if (sprite === 'clover') {
    g.ellipse(13, 12, 3, 3, '#48b86b');
    g.ellipse(19, 12, 3, 3, '#5cd682');
    g.ellipse(13, 18, 3, 3, '#3b9c59');
    g.ellipse(19, 18, 3, 3, '#48b86b');
    g.line(16, 18, 18, 25, '#2d7a45', 2);
  } else if (sprite === 'bell') {
    g.poly([[10, 20], [13, 9], [19, 9], [22, 20]], '#f2c852');
    g.box(14, 7, 4, 2, '#d43b4a');
    g.ellipse(16, 21, 2, 2, '#b88528');
  } else if (sprite === 'ruby') {
    g.line(11, 6, 16, 11, '#e8c468', 1);
    g.line(21, 6, 16, 11, '#e8c468', 1);
    g.poly([[16, 11], [22, 17], [16, 25], [10, 17]], '#db3b59');
    g.poly([[16, 12], [19, 17], [16, 22], [13, 17]], '#ff8aa0');
    g.set(15, 15, '#ffffff');
  } else {
    g.line(11, 6, 16, 11, '#cbd6e3', 1);
    g.line(21, 6, 16, 11, '#cbd6e3', 1);
    g.poly([[16, 11], [22, 17], [16, 25], [10, 17]], '#5cc9d6');
    g.poly([[16, 12], [19, 17], [16, 22], [13, 17]], '#a8f7ff');
    g.set(15, 15, '#ffffff');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 32, height: 32, rects: g.toSvgRects() };
}
