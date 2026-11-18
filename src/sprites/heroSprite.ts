import {
  AVATAR_DEFAULT,
  PALETTES,
  type AvatarConfig,
  type ClassName,
  type EquipSlot,
} from '../types/arcana';
import { PixelGrid, SPRITE_INK, mixHex, shadeHex } from './PixelGrid';

export interface HeroRenderOptions {
  avatar: Partial<AvatarConfig>;
  className: ClassName;
  equipped?: Partial<Record<EquipSlot, string>>;
  costume?: Partial<Record<EquipSlot, string>>;
  costumeMode?: boolean;
  activeCosmetics?: Partial<Record<'Frame' | 'Badge', string>>;
  showClassPreview?: boolean;
  showGear?: boolean;
  includeBackground?: boolean;
}

export interface HeroSpriteLayers {
  bgRects: string;
  charRects: string;
  wispRects: string;
}

export function drawBiomeBackground(g: PixelGrid, bgIndex: number): void {
  const b = ((bgIndex || 0) % 5 + 5) % 5;

  if (b === 0) {
    // Moonmist Woods: twilight gradient, crescent moon, layered misty pines, moss floor
    g.box(0, 0, 48, 18, '#202842');
    g.box(0, 18, 48, 18, '#2b3857');
    g.box(0, 36, 48, 18, '#384c66');
    for (const [sx, sy] of [
      [5, 6],
      [14, 4],
      [25, 9],
      [43, 5],
      [31, 14],
      [8, 17],
    ] as const) {
      g.set(sx, sy, '#e3ecff');
    }
    // Crescent moon with subtle halo
    g.ellipse(38, 10, 5, 5, '#2b3857');
    g.ellipse(38, 10, 4, 4, '#fff4cc');
    g.ellipse(40, 9, 3, 3, '#202842');
    // Distant ridge & pines
    for (const [tx, th] of [
      [3, 25],
      [10, 30],
      [37, 27],
      [44, 22],
    ] as const) {
      g.box(tx, 54 - th, 2, th, '#252133');
      g.poly(
        [
          [tx - 4, 54 - th + 8],
          [tx + 1, 54 - th - 4],
          [tx + 6, 54 - th + 8],
        ],
        '#2c524d'
      );
      g.poly(
        [
          [tx - 5, 54 - th + 15],
          [tx + 1, 54 - th + 4],
          [tx + 7, 54 - th + 15],
        ],
        '#38695f'
      );
      g.poly(
        [
          [tx - 5, 54 - th + 22],
          [tx + 1, 54 - th + 11],
          [tx + 7, 54 - th + 22],
        ],
        '#2d544c'
      );
    }
    g.box(0, 49, 48, 3, '#5d7a88');
    // Ground & pixel grass tufts
    g.box(0, 54, 48, 10, '#497053');
    g.box(0, 54, 48, 2, '#65996c');
    g.box(0, 58, 48, 6, '#364f3f');
    for (let x = 2; x < 46; x += 6) {
      g.box(x, 53, 2, 1, '#7db37d');
      g.set(x + 3, 56, '#5c8a62');
    }
  } else if (b === 1) {
    // Sun Meadow: crisp azure sky, clouds, rolling hills, oak trees, wildflower meadow
    g.box(0, 0, 48, 24, '#7ac3e8');
    g.box(0, 24, 48, 16, '#9ed9f2');
    g.box(0, 40, 48, 14, '#bde8f5');
    g.ellipse(39, 9, 4, 4, '#ffe885');
    g.ellipse(39, 9, 2, 2, '#fff8cf');
    g.box(4, 9, 11, 3, '#eef9ff');
    g.box(6, 7, 7, 2, '#ffffff');
    g.ellipse(12, 54, 18, 9, '#6aa664');
    g.ellipse(38, 55, 18, 10, '#5a9456');
    for (const [tx, th] of [
      [5, 22],
      [42, 24],
    ] as const) {
      g.box(tx, 54 - th, 2, th, '#694a36');
      g.ellipse(tx + 1, 54 - th, 6, 6, '#3e8256');
      g.ellipse(tx, 54 - th - 2, 4, 4, '#5fa868');
    }
    g.box(0, 54, 48, 10, '#57944e');
    g.box(0, 54, 48, 2, '#7dc268');
    g.box(0, 59, 48, 5, '#4b382a');
    for (const [fx, fc] of [
      [4, '#ffe57a'],
      [13, '#f7a6c2'],
      [35, '#ffe57a'],
      [43, '#ffffff'],
    ] as const) {
      g.set(fx, 53, fc);
      g.set(fx, 54, '#478042');
    }
  } else if (b === 2) {
    // Arcane Hall: vaulted violet chamber, stone columns, stained glass, candle sconces, marble tiles
    g.box(0, 0, 48, 54, '#231b36');
    g.box(4, 5, 40, 49, '#2f2447');
    for (const px of [1, 42]) {
      g.box(px, 0, 5, 54, '#483a66');
      g.box(px + 1, 0, 1, 54, '#66548c');
      g.box(px, 12, 5, 1, '#33284a');
      g.box(px, 34, 5, 1, '#33284a');
    }
    g.ellipse(24, 17, 8, 10, '#493773');
    g.ellipse(24, 17, 6, 8, '#7759b5');
    g.box(23, 9, 2, 16, '#231b36');
    g.box(17, 17, 14, 2, '#231b36');
    for (const [cx, cy] of [
      [10, 24],
      [37, 22],
    ] as const) {
      g.set(cx, cy - 2, '#fff5bd');
      g.set(cx, cy - 1, '#f2a94b');
      g.box(cx, cy, 1, 3, '#ded5ec');
      g.box(cx - 1, cy + 3, 3, 1, '#8c7ca6');
    }
    g.box(0, 54, 48, 10, '#4a3c63');
    g.box(0, 54, 48, 1, '#8470ad');
    for (let x = 0; x < 48; x += 6) {
      g.box(x, 55, 3, 9, '#3b2f52');
    }
  } else if (b === 3) {
    // Twilight Ruins: amber sunset bands, distant pyramids/dunes, ruined stone monoliths
    g.box(0, 0, 48, 20, '#4d3457');
    g.box(0, 20, 48, 16, '#854e64');
    g.box(0, 36, 48, 18, '#c77a67');
    g.ellipse(36, 25, 6, 6, '#ffd28c');
    g.ellipse(36, 25, 4, 4, '#fff0c4');
    g.poly([[0, 54], [13, 40], [27, 54]], '#8f5952');
    g.poly([[22, 54], [37, 42], [48, 54]], '#7a4a47');
    g.box(3, 28, 5, 26, '#4a3950');
    g.box(4, 28, 1, 26, '#6e5872');
    g.box(40, 33, 4, 21, '#4a3950');
    g.box(0, 54, 48, 10, '#a66d50');
    g.box(0, 54, 48, 2, '#cf9369');
    g.box(0, 59, 48, 5, '#784c3a');
  } else {
    // Frost Garden: aurora sky, frosted pine trees, crisp snowdrifts
    g.box(0, 0, 48, 22, '#192e47');
    g.box(0, 22, 48, 18, '#264866');
    g.box(0, 40, 48, 14, '#436e8c');
    g.box(3, 8, 18, 2, '#5fd1b5');
    g.box(14, 10, 22, 2, '#7ce8d0');
    for (const [sx, sy] of [
      [7, 16],
      [19, 6],
      [35, 14],
      [42, 24],
      [11, 31],
    ] as const) {
      g.set(sx, sy, '#eaf8ff');
    }
    for (const [tx, th] of [
      [4, 22],
      [41, 25],
    ] as const) {
      g.box(tx, 54 - th, 2, th, '#46586e');
      g.poly([[tx - 4, 54 - th + 9], [tx + 1, 54 - th - 4], [tx + 6, 54 - th + 9]], '#8bb6cd');
      g.poly([[tx - 3, 54 - th + 5], [tx + 1, 54 - th - 4], [tx + 5, 54 - th + 5]], '#e6f6ff');
    }
    g.box(0, 54, 48, 10, '#b5d6e8');
    g.box(0, 54, 48, 2, '#effaff');
    g.box(0, 59, 48, 5, '#7ea5be');
  }
}

function drawBackHair(
  g: PixelGrid,
  hairStyle: number,
  hairBase: string,
  hairDark: string,
  hairLight: string
): void {
  const hs = hairStyle % 10;
  const hairDeep = shadeHex(hairBase, 0.48);
  if (hs === 1) {
    g.box(15, 20, 4, 14, hairDark);
    g.box(16, 22, 1, 10, hairDeep);
    g.box(31, 21, 3, 12, hairDark);
    g.box(32, 23, 1, 8, hairDeep);
  } else if (hs === 4) {
    g.ellipse(25, 20, 10, 8, hairDark);
    g.ellipse(17, 25, 3, 5, hairDark);
    g.ellipse(32, 25, 3, 5, hairDark);
    g.set(16, 24, hairBase);
    g.set(33, 24, hairDeep);
  } else if (hs === 5) {
    // Layered Ponytail with strand dithering
    g.box(12, 18, 5, 15, hairDark);
    g.box(13, 19, 2, 12, hairBase);
    g.box(13, 21, 1, 7, hairLight);
    g.box(11, 29, 4, 6, hairDeep);
    g.box(12, 30, 1, 4, hairBase);
    g.box(15, 18, 2, 3, '#d4a44e');
  } else if (hs === 7) {
    // Long flowing layered hair with vertical strand highlights
    g.box(14, 18, 4, 22, hairDark);
    g.box(15, 19, 2, 19, hairBase);
    g.box(15, 22, 1, 12, hairLight);
    g.box(31, 20, 3, 19, hairDark);
    g.box(32, 22, 1, 14, hairDeep);
    g.box(16, 36, 17, 4, hairDark);
    g.box(18, 37, 6, 2, hairBase);
    g.box(25, 38, 5, 2, hairDeep);
  } else if (hs === 8) {
    // Twin braids with woven highlight pixels & gold ties
    g.box(14, 21, 3, 20, hairDark);
    g.box(32, 21, 3, 20, hairDark);
    for (let y = 22; y < 38; y += 3) {
      g.set(15, y, hairLight);
      g.set(14, y + 1, hairBase);
      g.set(16, y + 2, hairDeep);
      g.set(33, y, hairLight);
      g.set(32, y + 1, hairBase);
      g.set(34, y + 2, hairDeep);
    }
    g.box(14, 39, 3, 2, '#e8c066');
    g.box(32, 39, 3, 2, '#e8c066');
  }
}

function drawFrontHair(
  g: PixelGrid,
  hairStyle: number,
  hairBase: string,
  hairDark: string,
  hairLight: string
): void {
  const hs = hairStyle % 10;
  const hairDeep = shadeHex(hairBase, 0.48);
  const hairSpec = mixHex(hairBase, '#ffffff', 0.36);

  if (hs === 0) {
    // Short Heroic with crown sheen, dithered strands & tapered side locks
    g.box(17, 13, 15, 5, hairBase);
    g.box(19, 12, 11, 2, hairBase);
    g.box(20, 13, 6, 2, hairLight);
    g.box(21, 13, 3, 1, hairSpec);
    g.box(16, 16, 3, 7, hairDark);
    g.set(17, 18, hairBase);
    g.box(30, 16, 3, 4, hairDark);
    g.box(20, 18, 4, 2, hairBase);
    g.set(22, 18, hairLight);
    g.box(27, 18, 4, 2, hairDeep);
  } else if (hs === 1) {
    // Wave
    g.box(17, 13, 16, 5, hairBase);
    g.box(19, 12, 11, 2, hairLight);
    g.box(21, 12, 5, 1, hairSpec);
    g.box(16, 16, 4, 10, hairBase);
    g.box(19, 18, 6, 3, hairLight);
    g.box(28, 17, 5, 4, hairDark);
    g.box(30, 19, 2, 2, hairDeep);
  } else if (hs === 2) {
    // Messy Windblown
    g.box(17, 14, 15, 4, hairBase);
    g.poly([[18, 14], [20, 9], [23, 14]], hairLight);
    g.poly([[23, 14], [26, 8], [29, 14]], hairBase);
    g.set(25, 10, hairSpec);
    g.poly([[28, 14], [32, 10], [33, 15]], hairDark);
    g.box(16, 17, 3, 7, hairDeep);
    g.box(21, 18, 3, 2, hairLight);
    g.box(27, 18, 4, 2, hairDark);
  } else if (hs === 3) {
    // Spiky Terraria Warrior
    g.box(17, 14, 15, 4, hairBase);
    g.poly([[16, 16], [18, 10], [21, 15]], hairDark);
    g.poly([[20, 14], [23, 8], [26, 14]], hairLight);
    g.set(23, 10, hairSpec);
    g.poly([[25, 14], [28, 9], [31, 14]], hairBase);
    g.poly([[29, 15], [33, 11], [33, 17]], hairDeep);
    g.box(16, 17, 3, 6, hairDark);
  } else if (hs === 4) {
    // Curly Crown
    g.ellipse(25, 14, 8, 4, hairBase);
    g.ellipse(20, 14, 4, 3, hairLight);
    g.set(20, 13, hairSpec);
    g.ellipse(30, 15, 3, 3, hairDark);
    g.box(16, 17, 3, 8, hairBase);
    g.box(30, 17, 3, 5, hairDeep);
  } else if (hs === 5) {
    // Ponytail Crown
    g.box(17, 13, 15, 5, hairBase);
    g.box(19, 12, 11, 2, hairLight);
    g.box(21, 12, 4, 1, hairSpec);
    g.box(16, 16, 3, 7, hairDark);
    g.box(25, 18, 6, 2, hairBase);
    g.box(28, 18, 3, 2, hairDeep);
  } else if (hs === 6) {
    // Side Part
    g.box(17, 13, 15, 5, hairBase);
    g.box(18, 12, 12, 2, hairLight);
    g.box(20, 12, 5, 1, hairSpec);
    g.box(16, 16, 3, 8, hairDark);
    g.poly([[19, 17], [29, 17], [21, 21]], hairBase);
    g.box(29, 17, 4, 3, hairDeep);
  } else if (hs === 7) {
    // Long Front Crown
    g.box(17, 13, 15, 5, hairBase);
    g.box(20, 13, 7, 2, hairLight);
    g.box(21, 13, 3, 1, hairSpec);
    g.box(16, 16, 3, 12, hairBase);
    g.box(30, 16, 3, 8, hairDeep);
    g.box(22, 18, 4, 2, hairBase);
  } else if (hs === 8) {
    // Braids Crown
    g.box(17, 13, 15, 5, hairBase);
    g.box(20, 12, 9, 2, hairLight);
    g.box(24, 13, 1, 5, hairDeep);
    g.box(16, 16, 3, 9, hairBase);
    g.box(30, 16, 3, 6, hairDark);
  } else {
    // Fringe
    g.box(17, 13, 16, 6, hairBase);
    g.box(19, 12, 11, 2, hairLight);
    g.box(21, 12, 4, 1, hairSpec);
    g.box(18, 19, 13, 2, hairDark);
    g.box(21, 19, 3, 1, hairBase);
    g.box(16, 17, 3, 8, hairDeep);
    g.box(30, 18, 3, 5, hairDeep);
  }
}

function drawWeaponSprite(g: PixelGrid, weaponId: string): void {
  if (weaponId === 'training-sword' || weaponId === 'copper-broadsword') {
    const blade = weaponId === 'copper-broadsword' ? '#d48255' : '#9fb0c4';
    const edge = weaponId === 'copper-broadsword' ? '#ffc49e' : '#edf4fc';
    g.line(14, 41, 6, 23, blade, 2);
    g.line(13, 40, 6, 23, edge, 1);
    g.line(12, 37, 8, 28, '#758599', 1);
    g.box(11, 39, 6, 2, '#c99b49');
    g.box(13, 41, 2, 3, '#6e4c34');
    g.box(13, 44, 3, 2, '#e3be6b');
  } else if (weaponId === 'moonblade') {
    g.line(14, 41, 4, 16, '#6ca4de', 3);
    g.line(13, 40, 4, 16, '#dcf2ff', 1);
    g.line(11, 35, 6, 21, '#94eeff', 1);
    g.set(4, 15, '#ffffff');
    g.box(10, 38, 8, 2, '#dbe6f5');
    g.box(13, 38, 2, 2, '#62e0ff');
    g.box(13, 40, 2, 4, '#3e395e');
    g.box(12, 44, 4, 2, '#73dcff');
  } else if (weaponId === 'sunflare-axe') {
    g.line(14, 48, 7, 20, '#6e4930', 2);
    g.poly([[3, 18], [10, 17], [11, 27], [4, 25]], '#e08943');
    g.poly([[3, 19], [7, 18], [7, 25]], '#ffd478');
    g.box(6, 20, 2, 2, '#fff5cc');
  } else if (weaponId === 'crimson-katana') {
    g.line(14, 41, 4, 15, '#dfe6f2', 2);
    g.line(13, 40, 4, 15, '#ffffff', 1);
    g.box(11, 39, 5, 2, '#d9b559');
    g.box(13, 41, 2, 4, '#a62e46');
  } else if (weaponId === 'runestaff' || weaponId === 'celestial-wand' || weaponId === 'frost-staff') {
    const shaft = weaponId === 'frost-staff' ? '#b8d4eb' : '#7a5233';
    const orbOuter =
      weaponId === 'celestial-wand' ? '#6b469c' : weaponId === 'frost-staff' ? '#4f8dc4' : '#503978';
    const orbInner =
      weaponId === 'celestial-wand' ? '#ff9ee0' : weaponId === 'frost-staff' ? '#a6f4ff' : '#5be3e6';
    g.line(13, 54, 11, 21, shaft, 2);
    g.line(12, 53, 11, 22, mixHex(shaft, '#ffffff', 0.25), 1);
    g.box(10, 23, 3, 2, '#e0ba63');
    g.box(8, 16, 6, 6, orbOuter);
    g.ellipse(11, 19, 2, 2, orbInner);
    g.set(10, 18, '#ffffff');
    g.set(7, 15, '#9bf5ff');
  } else if (weaponId === 'shadowdagger') {
    g.line(14, 40, 7, 28, '#5c4b82', 2);
    g.line(13, 39, 7, 28, '#cfc2f5', 1);
    g.set(9, 32, '#9d87d9');
    g.box(11, 39, 5, 2, '#3a3447');
    g.box(13, 41, 2, 3, '#a63f5f');
  } else if (weaponId === 'huntingbow') {
    g.poly([[14, 21], [9, 27], [8, 39], [9, 49], [14, 55]], '#8f6236');
    g.line(12, 23, 9, 38, '#bf8f58', 1);
    g.box(8, 36, 2, 5, '#59422c');
    g.line(14, 22, 14, 54, '#ebe3cc', 1);
    g.line(8, 38, 18, 38, '#d9d2b8', 1);
    g.set(7, 38, '#e8f4fa');
    g.set(17, 37, '#cf5b5b');
  } else if (weaponId === 'reaper-scythe') {
    g.line(13, 54, 9, 17, '#4d3930', 2);
    g.poly([[9, 16], [19, 18], [17, 26], [13, 21], [7, 19]], '#8c9eb5');
    g.line(11, 17, 17, 22, '#e3edfa', 1);
    g.set(9, 18, '#ff9447');
  } else if (weaponId === 'candycane-blade') {
    g.line(14, 41, 5, 19, '#f7f7fc', 3);
    g.line(12, 36, 10, 32, '#d93644', 3);
    g.line(9, 29, 7, 25, '#d93644', 3);
    g.box(10, 38, 7, 2, '#5cc474');
    g.box(13, 40, 2, 4, '#b82836');
  }
}

function drawOffhandSprite(g: PixelGrid, offhandId: string): void {
  if (offhandId === 'oakshield' || offhandId === 'dragon-kite') {
    const outer = offhandId === 'dragon-kite' ? '#7a2c3b' : '#7d5131';
    const inner = offhandId === 'dragon-kite' ? '#a83c50' : '#a67247';
    const rim = offhandId === 'dragon-kite' ? '#ebd074' : '#9ca8b8';
    g.box(30, 35, 9, 11, outer);
    g.box(31, 36, 7, 9, inner);
    g.box(30, 35, 9, 2, rim);
    g.box(30, 45, 9, 1, '#758194');
    g.box(33, 39, 3, 4, '#eccb74');
    g.set(34, 40, '#fff4bd');
  } else if (offhandId === 'iron-buckler') {
    g.ellipse(34, 41, 5, 5, '#7a8a9e');
    g.ellipse(34, 41, 3, 3, '#b8c8db');
    g.set(34, 41, '#e6be60');
  } else if (offhandId === 'wardbook') {
    g.box(31, 37, 8, 9, '#5e4096');
    g.box(32, 38, 6, 7, '#8763c7');
    g.box(37, 38, 2, 7, '#f2eadc');
    g.box(33, 40, 3, 3, '#f5d47a');
    g.set(34, 45, '#d64e6c');
  } else if (offhandId === 'crystal-orb') {
    g.ellipse(35, 39, 4, 4, '#4684b5');
    g.ellipse(34, 38, 2, 2, '#8ce8ff');
    g.set(33, 37, '#ffffff');
    g.box(33, 43, 4, 2, '#d9b559');
  } else if (offhandId === 'pumpkin-lantern') {
    g.box(34, 36, 2, 2, '#4c733d');
    g.ellipse(35, 41, 4, 4, '#eb7c28');
    g.set(33, 40, '#fff194');
    g.set(36, 40, '#fff194');
    g.box(33, 42, 4, 1, '#fff194');
  }
}

export function buildHeroSpriteLayers(opts: HeroRenderOptions): HeroSpriteLayers {
  const d: AvatarConfig = { ...AVATAR_DEFAULT, ...opts.avatar };
  const bgGrid = new PixelGrid(48, 64);
  if (opts.includeBackground !== false) {
    drawBiomeBackground(bgGrid, d.bg);
    // Subtle ground contact shadow beneath boots so the hero pops with grounded depth
    bgGrid.box(18, 57, 13, 2, '#1e1929');
    bgGrid.box(20, 58, 9, 1, '#14101c');
  }

  const useGear = opts.showGear !== false;
  const activeMap = opts.costumeMode ? opts.costume || {} : opts.equipped || {};
  const weaponId = useGear ? activeMap.Weapon : undefined;
  const offhandId = useGear ? activeMap['Off-hand'] : undefined;
  const headId = useGear ? activeMap.Head : undefined;
  const armorId = useGear ? activeMap.Armor : undefined;
  const backId = useGear ? activeMap.Back : undefined;
  const eyewearId = useGear ? activeMap.Eyewear : undefined;
  const accessoryId = useGear ? activeMap.Accessory : undefined;

  const skinBase = PALETTES.skin[d.skin % PALETTES.skin.length];
  const skinShadow = shadeHex(skinBase, 0.79);
  const skinLight = mixHex(skinBase, '#ffffff', 0.19);
  const cheekTint = mixHex(skinBase, '#e07272', 0.22);

  const hairBase = PALETTES.hair[d.hairColor % PALETTES.hair.length];
  const hairDark = shadeHex(hairBase, 0.64);
  const hairLight = mixHex(hairBase, '#ffffff', 0.25);

  const eyeIris = PALETTES.eye[d.eyeColor % PALETTES.eye.length];

  const topBase = PALETTES.top[d.top % PALETTES.top.length];
  const topDark = shadeHex(topBase, 0.7);
  const topLight = mixHex(topBase, '#ffffff', 0.22);

  const pantsBase = PALETTES.pants[d.pants % PALETTES.pants.length];
  const pantsDark = shadeHex(pantsBase, 0.72);
  const pantsLight = mixHex(pantsBase, '#ffffff', 0.16);

  const g = new PixelGrid(48, 64);

  // 1. Back / Cape / Wings layer
  if (backId === 'feather-wings') {
    g.poly([[18, 36], [5, 22], [8, 42], [17, 45]], '#eef5fc');
    g.poly([[31, 36], [43, 22], [40, 42], [32, 45]], '#eef5fc');
    g.line(10, 29, 17, 39, '#ffd978', 1);
    g.line(38, 29, 32, 39, '#ffd978', 1);
  } else if (backId === 'bat-cloak') {
    g.poly([[16, 34], [33, 34], [38, 53], [31, 49], [24, 55], [17, 49], [11, 53]], '#2f2442');
    g.line(16, 35, 13, 51, '#644d8a', 1);
    g.box(18, 34, 13, 2, '#eb802d');
  } else if (backId === 'frost-cloak') {
    g.poly([[16, 34], [33, 34], [36, 55], [13, 55]], '#5ea8d6');
    g.line(17, 35, 15, 53, '#a3e0ff', 1);
    g.box(17, 34, 15, 2, '#ffffff');
  } else if (backId === 'crimson-mantle') {
    g.poly([[16, 34], [33, 34], [36, 55], [13, 55]], '#8f2940');
    g.line(17, 35, 15, 53, '#c74c66', 1);
    g.box(18, 34, 13, 2, '#ebd074');
  } else if (backId === 'nightcloak' || (opts.showClassPreview && opts.className === 'Rogue')) {
    g.poly([[17, 34], [32, 34], [36, 54], [28, 56], [14, 53]], '#2e2542');
    g.line(17, 35, 15, 52, '#5c4b85', 1);
    g.box(18, 34, 13, 2, '#c9a659');
  } else if (opts.showClassPreview && opts.className === 'Knight') {
    g.poly([[16, 34], [32, 34], [35, 54], [15, 54]], '#823244');
    g.line(17, 35, 16, 53, '#b84b60', 1);
  } else if (opts.showClassPreview && opts.className === 'Mage') {
    g.poly([[16, 34], [32, 34], [36, 55], [14, 55]], '#46367d');
    g.line(17, 35, 15, 54, '#755cc4', 1);
  } else if (d.accessory === 1) {
    g.poly([[17, 34], [32, 34], [35, 52], [15, 51]], '#8c435a');
    g.line(17, 35, 16, 50, '#ba5b76', 1);
  }

  // 2. Back hair layer
  if (headId !== 'silkhood') {
    drawBackHair(g, d.hair, hairBase, hairDark, hairLight);
  }

  // 3. Legs & Detailed Terraria Boots
  g.box(19, 46, 5, 7, pantsBase);
  g.box(20, 46, 2, 6, pantsLight);
  g.box(25, 46, 5, 7, pantsDark);
  g.box(26, 47, 2, 5, pantsBase);
  g.box(24, 47, 1, 7, '#1d1826');
  // Cuffed boots with metallic buckle & sole
  g.box(19, 53, 5, 5, '#4d3629');
  g.box(19, 53, 5, 1, '#7a5c46');
  g.set(22, 54, '#d9b566');
  g.box(20, 57, 5, 1, '#2b1e18');
  g.box(25, 53, 5, 5, '#3b2920');
  g.box(25, 53, 5, 1, '#634937');
  g.set(28, 54, '#b8944c');
  g.box(25, 57, 6, 1, '#241914');

  // 4. Back arm
  g.box(31, 35, 3, 7, topDark);
  g.box(31, 42, 3, 3, skinShadow);

  // 5. Torso & Detailed Armor / Clothing
  if (opts.showClassPreview) {
    if (opts.className === 'Knight') {
      g.box(18, 34, 14, 12, '#8b99ab');
      g.box(19, 35, 5, 9, '#ccd7e3');
      g.box(27, 35, 4, 9, '#657285');
      g.box(22, 36, 5, 5, '#dec273');
      g.box(18, 44, 14, 2, '#4d3a2c');
      g.box(24, 44, 3, 2, '#f0ce73');
    } else if (opts.className === 'Mage') {
      g.box(18, 34, 14, 14, '#5a4699');
      g.box(19, 35, 4, 12, '#836ac9');
      g.box(27, 35, 4, 12, '#413273');
      g.box(23, 34, 4, 13, '#d9c589');
      g.box(18, 44, 14, 2, '#35265e');
    } else if (opts.className === 'Healer') {
      g.box(18, 34, 14, 13, '#d7ece0');
      g.box(19, 35, 4, 11, '#ffffff');
      g.box(27, 35, 4, 11, '#98c4ab');
      g.box(23, 37, 4, 6, '#58a882');
      g.box(21, 39, 8, 2, '#58a882');
      g.box(18, 44, 14, 2, '#d4af63');
    } else if (opts.className === 'Rogue') {
      g.box(18, 34, 14, 12, '#353a47');
      g.box(19, 35, 4, 10, '#51586b');
      g.box(27, 35, 4, 10, '#222630');
      g.line(19, 34, 29, 44, '#7d3448', 2);
      g.box(18, 44, 14, 2, '#1f222b');
    } else {
      g.box(18, 34, 14, 12, '#527347');
      g.box(19, 35, 4, 10, '#749c64');
      g.box(27, 35, 4, 10, '#3a5432');
      g.box(21, 35, 7, 9, '#7a593b');
      g.box(18, 44, 14, 2, '#473424');
    }
  } else if (armorId === 'steelplate') {
    g.box(18, 34, 14, 12, '#8898ad');
    g.box(19, 35, 5, 9, '#cddae8');
    g.box(27, 35, 4, 9, '#616e80');
    g.box(22, 36, 5, 5, '#ebd074');
    g.box(18, 44, 14, 2, '#4d3a2c');
  } else if (armorId === 'star-robe') {
    g.box(18, 34, 14, 14, '#523d8c');
    g.box(19, 35, 4, 12, '#8267c9');
    g.box(23, 34, 4, 13, '#f0ce6e');
    g.box(18, 44, 14, 2, '#35265e');
  } else if (armorId === 'shadow-leathers') {
    g.box(18, 34, 14, 12, '#333845');
    g.box(19, 35, 4, 10, '#52596e');
    g.line(19, 34, 29, 44, '#8a354d', 2);
    g.box(18, 44, 14, 2, '#1f222b');
  } else if (armorId === 'emerald-tunic') {
    g.box(18, 34, 14, 12, '#48734d');
    g.box(19, 35, 4, 10, '#6da36f');
    g.box(21, 35, 7, 9, '#7a593b');
    g.box(18, 44, 14, 2, '#473424');
  } else if (armorId === 'autumn-cloak') {
    g.box(18, 34, 14, 13, '#a8512c');
    g.box(19, 35, 4, 11, '#db7c48');
    g.box(21, 34, 7, 3, '#f0b856');
    g.box(18, 43, 14, 2, '#5c3f2e');
    g.box(24, 43, 3, 2, '#f0b856');
  } else if (armorId === 'holiday-coat') {
    g.box(18, 34, 14, 13, '#b82e3f');
    g.box(19, 35, 4, 11, '#e6495c');
    g.box(21, 34, 7, 3, '#ffffff');
    g.box(18, 45, 14, 2, '#ffffff');
    g.box(18, 42, 14, 2, '#242026');
    g.box(24, 42, 3, 2, '#f5d47a');
  } else if (armorId === 'wandercoat') {
    g.box(18, 34, 14, 13, '#576b8a');
    g.box(19, 35, 4, 11, '#7c96bd');
    g.box(27, 35, 4, 11, '#3d4d66');
    g.box(21, 34, 7, 3, '#cfba8c'); // Fur collar
    g.set(24, 38, '#ebd07a'); // Brass button
    g.set(24, 41, '#ebd07a');
    g.box(18, 43, 14, 2, '#5c3f2e');
    g.box(24, 43, 3, 2, '#ebd07a');
  } else {
    g.box(18, 34, 14, 12, topBase);
    g.box(19, 35, 4, 10, topLight);
    g.box(27, 35, 4, 10, topDark);
    g.box(22, 34, 5, 2, '#e6dac8');
    g.box(24, 37, 1, 5, topDark); // Placket seam
    g.box(18, 44, 14, 2, '#4a382c');
    g.box(24, 44, 3, 2, '#e3be68');
  }

  // Chest / Neck Accessories
  if (accessoryId === 'moonpendant') {
    g.box(23, 36, 4, 1, '#cbd6e3');
    g.box(24, 37, 2, 3, '#6de2e8');
    g.set(24, 37, '#ffffff');
  } else if (accessoryId === 'ruby-amulet') {
    g.box(23, 36, 4, 1, '#e8c468');
    g.box(24, 37, 2, 3, '#db3b59');
    g.set(24, 37, '#ffa8b8');
  } else if (accessoryId === 'lucky-clover') {
    g.box(23, 36, 3, 3, '#5cd682');
    g.set(24, 37, '#ffffff');
  } else if (accessoryId === 'gift-charm') {
    g.box(23, 36, 4, 1, '#d43b4a');
    g.box(24, 37, 2, 3, '#f2c852');
    g.set(24, 37, '#ffffff');
  } else if (d.accessory === 2) {
    g.box(24, 36, 3, 3, '#f0cc69');
    g.set(24, 36, '#fff3b8');
  } else if (d.accessory === 3) {
    g.box(18, 33, 14, 3, '#c95f55');
    g.box(19, 34, 4, 5, '#e0796c');
  } else if (d.accessory === 5) {
    g.line(19, 34, 29, 44, '#7d593a', 1);
    g.box(28, 42, 4, 5, '#9c714a');
    g.set(29, 44, '#e0ba63');
  }

  // 6. Neck & Sculpted Terraria Head
  g.box(22, 32, 6, 2, skinShadow);
  g.box(18, 15, 14, 17, skinBase);
  g.box(20, 14, 10, 2, skinBase);
  g.box(17, 17, 16, 13, skinBase);
  g.box(19, 31, 12, 2, skinShadow);
  g.box(19, 17, 9, 10, skinLight);
  // Ear + cheek blush + nose + mouth
  g.box(16, 22, 2, 4, skinBase);
  g.set(16, 23, skinShadow);
  g.box(20, 26, 2, 1, cheekTint);
  g.box(30, 26, 2, 1, cheekTint);
  g.box(26, 25, 2, 2, skinShadow);
  g.box(24, 29, 4, 1, '#945450');

  // 7. Expressive Eyes + Hair-matched Eyebrows
  const ey = d.eyes === 4 ? 23 : 22;
  g.box(22, ey - 2, 2, 1, hairDark);
  g.box(28, ey - 2, 2, 1, hairDark);
  if (d.eyes === 0) {
    g.box(22, ey, 1, 3, '#f5f8ff');
    g.box(23, ey, 1, 3, eyeIris);
    g.set(23, ey, '#ffffff');
    g.box(28, ey, 1, 3, '#f5f8ff');
    g.box(29, ey, 1, 3, eyeIris);
    g.set(29, ey, '#ffffff');
  } else if (d.eyes === 1) {
    g.box(22, ey, 2, 1, '#261e2e');
    g.set(22, ey + 1, '#f5f8ff');
    g.set(23, ey + 1, eyeIris);
    g.box(28, ey, 2, 1, '#261e2e');
    g.set(28, ey + 1, '#f5f8ff');
    g.set(29, ey + 1, eyeIris);
  } else if (d.eyes === 2) {
    g.box(21, ey, 1, 3, '#f5f8ff');
    g.box(22, ey, 2, 3, eyeIris);
    g.set(22, ey, '#ffffff');
    g.box(27, ey, 1, 3, '#f5f8ff');
    g.box(28, ey, 2, 3, eyeIris);
    g.set(28, ey, '#ffffff');
  } else if (d.eyes === 3) {
    g.set(22, ey + 1, '#f5f8ff');
    g.box(23, ey + 1, 1, 2, eyeIris);
    g.set(28, ey + 1, '#f5f8ff');
    g.box(29, ey + 1, 1, 2, eyeIris);
  } else {
    g.box(22, ey, 2, 1, skinShadow);
    g.box(22, ey + 1, 2, 1, eyeIris);
    g.box(28, ey, 2, 1, skinShadow);
    g.box(28, ey + 1, 2, 1, eyeIris);
  }

  // 8. Front Hair + Forehead Cast Shadow
  const hidesHair =
    headId === 'silkhood' ||
    headId === 'paladin-helm' ||
    headId === 'pumpkin-helm' ||
    headId === 'witch-hat' ||
    headId === 'santa-hat';
  if (!hidesHair && !(opts.showClassPreview && opts.className === 'Rogue')) {
    g.box(18, 19, 13, 1, skinShadow);
    drawFrontHair(g, d.hair, hairBase, hairDark, hairLight);
  }

  // 9. Headband / Headgear / Frost Crown
  if (d.accessory === 4 && !headId) {
    g.box(17, 18, 16, 2, '#c94964');
    g.box(18, 18, 6, 1, '#eb718b');
  }

  if (opts.showClassPreview) {
    if (opts.className === 'Knight') {
      g.box(16, 13, 18, 6, '#93a2b5');
      g.box(18, 14, 7, 3, '#d4e0ed');
      g.box(17, 18, 16, 2, '#4c5769');
      g.box(23, 11, 4, 3, '#c9495e');
    } else if (opts.className === 'Mage') {
      g.poly([[14, 16], [24, 6], [27, 6], [35, 16]], '#5d439c');
      g.box(14, 15, 21, 2, '#412e73');
      g.box(18, 14, 13, 1, '#e0bf6a');
    } else if (opts.className === 'Healer') {
      g.box(18, 13, 14, 2, '#ebd078');
      g.box(23, 11, 4, 2, '#7ce0b2');
    } else if (opts.className === 'Rogue') {
      g.box(16, 13, 18, 7, '#343947');
      g.box(18, 14, 6, 3, '#52596e');
      g.box(18, 26, 14, 6, '#272b36');
    } else {
      g.poly([[16, 16], [24, 9], [33, 16]], '#4f7045');
      g.box(17, 15, 16, 2, '#37502f');
      g.line(29, 14, 34, 9, '#d9b566', 1);
    }
  } else if (headId === 'ironhelm') {
    g.box(16, 15, 18, 4, '#8d9cb0');
    g.box(18, 15, 6, 2, '#cbd7e6');
    g.box(24, 15, 2, 3, '#72d5eb');
    g.set(24, 15, '#ffffff');
  } else if (headId === 'paladin-helm') {
    g.box(16, 13, 18, 6, '#c2cfde');
    g.box(18, 14, 7, 3, '#f0f6fc');
    g.box(17, 18, 16, 2, '#5c6b80');
    g.box(23, 10, 4, 3, '#c9425b');
  } else if (headId === 'ranger-hat') {
    g.poly([[17, 15], [24, 9], [31, 15]], '#4e7342');
    g.box(14, 15, 21, 2, '#38542e');
    g.line(29, 13, 34, 8, '#e85d5d', 1);
  } else if (headId === 'gold-crown') {
    g.box(18, 12, 14, 4, '#e8bc4a');
    g.poly([[18, 12], [20, 8], [22, 12]], '#ffe175');
    g.poly([[23, 12], [25, 7], [27, 12]], '#ffe175');
    g.poly([[28, 12], [30, 8], [32, 12]], '#ffe175');
    g.box(24, 13, 2, 2, '#e84868');
  } else if (headId === 'silkhood') {
    g.box(16, 13, 18, 7, '#58428c');
    g.box(18, 14, 7, 3, '#8366c4');
    g.box(16, 19, 3, 9, '#463473');
    g.box(31, 19, 3, 7, '#463473');
    g.box(19, 18, 12, 2, '#e3c06b');
  } else if (headId === 'pumpkin-helm') {
    g.box(24, 11, 3, 3, '#4c733d');
    g.ellipse(25, 22, 9, 8, '#e36f1e');
    g.ellipse(22, 20, 4, 5, '#ff9940');
    g.box(20, 20, 3, 2, '#fff08a');
    g.box(27, 20, 3, 2, '#fff08a');
    g.box(21, 26, 8, 2, '#fff08a');
  } else if (headId === 'witch-hat') {
    g.poly([[17, 15], [24, 4], [32, 15]], '#46336e');
    g.box(12, 15, 25, 2, '#332354');
    g.box(17, 14, 15, 1, '#eb802d');
    g.box(24, 14, 2, 1, '#ffe078');
  } else if (headId === 'santa-hat') {
    g.poly([[17, 16], [24, 6], [33, 12], [31, 16]], '#cf3244');
    g.box(16, 15, 18, 3, '#f5f7fc');
    g.ellipse(34, 12, 2, 2, '#ffffff');
  }

  if (opts.activeCosmetics?.Badge === 'winter-crown') {
    g.box(18, 11, 14, 3, '#80d2f0');
    g.box(19, 9, 2, 2, '#dcf6ff');
    g.box(24, 8, 2, 3, '#ffffff');
    g.box(29, 9, 2, 2, '#dcf6ff');
  }

  // 10. Eyewear
  if (eyewearId === 'arcane-visor') {
    g.box(20, ey - 1, 12, 4, '#394159');
    g.box(21, ey, 10, 2, '#63ecff');
  } else if (eyewearId === 'monocle') {
    g.box(27, ey - 1, 4, 4, '#e8c45e');
    g.box(28, ey, 2, 2, '#b8e8fa');
    g.line(30, ey + 3, 31, ey + 7, '#e8c45e', 1);
  } else {
    const glassesChoice = eyewearId === 'glasses' ? 2 : d.glasses;
    if (glassesChoice > 0) {
      const frameColor = ['#2a2c36', '#2a2c36', '#e0be67', '#181820'][glassesChoice] || '#2a2c36';
      g.box(21, ey - 1, 4, 4, frameColor);
      g.box(25, ey, 2, 1, frameColor);
      g.box(27, ey - 1, 4, 4, frameColor);
      if (glassesChoice !== 3) {
        g.box(22, ey, 2, 2, '#b0dcf0');
        g.box(28, ey, 2, 2, '#b0dcf0');
      } else {
        g.box(22, ey, 2, 2, '#222638');
        g.box(28, ey, 2, 2, '#222638');
      }
    }
  }

  // 11. Front Arm & Cuff
  const sleeveColor = opts.showClassPreview
    ? opts.className === 'Knight'
      ? '#9aa8ba'
      : opts.className === 'Mage'
        ? '#6750ab'
        : opts.className === 'Healer'
          ? '#e8f5ee'
          : opts.className === 'Rogue'
            ? '#3c4252'
            : '#5c8050'
    : armorId === 'steelplate'
      ? '#8898ad'
      : armorId === 'star-robe'
        ? '#523d8c'
        : armorId === 'shadow-leathers'
          ? '#333845'
          : armorId === 'emerald-tunic'
            ? '#48734d'
            : armorId === 'autumn-cloak'
              ? '#a8512c'
              : armorId === 'holiday-coat'
                ? '#b82e3f'
                : armorId === 'wandercoat'
                  ? '#647b9e'
                  : topBase;
  g.box(15, 35, 3, 6, sleeveColor);
  g.box(15, 35, 2, 2, mixHex(sleeveColor, '#ffffff', 0.22));
  g.box(15, 41, 3, 3, skinBase);

  // 12. Off-hand & Weapon
  if (offhandId) {
    drawOffhandSprite(g, offhandId);
  }
  if (opts.showClassPreview) {
    const previewWeapon: Record<ClassName, string> = {
      Knight: 'moonblade',
      Mage: 'runestaff',
      Healer: 'runestaff',
      Rogue: 'shadowdagger',
      Bowman: 'huntingbow',
    };
    drawWeaponSprite(g, previewWeapon[opts.className]);
  } else if (weaponId) {
    drawWeaponSprite(g, weaponId);
  }

  g.applyOutline(SPRITE_INK);

  // Floating cosmetic badges
  const wispGrid = new PixelGrid(48, 64);
  if (opts.activeCosmetics?.Badge === 'autumn-wisp') {
    wispGrid.ellipse(40, 22, 3, 3, '#ffad54');
    wispGrid.ellipse(40, 22, 2, 2, '#ffe89e');
    wispGrid.set(39, 17, '#ffd178');
  } else if (opts.activeCosmetics?.Badge === 'badge-comet') {
    wispGrid.box(39, 18, 3, 3, '#9be8ff');
    wispGrid.set(40, 19, '#ffffff');
    wispGrid.line(42, 17, 45, 14, '#70b3ff', 1);
  }

  return {
    bgRects: bgGrid.toSvgRects(),
    charRects: g.toSvgRects(),
    wispRects: wispGrid.toSvgRects(),
  };
}

export function buildMerlinSpriteLayers(): HeroSpriteLayers {
  const bgGrid = new PixelGrid(48, 64);
  drawBiomeBackground(bgGrid, 2); // Arcane Hall
  bgGrid.box(16, 57, 17, 2, '#1e1929');

  const g = new PixelGrid(48, 64);
  const robeBase = '#483585';
  const robeLight = '#735bc4';
  const robeDark = '#2d1f59';
  const skin = '#edc8aa';
  const skinShadow = '#c99f80';

  // Flowing dark-violet cape behind robe
  g.poly([[14, 34], [34, 34], [37, 56], [11, 56]], '#2b1e54');

  // Starbound Robe & Gold Embroidered Hem
  g.box(16, 35, 16, 20, robeBase);
  g.box(17, 36, 5, 18, robeLight);
  g.box(27, 36, 4, 18, robeDark);
  g.box(22, 36, 4, 18, '#e8c468');
  g.box(16, 53, 16, 2, '#e8c468');
  // Crimson-velvet archmage shoulder mantle
  g.box(15, 33, 18, 4, '#8f3047');
  g.box(16, 33, 16, 2, '#ba4560');
  g.box(22, 34, 4, 2, '#f5d47a'); // Mantle clasp
  // Boots
  g.box(18, 55, 4, 3, '#3c2a4d');
  g.box(26, 55, 4, 3, '#3c2a4d');

  // Head with wise eyes & bushy eyebrows
  g.box(17, 17, 14, 16, skin);
  g.box(18, 18, 8, 9, '#f7dac1');
  g.box(17, 17, 14, 2, skinShadow); // Hat brim shadow
  g.box(19, 20, 4, 1, '#f2f2fa');
  g.box(25, 20, 4, 1, '#f2f2fa');
  g.set(21, 22, '#ffffff');
  g.set(22, 22, '#5cd6ff');
  g.set(27, 22, '#ffffff');
  g.set(28, 22, '#5cd6ff');
  g.box(24, 24, 2, 2, skinShadow);

  // Sculpted Sweeping Mustache & Layered Archmage Wizard Beard with strand dithering
  g.poly([[16, 26], [32, 26], [31, 34], [28, 42], [24, 47], [20, 42], [17, 34]], '#d8daf0');
  // Bright silver-white front locks & side curls
  g.poly([[17, 27], [24, 27], [23, 45], [19, 39]], '#ffffff');
  g.box(24, 29, 2, 17, '#f5f6ff');
  g.set(24, 47, '#e2e4f5');
  // Sculpted cool silver-lavender shading grooves & strand dithering
  g.box(20, 30, 1, 10, '#aeb0cf');
  g.box(22, 34, 1, 7, '#c7c8e0');
  g.box(26, 29, 2, 12, '#b8bad9');
  g.box(29, 28, 2, 9, '#9e9fc2');
  // Subtle windswept side wisps
  g.box(17, 35, 2, 4, '#e6e7f7');
  g.box(29, 34, 2, 4, '#c7c8e0');
  g.set(18, 40, '#aeb0cf');
  g.set(28, 39, '#9e9fc2');
  // Sweeping handlebar mustache framing nose
  g.box(18, 25, 13, 2, '#ffffff');
  g.box(16, 26, 4, 2, '#f5f6ff');
  g.box(29, 26, 4, 2, '#dfe0f2');
  g.box(15, 27, 2, 1, '#c7c8e0');
  g.box(32, 27, 2, 1, '#aeb0cf');
  // Subtle mouth shadow tucked neatly under mustache
  g.box(23, 27, 3, 1, '#8c8db0');

  // Classic Curved Pointed Archmage Hat with shaded wide brim & gold band
  g.poly([[16, 15], [19, 8], [23, 3], [27, 2], [29, 4], [27, 7], [32, 15]], robeBase);
  g.poly([[17, 15], [20, 8], [24, 3], [27, 3], [23, 9], [21, 15]], robeLight);
  g.poly([[26, 7], [28, 3], [30, 5], [28, 8], [32, 15], [27, 15]], robeDark);
  g.box(29, 3, 2, 2, robeBase); // Curved wizard hat tip
  g.set(30, 4, robeDark);
  // Sleek 1px gold band with glint
  g.box(16, 14, 16, 1, '#ebd074');
  g.box(18, 14, 5, 1, '#fff3ad');
  // Curved wide brim with highlight top & shadow underside
  g.box(11, 15, 26, 2, robeBase);
  g.box(12, 15, 13, 1, robeLight);
  g.box(9, 16, 3, 2, robeDark);
  g.box(36, 16, 3, 2, robeDark);
  g.box(11, 17, 26, 1, robeDark);
  // Crisp star emblem on hat cone
  g.box(22, 9, 1, 3, '#ffe885');
  g.box(21, 10, 3, 1, '#ffe885');
  g.set(22, 10, '#ffffff');

  // Front arm & Gnarled Glowing Crystal Staff
  g.box(13, 36, 4, 8, robeLight);
  g.box(13, 44, 3, 2, skin);
  g.line(9, 56, 9, 20, '#875a36', 2);
  g.box(8, 21, 3, 2, '#e3be6b');
  g.ellipse(9, 17, 3, 3, '#5ae3eb');
  g.set(8, 16, '#ffffff');

  // Floating Arcane Tome / Rune in free right hand
  g.box(34, 38, 6, 5, '#5ce6e8');
  g.box(35, 39, 4, 3, '#ffffff');

  g.applyOutline(SPRITE_INK);

  // Floating arcane motes around staff and spell
  const wispGrid = new PixelGrid(48, 64);
  wispGrid.set(5, 14, '#8ff5ff');
  wispGrid.set(13, 12, '#ffe885');
  wispGrid.set(36, 33, '#9cf5ff');
  wispGrid.set(40, 36, '#ffe885');

  return {
    bgRects: bgGrid.toSvgRects(),
    charRects: g.toSvgRects(),
    wispRects: wispGrid.toSvgRects(),
  };
}
