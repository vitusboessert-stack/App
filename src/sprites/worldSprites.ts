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

export function buildPetSprite(pet: Pick<OwnedPet, 'sprite' | 'color'> & { level?: number }): {
  width: number;
  height: number;
  rects: string;
  blinkRects: string;
} {
  // Hand-crafted 24x24 pixel companions with multi-tone shading & evolution accents
  const g = new PixelGrid(24, 24);
  const blink = new PixelGrid(24, 24);
  const base = pet.color || '#77d3ad';
  const light = mixHex(base, '#ffffff', 0.36);
  const highlight = mixHex(base, '#ffffff', 0.62);
  const dark = shadeHex(base, 0.72);
  const deep = shadeHex(base, 0.54);
  const lid = shadeHex(base, 0.84);
  const level = pet.level || 1;

  if (pet.sprite === 'slime') {
    // Sprout Slime: glossy dome, rosy cheeks, curling 2-leaf sprout & dewdrop
    g.box(11, 5, 2, 4, '#548c46');
    g.box(8, 4, 3, 2, '#78cf61');
    g.set(7, 5, '#5ca849');
    g.box(13, 5, 3, 2, '#8ee677');
    g.set(14, 4, '#c7ffba');
    g.ellipse(12, 15, 8, 6, base);
    g.box(6, 18, 12, 3, dark);
    g.box(8, 20, 8, 1, deep);
    g.ellipse(12, 13, 6, 4, base);
    g.box(8, 10, 4, 2, light);
    g.set(8, 10, highlight);
    g.set(10, 11, light);
    g.box(6, 16, 2, 1, '#f49ac1');
    g.box(16, 16, 2, 1, '#f49ac1');
    g.box(8, 13, 2, 3, SPRITE_INK);
    g.box(14, 13, 2, 3, SPRITE_INK);
    g.set(8, 13, '#ffffff');
    g.set(14, 13, '#ffffff');
    blink.box(8, 14, 2, 2, lid);
    blink.box(14, 14, 2, 2, lid);
  } else if (pet.sprite === 'crab') {
    // Pebble Crab: raised articulated claws, spotted shell & eyestalks
    g.box(4, 7, 3, 4, base);
    g.box(4, 7, 1, 2, light);
    g.set(6, 7, highlight);
    g.box(5, 11, 2, 2, dark);
    g.box(17, 7, 3, 4, base);
    g.box(19, 7, 1, 2, light);
    g.set(17, 7, highlight);
    g.box(17, 11, 2, 2, dark);
    g.box(9, 10, 1, 2, dark);
    g.box(14, 10, 1, 2, dark);
    g.ellipse(12, 15, 6, 4, base);
    g.ellipse(11, 13, 4, 2, light);
    g.set(10, 13, highlight);
    g.set(14, 14, dark);
    g.box(7, 17, 10, 2, dark);
    g.box(9, 16, 6, 2, '#f5d7c4');
    g.box(5, 18, 2, 3, deep);
    g.box(8, 19, 2, 2, deep);
    g.box(14, 19, 2, 2, deep);
    g.box(17, 18, 2, 3, deep);
    g.box(9, 11, 2, 2, SPRITE_INK);
    g.box(13, 11, 2, 2, SPRITE_INK);
    g.set(9, 11, '#ffffff');
    g.set(13, 11, '#ffffff');
    blink.box(9, 11, 2, 1, lid);
    blink.box(13, 11, 2, 1, lid);
  } else if (pet.sprite === 'squirrel') {
    // Acorn Squirrel: curled striped tail, tufted ears & golden acorn
    g.ellipse(17, 13, 4, 6, light);
    g.ellipse(17, 14, 3, 4, base);
    g.box(16, 10, 3, 2, dark);
    g.box(17, 17, 3, 2, dark);
    g.ellipse(10, 16, 4, 4, base);
    g.box(8, 15, 3, 4, '#f7e5cf');
    g.ellipse(10, 10, 4, 4, base);
    g.box(7, 5, 2, 3, dark);
    g.box(11, 5, 2, 3, dark);
    g.set(7, 5, light);
    g.set(11, 5, light);
    g.box(6, 11, 3, 2, '#f7e5cf');
    g.set(6, 11, '#f28b9c');
    g.box(8, 9, 2, 2, SPRITE_INK);
    g.set(8, 9, '#ffffff');
    // Tiny acorn held in front paws
    g.box(4, 15, 3, 2, '#7d4e2d');
    g.box(4, 17, 3, 2, '#d9a452');
    g.set(5, 17, '#ffe299');
    g.box(8, 20, 4, 2, deep);
    blink.box(8, 9, 2, 1, lid);
  } else if (pet.sprite === 'frog') {
    // Dewdrop Frog: golden-ringed eyes, lily belly & crown water droplet
    g.ellipse(12, 16, 7, 5, base);
    g.ellipse(12, 17, 4, 3, '#dcfad2');
    g.box(7, 19, 10, 2, dark);
    g.ellipse(8, 10, 3, 3, light);
    g.ellipse(16, 10, 3, 3, light);
    g.box(11, 7, 2, 3, '#7be0ff');
    g.set(11, 7, '#e0f9ff');
    g.box(7, 9, 3, 3, '#f7d96f');
    g.box(14, 9, 3, 3, '#f7d96f');
    g.box(8, 9, 2, 2, SPRITE_INK);
    g.box(15, 9, 2, 2, SPRITE_INK);
    g.set(8, 9, '#ffffff');
    g.set(15, 9, '#ffffff');
    g.box(6, 13, 2, 1, '#f49ac1');
    g.box(16, 13, 2, 1, '#f49ac1');
    g.box(10, 14, 4, 1, deep);
    g.box(5, 20, 4, 2, deep);
    g.box(15, 20, 4, 2, deep);
    blink.box(8, 10, 2, 1, light);
    blink.box(15, 10, 2, 1, light);
  } else if (pet.sprite === 'fox') {
    // Moon Fox: crescent brow gem, plush neck ruff & white-tipped brush tail
    g.ellipse(18, 15, 4, 3, base);
    g.ellipse(19, 14, 2, 2, light);
    g.box(19, 13, 3, 3, '#ffffff');
    g.ellipse(11, 16, 4, 4, base);
    g.box(9, 14, 4, 4, '#fff2fa');
    g.ellipse(11, 10, 5, 4, base);
    g.poly([[6, 8], [7, 3], [10, 7]], deep);
    g.poly([[16, 8], [15, 3], [12, 7]], deep);
    g.set(8, 6, '#f9c6df');
    g.set(14, 6, '#f9c6df');
    g.box(10, 7, 2, 1, '#ffe680');
    g.set(11, 8, '#ffe680');
    g.box(8, 12, 6, 2, '#fff2fa');
    g.set(11, 12, '#3d2a4d');
    g.box(8, 10, 2, 2, SPRITE_INK);
    g.box(13, 10, 2, 2, SPRITE_INK);
    g.set(8, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    g.box(8, 20, 2, 2, deep);
    g.box(12, 20, 2, 2, deep);
    blink.box(8, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  } else if (pet.sprite === 'tortoise') {
    // Moss Tortoise: plated mossy shell, tiny blossom & friendly face
    g.ellipse(13, 15, 7, 5, deep);
    g.ellipse(13, 14, 6, 4, base);
    g.box(10, 12, 2, 2, light);
    g.box(13, 11, 3, 2, light);
    g.box(11, 15, 4, 2, dark);
    g.box(12, 8, 3, 2, '#7fd975');
    g.set(13, 7, '#ffe082');
    g.ellipse(6, 15, 3, 3, '#8dd49a');
    g.box(4, 15, 3, 2, '#a7e8b3');
    g.box(5, 14, 2, 2, SPRITE_INK);
    g.set(5, 14, '#ffffff');
    g.set(4, 17, '#f49ac1');
    g.box(8, 19, 3, 3, '#5c9169');
    g.box(15, 19, 3, 3, '#5c9169');
    blink.box(5, 14, 2, 1, '#8dd49a');
  } else if (pet.sprite === 'moth') {
    // Lantern Moth: scalloped amber wings, glowing lantern spots & plumed antennae
    g.ellipse(7, 12, 5, 5, base);
    g.ellipse(17, 12, 5, 5, base);
    g.ellipse(8, 17, 3, 3, dark);
    g.ellipse(16, 17, 3, 3, dark);
    g.box(5, 10, 3, 3, light);
    g.box(16, 10, 3, 3, light);
    g.box(6, 11, 2, 2, '#fff9d6');
    g.box(16, 11, 2, 2, '#fff9d6');
    g.ellipse(12, 14, 2, 5, '#594235');
    g.box(10, 9, 4, 2, '#fff0c2');
    g.box(9, 5, 2, 3, '#ffd56b');
    g.box(13, 5, 2, 3, '#ffd56b');
    g.set(8, 5, '#fff3b8');
    g.set(15, 5, '#fff3b8');
    g.set(11, 10, '#fff7cc');
    g.set(13, 10, '#fff7cc');
    blink.box(6, 11, 2, 2, light);
    blink.box(16, 11, 2, 2, light);
  } else if (pet.sprite === 'cat') {
    // Shadow Cat: sleek midnight silhouette, emerald eyes & golden collar bell
    g.poly([[16, 18], [20, 13], [20, 9], [18, 11], [17, 16]], dark);
    g.set(20, 9, light);
    g.ellipse(11, 16, 4, 4, base);
    g.box(10, 15, 3, 4, light);
    g.ellipse(11, 10, 5, 4, base);
    g.poly([[7, 8], [7, 3], [10, 7]], deep);
    g.poly([[15, 8], [15, 3], [12, 7]], deep);
    g.set(8, 6, '#e69fc4');
    g.set(14, 6, '#e69fc4');
    g.box(8, 14, 6, 1, '#c94c6d');
    g.box(11, 14, 2, 2, '#ffd56b');
    g.box(8, 9, 2, 2, '#5cf2a4');
    g.box(13, 9, 2, 2, '#5cf2a4');
    g.set(8, 9, '#d8ffea');
    g.set(13, 9, '#d8ffea');
    g.set(11, 11, '#f5a6c0');
    g.box(8, 20, 2, 2, deep);
    g.box(12, 20, 2, 2, deep);
    blink.box(8, 9, 2, 1, lid);
    blink.box(13, 9, 2, 1, lid);
  } else if (pet.sprite === 'owl') {
    // Rune Owl: ear tufts, glowing brow rune, facial disc & golden talons
    g.ellipse(12, 14, 6, 6, base);
    g.ellipse(12, 17, 4, 3, '#eef7fa');
    g.set(11, 16, dark);
    g.set(13, 18, dark);
    g.box(6, 13, 2, 5, dark);
    g.box(16, 13, 2, 5, dark);
    g.poly([[6, 9], [5, 4], [9, 8]], deep);
    g.poly([[18, 9], [19, 4], [15, 8]], deep);
    g.ellipse(9, 11, 2, 2, '#ffffff');
    g.ellipse(15, 11, 2, 2, '#ffffff');
    g.box(11, 8, 2, 1, '#9cf5ff');
    g.set(9, 11, SPRITE_INK);
    g.set(15, 11, SPRITE_INK);
    g.set(9, 10, '#fff7cc');
    g.set(15, 10, '#fff7cc');
    g.box(11, 12, 2, 2, '#f5be4f');
    g.box(8, 20, 3, 2, '#e3a842');
    g.box(13, 20, 3, 2, '#e3a842');
    blink.box(8, 10, 3, 2, lid);
    blink.box(14, 10, 3, 2, lid);
  } else if (pet.sprite === 'bunny') {
    // Frost Bunny: tall frost-tipped ears, icy scarf & fluffy cotton tail
    g.box(8, 3, 2, 6, light);
    g.box(13, 3, 2, 6, light);
    g.box(8, 3, 2, 1, '#ffffff');
    g.box(13, 3, 2, 1, '#ffffff');
    g.box(9, 4, 1, 4, '#ffd4e5');
    g.box(14, 4, 1, 4, '#ffd4e5');
    g.ellipse(12, 17, 5, 4, base);
    g.ellipse(17, 17, 2, 2, '#ffffff');
    g.ellipse(11, 11, 4, 4, light);
    g.box(8, 14, 7, 2, '#6cb8f5');
    g.box(13, 15, 2, 3, '#4f99db');
    g.box(9, 10, 2, 2, '#3d66b8');
    g.box(13, 10, 2, 2, '#3d66b8');
    g.set(9, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    g.set(11, 12, '#ff9ec2');
    g.box(8, 20, 3, 2, base);
    g.box(13, 20, 3, 2, base);
    blink.box(9, 10, 2, 1, light);
    blink.box(13, 10, 2, 1, light);
  } else if (pet.sprite === 'beetle') {
    // Clockwork Beetle: gilded horn, gear flank & glowing cyan optics
    g.box(11, 3, 2, 5, '#ffd86b');
    g.box(9, 4, 6, 1, '#ffe9a3');
    g.box(10, 7, 4, 2, '#c98e32');
    g.ellipse(12, 14, 6, 6, base);
    g.ellipse(10, 12, 3, 3, light);
    g.box(12, 10, 1, 10, deep);
    g.box(14, 13, 3, 3, '#e8b84b');
    g.set(15, 14, deep);
    g.box(4, 11, 2, 2, deep);
    g.box(18, 11, 2, 2, deep);
    g.box(4, 16, 2, 2, deep);
    g.box(18, 16, 2, 2, deep);
    g.box(9, 9, 2, 2, '#6cf2ff');
    g.box(13, 9, 2, 2, '#6cf2ff');
    g.set(9, 9, '#ffffff');
    g.set(13, 9, '#ffffff');
    blink.box(9, 9, 2, 1, '#c9faff');
    blink.box(13, 9, 2, 1, '#c9faff');
  } else if (pet.sprite === 'pup') {
    // Ember Pup: flame-tipped tail & crest, warm chest blaze & floppy ears
    g.poly([[16, 17], [19, 12], [21, 14], [19, 18]], '#ffcf4d');
    g.set(20, 11, '#fff3b0');
    g.ellipse(11, 16, 5, 4, base);
    g.box(9, 15, 4, 4, '#fff0d4');
    g.ellipse(11, 10, 5, 4, base);
    g.box(10, 5, 2, 2, '#ffd15c');
    g.box(5, 9, 2, 5, deep);
    g.box(16, 9, 2, 5, deep);
    g.box(9, 12, 4, 2, '#fff0d4');
    g.set(11, 12, '#3b2416');
    g.box(8, 9, 2, 2, SPRITE_INK);
    g.box(13, 9, 2, 2, SPRITE_INK);
    g.set(8, 9, '#ffffff');
    g.set(13, 9, '#ffffff');
    g.box(8, 20, 2, 2, dark);
    g.box(13, 20, 2, 2, dark);
    blink.box(8, 9, 2, 1, lid);
    blink.box(13, 9, 2, 1, lid);
  } else if (pet.sprite === 'axolotl') {
    // Abyssal Axolotl: triple coral gill fronds, tail fin & gentle smile
    g.box(4, 8, 2, 6, '#e85a93');
    g.box(18, 8, 2, 6, '#e85a93');
    g.set(3, 8, '#ffadd0');
    g.set(3, 11, '#ffadd0');
    g.set(3, 14, '#ffadd0');
    g.set(20, 8, '#ffadd0');
    g.set(20, 11, '#ffadd0');
    g.set(20, 14, '#ffadd0');
    g.poly([[16, 17], [21, 14], [21, 19]], light);
    g.ellipse(12, 17, 5, 4, base);
    g.box(10, 16, 4, 4, '#ffdbe9');
    g.ellipse(12, 11, 5, 4, light);
    g.box(9, 10, 2, 2, SPRITE_INK);
    g.box(14, 10, 2, 2, SPRITE_INK);
    g.set(9, 10, '#ffffff');
    g.set(14, 10, '#ffffff');
    g.set(8, 12, '#ff9ec2');
    g.set(16, 12, '#ff9ec2');
    g.box(11, 13, 3, 1, '#b84673');
    g.box(8, 20, 2, 2, dark);
    g.box(14, 20, 2, 2, dark);
    blink.box(9, 10, 2, 1, light);
    blink.box(14, 10, 2, 1, light);
  } else if (pet.sprite === 'griffin') {
    // Storm Griffin: layered silver-blue wings, golden beak & swept crest
    g.poly([[6, 14], [2, 7], [5, 17]], '#c9dcff');
    g.poly([[18, 14], [22, 7], [19, 17]], '#c9dcff');
    g.box(3, 9, 2, 4, '#ffffff');
    g.box(19, 9, 2, 4, '#ffffff');
    g.ellipse(12, 17, 5, 4, base);
    g.box(10, 14, 4, 4, '#eef4ff');
    g.ellipse(12, 11, 4, 4, '#eef4ff');
    g.box(9, 6, 2, 2, '#9ec0ff');
    g.box(13, 6, 2, 2, '#9ec0ff');
    g.box(11, 11, 2, 2, '#f5c249');
    g.box(9, 9, 2, 2, SPRITE_INK);
    g.box(14, 9, 2, 2, SPRITE_INK);
    g.set(9, 9, '#ffffff');
    g.set(14, 9, '#ffffff');
    g.box(8, 20, 3, 2, '#e3aa3b');
    g.box(13, 20, 3, 2, '#e3aa3b');
    blink.box(9, 9, 2, 1, '#dce6f7');
    blink.box(14, 9, 2, 1, '#dce6f7');
  } else if (pet.sprite === 'phoenix') {
    // Solar Phoenix: blazing 3-plume crown, layered fire wings & golden tail
    g.poly([[12, 17], [8, 22], [16, 22]], '#ffcf4d');
    g.box(11, 19, 2, 3, '#fff099');
    g.poly([[6, 13], [2, 7], [7, 17]], '#ff9e3d');
    g.poly([[18, 13], [22, 7], [17, 17]], '#ff9e3d');
    g.box(3, 9, 2, 3, '#ffe066');
    g.box(19, 9, 2, 3, '#ffe066');
    g.ellipse(12, 15, 5, 4, base);
    g.box(10, 14, 4, 3, '#ffcf5c');
    g.ellipse(12, 10, 4, 3, light);
    g.poly([[10, 7], [12, 3], [14, 7]], '#ffe675');
    g.set(9, 5, '#ffb84d');
    g.set(15, 5, '#ffb84d');
    g.box(10, 9, 1, 2, '#fff9d6');
    g.box(13, 9, 1, 2, '#fff9d6');
    g.box(11, 11, 2, 1, '#ffe066');
    blink.box(10, 9, 1, 2, light);
    blink.box(13, 9, 1, 2, light);
  } else {
    // Astral Wyrmling: starlit wings, twin ivory horns & plated belly scales
    g.poly([[7, 14], [2, 8], [6, 17]], '#8e74c9');
    g.poly([[17, 14], [22, 8], [18, 17]], '#8e74c9');
    g.set(4, 11, '#fff3b8');
    g.set(19, 11, '#fff3b8');
    g.ellipse(12, 17, 5, 4, base);
    g.box(10, 15, 4, 5, '#fff3cc');
    g.box(10, 17, 4, 1, '#e8c468');
    g.ellipse(12, 10, 4, 3, base);
    g.poly([[8, 8], [7, 3], [10, 7]], '#fff4cc');
    g.poly([[16, 8], [17, 3], [14, 7]], '#fff4cc');
    g.box(9, 10, 2, 2, '#4a3066');
    g.box(13, 10, 2, 2, '#4a3066');
    g.set(9, 10, '#ffffff');
    g.set(13, 10, '#ffffff');
    blink.box(9, 10, 2, 1, lid);
    blink.box(13, 10, 2, 1, lid);
  }

  g.applyOutline(SPRITE_INK);

  // Evolution stage accents (Awakened Lv.5+ / Ascended Lv.10+)
  if (level >= 5) {
    g.set(2, 2, '#ffe885');
    g.set(21, 3, '#ffe885');
  }
  if (level >= 10) {
    g.set(2, 1, '#ffffff');
    g.set(2, 3, '#ffd24c');
    g.set(1, 2, '#ffd24c');
    g.set(3, 2, '#ffd24c');
    g.set(20, 2, '#fff5ba');
    g.set(21, 5, '#9ef0ff');
  }

  return {
    width: 24,
    height: 24,
    rects: g.toSvgRects(),
    blinkRects: blink.toSvgRects(),
  };
}

export function buildPetEggSprite(): { width: number; height: number; rects: string } {
  const g = new PixelGrid(20, 20);
  // Warm mossy twig nest
  g.ellipse(10, 16, 7, 3, '#6b4728');
  g.box(4, 15, 12, 2, '#8a5d36');
  g.box(5, 14, 3, 2, '#5c9652');
  g.box(12, 14, 3, 2, '#5c9652');
  // Speckled Arcane Egg
  g.ellipse(10, 10, 5, 6, '#dfd3f5');
  g.ellipse(9, 9, 3, 4, '#f3ecff');
  g.box(7, 6, 2, 3, '#ffffff');
  g.box(8, 12, 4, 3, '#b89ee6');
  // Glowing rune cracks
  g.box(9, 8, 2, 2, '#e8b84b');
  g.set(11, 10, '#e8b84b');
  g.set(12, 11, '#ffe48f');
  g.set(7, 11, '#a27df2');
  g.applyOutline(SPRITE_INK);
  return { width: 20, height: 20, rects: g.toSvgRects() };
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

export type ChallengeBadgeId = 'focus' | 'quests' | 'streak' | 'boss';

export function buildChallengeBadge(
  id: ChallengeBadgeId,
  completed: boolean
): { width: number; height: number; rects: string } {
  const g = new PixelGrid(24, 24);

  if (id === 'focus') {
    // Violet Arcane Crest (Focus Emblem)
    const rim = completed ? '#e6c25c' : '#8570bd';
    const rimHi = completed ? '#fff1a8' : '#b7a3eb';
    const face = completed ? '#5d3ea8' : '#3a2c61';
    const faceHi = completed ? '#7c5cd1' : '#4f3d80';
    g.poly([[12, 2], [20, 6], [19, 15], [12, 21], [5, 15], [4, 6]], rim);
    g.poly([[12, 3], [19, 7], [18, 14], [12, 19], [6, 14], [5, 7]], face);
    g.poly([[12, 3], [12, 19], [6, 14], [5, 7]], faceHi);
    g.line(5, 6, 12, 3, rimHi, 1);
    // Hourglass / Arcane Star inside
    g.box(9, 7, 6, 2, '#f5d97a');
    g.poly([[10, 9], [14, 9], [12, 12]], '#9be8ff');
    g.poly([[12, 12], [10, 15], [14, 15]], '#9be8ff');
    g.box(9, 15, 6, 2, '#f5d97a');
    g.set(12, 12, '#ffffff');
  } else if (id === 'quests') {
    // Golden Parchment & Quill Seal (Questkeeper Seal)
    const rim = completed ? '#f0c859' : '#a8874d';
    const face = completed ? '#a36b24' : '#5e4628';
    g.ellipse(12, 12, 9, 9, rim);
    g.ellipse(12, 12, 7, 7, face);
    // Scroll & Ribbon inside
    g.box(8, 7, 8, 9, '#f5e8c8');
    g.box(7, 7, 10, 2, '#fff5de');
    g.box(7, 15, 10, 2, '#d9c598');
    g.box(9, 10, 5, 1, '#5e4628');
    g.box(9, 12, 4, 1, '#5e4628');
    g.ellipse(15, 15, 2, 2, '#d93d4e');
    g.set(15, 14, '#ff9aa6');
  } else if (id === 'streak') {
    // Emerald Oath Flame Shield (Oath Flame Crest)
    const rim = completed ? '#6fe8ab' : '#4a8f6f';
    const face = completed ? '#1d6948' : '#1b3f32';
    g.poly([[12, 2], [20, 6], [20, 14], [12, 21], [4, 14], [4, 6]], rim);
    g.poly([[12, 4], [18, 7], [18, 13], [12, 19], [6, 13], [6, 7]], face);
    // Radiant Flame
    g.poly([[12, 6], [16, 12], [14, 17], [10, 17], [8, 12]], '#ff8b3d');
    g.poly([[12, 8], [14, 13], [12, 16], [10, 13]], '#ffe066');
    g.set(12, 12, '#ffffff');
  } else {
    // Crimson Wyrmslayer Medallion (Wyrm Hunter)
    const rim = completed ? '#f2b84b' : '#9c5260';
    const face = completed ? '#8f263b' : '#4d212b';
    g.ellipse(12, 12, 9, 9, rim);
    g.ellipse(12, 12, 7, 7, face);
    // Crossed Sword + Fang Crest
    g.line(7, 16, 16, 7, '#e8f1fa', 2);
    g.line(8, 7, 16, 15, '#c8d6e6', 1);
    g.box(8, 14, 3, 2, '#f5d067');
    g.box(14, 14, 3, 2, '#f5d067');
    g.poly([[11, 7], [13, 7], [12, 10]], '#ffcf66');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 24, height: 24, rects: g.toSvgRects() };
}

export function buildMarketSupplySprite(id: string): {
  width: number;
  height: number;
  rects: string;
} {
  const g = new PixelGrid(32, 32);

  if (id === 'mystery-chest') {
    // Detailed pixel wooden & gold-banded Treasure Chest
    g.box(6, 10, 20, 14, '#7d4d27');
    g.box(8, 11, 16, 5, '#a36836');
    g.box(6, 16, 20, 2, '#422813');
    g.box(8, 18, 16, 5, '#8c582d');
    // Gold/Brass corner straps
    g.box(6, 10, 2, 14, '#d9b54e');
    g.box(24, 10, 2, 14, '#d9b54e');
    g.box(11, 10, 2, 14, '#c7a03c');
    g.box(19, 10, 2, 14, '#c7a03c');
    // Center Latch
    g.box(14, 14, 4, 5, '#e8e8f0');
    g.box(15, 16, 2, 2, '#5e5e6e');
  } else if (id === 'healing-elixir') {
    // Sparkling Golden-Ruby Healing Potion Flask
    g.box(13, 5, 6, 3, '#b57b4a');
    g.box(12, 8, 8, 3, '#e8f4fc');
    g.ellipse(16, 19, 7, 7, '#f5d55b');
    g.ellipse(15, 17, 5, 4, '#fff299');
    g.box(17, 18, 3, 3, '#eb547d');
    g.set(12, 17, '#ffffff');
    // Sparkles
    g.set(10, 9, '#ffd95e');
    g.set(22, 10, '#ffd95e');
    g.set(24, 15, '#fff5a8');
  } else if (id === 'pet-treats') {
    // Crimson & Leather Companion Saddle / Treat Pack
    g.poly([[10, 12], [18, 9], [23, 14], [21, 21], [11, 20]], '#c93e3e');
    g.poly([[12, 13], [17, 11], [20, 15], [13, 18]], '#eb5c52');
    g.box(10, 10, 4, 4, '#8c3b2b');
    g.box(17, 17, 3, 5, '#7a4829');
    g.box(17, 21, 4, 2, '#e8c45e');
    g.line(12, 19, 10, 25, '#59331c', 2);
    g.box(8, 24, 4, 2, '#c7ccd6');
  } else if (id === 'bounty-writ') {
    // Sealed Envelope / Scroll with Golden Coin Crest
    g.box(7, 14, 18, 11, '#f7f0d4');
    g.box(8, 15, 16, 9, '#fff9e6');
    g.line(7, 14, 16, 21, '#c9b385', 1);
    g.line(25, 14, 16, 21, '#c9b385', 1);
    g.box(14, 19, 4, 3, '#d93848');
    // Floating Gold Emblem above
    g.ellipse(16, 9, 3, 3, '#f2c249');
    g.set(15, 8, '#fff5a8');
  } else if (id === 'scroll-damage') {
    // Fiery Attack Scroll
    g.box(8, 7, 16, 18, '#f0dfc0');
    g.box(7, 7, 18, 3, '#c99c5b');
    g.box(7, 22, 18, 3, '#c99c5b');
    g.poly([[16, 11], [20, 16], [17, 20], [14, 20], [12, 16]], '#eb5738');
    g.box(15, 15, 2, 4, '#ffe169');
  } else {
    // Sapphire Mana Tonic
    g.box(13, 5, 6, 3, '#9c6e46');
    g.box(12, 8, 8, 3, '#dceef7');
    g.ellipse(16, 19, 7, 7, '#3b82f6');
    g.ellipse(14, 17, 4, 4, '#93c5fd');
    g.set(12, 16, '#ffffff');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 32, height: 32, rects: g.toSvgRects() };
}

export function buildSkillBadge(
  skillName: string,
  classColor: string
): { width: number; height: number; rects: string } {
  const g = new PixelGrid(24, 24);
  const frameOuter = mixHex(classColor, '#ffffff', 0.2);
  const frameBg = shadeHex(classColor, 0.34);
  const frameMid = shadeHex(classColor, 0.52);

  // Octagonal Arcane Skill Badge Backing
  g.poly([[6, 2], [18, 2], [22, 6], [22, 18], [18, 22], [6, 22], [2, 18], [2, 6]], frameOuter);
  g.poly([[7, 3], [17, 3], [21, 7], [21, 17], [17, 21], [7, 21], [3, 17], [3, 7]], frameBg);
  g.poly([[7, 4], [17, 4], [12, 12], [4, 15], [4, 7]], frameMid);

  if (skillName === 'Iron Guard') {
    // Steel Tower Shield with Golden Rim & Cyan Guard Glow
    g.poly([[12, 5], [18, 7], [17, 15], [12, 19], [7, 15], [6, 7]], '#cbd5e1');
    g.poly([[12, 6], [17, 8], [16, 14], [12, 17], [8, 14], [7, 8]], '#64748b');
    g.poly([[12, 6], [12, 17], [8, 14], [7, 8]], '#94a3b8');
    g.box(11, 8, 2, 7, '#64d2ff');
    g.box(9, 10, 6, 2, '#64d2ff');
    g.set(12, 10, '#ffffff');
    g.set(8, 8, '#facc15');
    g.set(16, 8, '#facc15');
  } else if (skillName === 'Valor Strike') {
    // Radiant Broadsword & Golden Slash Shockwave
    g.line(7, 17, 17, 7, '#e2e8f0', 2);
    g.line(8, 16, 17, 7, '#ffffff', 1);
    g.box(7, 14, 4, 2, '#facc15');
    g.box(6, 16, 2, 2, '#92400e');
    // Golden Crescent Slash Trail
    g.line(10, 6, 17, 13, '#fde047', 1);
    g.set(15, 6, '#ffffff');
    g.set(18, 10, '#fde047');
  } else if (skillName === 'Starfall') {
    // Cosmic Falling Star & Sparkles
    g.line(17, 6, 9, 14, '#a78bfa', 2);
    g.line(18, 7, 11, 14, '#e0f2fe', 1);
    g.poly([[9, 11], [12, 13], [14, 10], [13, 14], [16, 16], [12, 16], [10, 19], [9, 16], [6, 15], [9, 13]], '#fde047');
    g.set(10, 14, '#ffffff');
    g.set(6, 8, '#93c5fd');
    g.set(18, 16, '#c4b5fd');
  } else if (skillName === 'Meditation') {
    // Glowing Mana Lotus & Arcane Crystal
    g.poly([[12, 5], [15, 11], [12, 17], [9, 11]], '#64d2ff');
    g.poly([[12, 6], [14, 11], [12, 16], [10, 11]], '#e0f7ff');
    g.poly([[6, 14], [10, 13], [11, 18], [7, 18]], '#a78bfa');
    g.poly([[18, 14], [14, 13], [13, 18], [17, 18]], '#a78bfa');
    g.set(12, 9, '#ffffff');
  } else if (skillName === 'Sanctuary') {
    // Emerald Healing Cross & Radiant Drops
    g.box(10, 6, 4, 12, '#6ee7b7');
    g.box(6, 10, 12, 4, '#6ee7b7');
    g.box(11, 7, 2, 10, '#ecfdf5');
    g.box(7, 11, 10, 2, '#ecfdf5');
    g.set(7, 7, '#fde047');
    g.set(17, 7, '#fde047');
  } else if (skillName === 'Guardian Light') {
    // Golden Sun-Halo Shield
    g.ellipse(12, 12, 5, 5, '#fde047');
    g.ellipse(12, 12, 3, 3, '#fffbeb');
    g.box(11, 4, 2, 3, '#f59e0b');
    g.box(11, 17, 2, 3, '#f59e0b');
    g.box(4, 11, 3, 2, '#f59e0b');
    g.box(17, 11, 3, 2, '#f59e0b');
  } else if (skillName === 'Shadow Ambush') {
    // Twin Crossed Stealth Daggers
    g.line(6, 17, 17, 6, '#e2e8f0', 2);
    g.line(17, 17, 6, 6, '#cbd5e1', 2);
    g.box(6, 15, 3, 2, '#a78bfa');
    g.box(15, 15, 3, 2, '#a78bfa');
    g.set(12, 8, '#f43f5e');
  } else if (skillName === 'Lucky Hand') {
    // Gleaming Gold Coin & Four-Point Sparkle
    g.ellipse(12, 12, 6, 6, '#facc15');
    g.ellipse(12, 12, 4, 4, '#ca8a04');
    g.box(11, 9, 2, 6, '#fef08a');
    g.set(17, 6, '#ffffff');
    g.set(6, 17, '#fef08a');
  } else if (skillName === 'Deadeye') {
    // Bullseye Target Pierced by Arrow
    g.ellipse(12, 12, 6, 6, '#f8fafc');
    g.ellipse(12, 12, 4, 4, '#ef4444');
    g.ellipse(12, 12, 2, 2, '#fde047');
    g.line(18, 6, 12, 12, '#cbd5e1', 1);
    g.set(18, 6, '#4ade80');
    g.set(17, 5, '#4ade80');
  } else {
    // Steady Aim: Longbow & Drawn Arrow
    g.poly([[9, 5], [6, 9], [6, 15], [9, 19]], '#d97706');
    g.line(9, 6, 9, 18, '#e2e8f0', 1);
    g.line(7, 12, 18, 12, '#facc15', 1);
    g.poly([[16, 10], [19, 12], [16, 14]], '#e2e8f0');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 24, height: 24, rects: g.toSvgRects() };
}

export function buildHomeRoomIcon(roomId: string): {
  width: number;
  height: number;
  rects: string;
} {
  const g = new PixelGrid(32, 32);

  if (roomId === 'living') {
    // Cozy Brick Hearth + Doorway
    g.box(4, 6, 24, 21, '#3b2c36');
    g.box(4, 23, 24, 4, '#704b36');
    // Stone Fireplace
    g.box(15, 8, 11, 16, '#64748b');
    g.box(14, 15, 13, 2, '#94a3b8');
    g.box(17, 17, 7, 7, '#18141c');
    g.box(18, 19, 5, 5, '#fb923c');
    g.box(19, 20, 3, 4, '#fde047');
    // Oak Door
    g.box(6, 11, 7, 13, '#6b422e');
    g.set(11, 18, '#fbbf24');
  } else if (roomId === 'library') {
    // Tall Oak Bookcase & Glowing Rune Lamp
    g.box(5, 4, 15, 23, '#5c3b28');
    g.box(6, 5, 13, 21, '#261916');
    for (const sy of [7, 13, 19]) {
      g.box(6, sy + 4, 13, 2, '#7d523a');
      g.box(7, sy, 3, 4, '#ef4444');
      g.box(10, sy + 1, 2, 3, '#eab308');
      g.box(13, sy, 3, 4, '#38bdf8');
      g.box(16, sy + 1, 2, 3, '#a78bfa');
    }
    // Desk & Glowing Cyan Lamp
    g.box(21, 18, 7, 9, '#7d523a');
    g.box(23, 13, 4, 5, '#38bdf8');
    g.set(24, 14, '#e0f7ff');
  } else if (roomId === 'training') {
    // Weapon Rack + Archery Bullseye
    g.box(4, 9, 13, 17, '#5c3b28');
    g.box(5, 10, 11, 15, '#2b201b');
    g.box(7, 11, 2, 11, '#cbd5e1');
    g.box(6, 20, 4, 1, '#eab308');
    g.box(12, 13, 4, 6, '#2563eb');
    g.box(13, 15, 2, 2, '#fbbf24');
    // Target
    g.ellipse(23, 16, 5, 6, '#f5e6c8');
    g.ellipse(23, 16, 3, 4, '#dc2626');
    g.set(23, 16, '#fde047');
  } else if (roomId === 'garden') {
    // Raised Planter with Herbs & Glowing Moonflower
    g.box(4, 19, 24, 8, '#6b422e');
    g.box(5, 19, 22, 2, '#3d281e');
    g.box(7, 13, 5, 6, '#34d399');
    g.box(8, 10, 3, 4, '#6ee7b7');
    g.box(14, 11, 6, 8, '#22c55e');
    g.set(16, 10, '#f43f5e');
    g.box(22, 10, 5, 9, '#a78bfa');
    g.set(24, 12, '#fef08a');
    g.set(21, 7, '#fde047');
  } else if (roomId === 'trophy') {
    // Golden Chalice Trophy & Crimson Banner
    g.box(5, 5, 8, 14, '#9f1239');
    g.box(7, 7, 4, 7, '#facc15');
    g.box(14, 20, 13, 3, '#7d523a');
    g.box(17, 10, 7, 6, '#fbbf24');
    g.box(18, 9, 5, 2, '#fef08a');
    g.box(19, 16, 3, 4, '#d97706');
    g.box(17, 19, 7, 2, '#fbbf24');
  } else {
    // Alchemist Cellar (Basement): Stone Archway + Barrel + Potion Cauldron
    g.box(4, 6, 24, 21, '#2d293e');
    g.box(4, 6, 24, 3, '#4e4869');
    // Oak Barrel
    g.box(6, 14, 8, 11, '#8c5a3c');
    g.box(6, 16, 8, 2, '#cbd5e1');
    g.box(6, 21, 8, 2, '#cbd5e1');
    // Glowing Cauldron / Potion Flask
    g.ellipse(20, 20, 5, 5, '#334155');
    g.box(17, 15, 6, 2, '#4ade80');
    g.set(19, 12, '#a78bfa');
    g.set(22, 11, '#86efac');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 32, height: 32, rects: g.toSvgRects() };
}

export function buildHomeFurnitureIcon(furnitureId: string): {
  width: number;
  height: number;
  rects: string;
} {
  const g = new PixelGrid(32, 32);

  if (furnitureId === 'oak-hearth') {
    // Brick Fireplace with Mantle & Roaring Fire
    g.box(6, 5, 20, 22, '#64748b');
    g.box(5, 13, 22, 3, '#94a3b8');
    g.box(8, 7, 5, 3, '#7c869c');
    g.box(18, 9, 5, 3, '#7c869c');
    g.box(10, 16, 12, 11, '#140f17');
    g.box(11, 24, 10, 3, '#5c3a28');
    g.box(12, 19, 8, 6, '#ea580c');
    g.box(14, 18, 4, 6, '#fde047');
    g.set(15, 21, '#ffffff');
  } else if (furnitureId === 'woven-rug') {
    // Embroidered Tapestry Rug
    g.poly([[4, 19], [9, 12], [28, 12], [24, 19]], '#b83b5e');
    g.poly([[7, 18], [10, 13], [25, 13], [22, 18]], '#f08a5d');
    g.poly([[12, 17], [14, 14], [20, 14], [18, 17]], '#ffe680');
    g.box(3, 19, 21, 2, '#e2e8f0');
  } else if (furnitureId === 'scholar-desk') {
    // Rune-Carved Desk + Open Spellbook + Glowing Lamp
    g.box(4, 15, 24, 3, '#82563c');
    g.box(6, 18, 3, 9, '#593827');
    g.box(23, 18, 3, 9, '#593827');
    g.box(8, 11, 9, 4, '#f5ead0');
    g.box(12, 11, 1, 4, '#c7b287');
    g.box(20, 9, 5, 6, '#38bdf8');
    g.box(21, 10, 3, 4, '#e0f7ff');
  } else if (furnitureId === 'star-telescope') {
    // Brass Astrolabe Telescope on Tripod
    g.line(16, 14, 10, 26, '#7d533c', 2);
    g.line(16, 14, 22, 26, '#7d533c', 2);
    g.line(16, 14, 16, 26, '#593827', 2);
    g.line(9, 14, 22, 8, '#e8b84b', 4);
    g.box(20, 6, 4, 4, '#93c5fd');
    g.set(21, 7, '#ffffff');
  } else if (furnitureId === 'iron-dummy') {
    // Sparring Automaton with Steel Helm & Buckler
    g.box(14, 20, 4, 7, '#63402e');
    g.box(10, 25, 12, 2, '#4a2f21');
    g.box(10, 12, 12, 9, '#c2956b');
    g.box(7, 13, 18, 3, '#7d533c');
    g.box(12, 5, 8, 7, '#94a3b8');
    g.box(14, 7, 4, 2, '#1e293b');
    g.box(22, 12, 4, 7, '#d97706');
  } else if (furnitureId === 'moon-planter') {
    // Luminous Moonflower Planter with Fireflies
    g.box(11, 19, 10, 7, '#7c4d35');
    g.box(10, 18, 12, 2, '#9c6447');
    g.box(15, 12, 2, 7, '#4ade80');
    g.ellipse(16, 10, 5, 4, '#a78bfa');
    g.ellipse(16, 10, 3, 2, '#e9d5ff');
    g.set(16, 10, '#fef08a');
    g.set(8, 8, '#fde047');
    g.set(24, 9, '#67e8f9');
  } else if (furnitureId === 'barrel-rack') {
    // Oak Reserve Barrels
    g.box(6, 16, 9, 10, '#8c5a3c');
    g.box(17, 16, 9, 10, '#784b31');
    g.box(11, 8, 10, 9, '#a36b48');
    g.box(6, 18, 9, 1, '#cbd5e1');
    g.box(17, 18, 9, 1, '#cbd5e1');
    g.box(11, 10, 10, 1, '#e8b84b');
    g.box(11, 14, 10, 1, '#e8b84b');
  } else {
    // Bubbling Alchemy Cauldron
    g.ellipse(16, 19, 7, 6, '#334155');
    g.box(10, 13, 12, 2, '#475569');
    g.box(11, 12, 10, 2, '#4ade80');
    g.box(12, 25, 8, 2, '#ea580c');
    g.set(14, 25, '#fde047');
    g.set(13, 8, '#a78bfa');
    g.set(18, 6, '#86efac');
    g.set(16, 10, '#67e8f9');
  }

  g.applyOutline(SPRITE_INK);
  return { width: 32, height: 32, rects: g.toSvgRects() };
}
