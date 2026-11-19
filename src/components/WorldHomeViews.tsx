import { useMemo, useState } from 'react';
import { Compass, Flame, Home, Lock, MapPin, Shield, Sparkles, Swords, Tag, Trophy, X } from 'lucide-react';
import {
  COSMETICS,
  getActiveSeason,
  HOME_FURNITURE,
  HOME_ROOMS,
  HOME_TROPHIES,
  ITEMS,
  WORLD_REGIONS,
  type HeroSave,
  type HomeRoomId,
} from '../types/arcana';
import {
  canScoutRegionToday,
  getDiscountedCost,
  getHeroMaxStreak,
  getHeroStatSum,
  getHomeBonuses,
  getMaxDomainLevel,
  getRegionMastery,
  isRegionUnlocked,
  type RegionEncounterResult,
} from '../engine/game';
import { getT } from '../i18n/translations';
import { buildHeroSpriteLayers } from '../sprites/heroSprite';
import { buildPetSprite } from '../sprites/worldSprites';

function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

interface MapTile {
  x: number;
  y: number;
  fill: string;
}

const MAP_COLS = 64;
const MAP_ROWS = 36;
const CELL = 8;
const MAP_OFFSET_X = 16;
const MAP_OFFSET_Y = 16;

function buildMinecraftTerrain(): {
  tiles: MapTile[];
  canopy: MapTile[];
  villages: MapTile[];
} {
  const tiles: MapTile[] = [];
  const canopy: MapTile[] = [];
  const villages: MapTile[] = [];

  // River centerline X per row (in tile cols)
  const riverCol = (r: number) => {
    if (r < 8) return 38 - r * 0.45;
    if (r < 20) return 34.4 + Math.sin((r - 8) * 0.25) * 2.2;
    return 36.8 + (r - 20) * 0.42;
  };

  const villageCenters: [number, number][] = [
    [18, 15],
    [21, 13],
    [24, 15],
    [20, 17],
    [25, 17],
    [16, 17],
  ];

  const castleBlocks: [number, number][] = [
    [43, 12],
    [44, 12],
    [45, 12],
    [43, 13],
    [45, 13],
    [43, 14],
    [44, 14],
    [45, 14],
  ];

  for (let r = 0; r < MAP_ROWS; r++) {
    const rCol = riverCol(r);
    for (let c = 0; c < MAP_COLS; c++) {
      const h = hash2d(c, r);
      const h2 = hash2d(c + 91, r + 47);
      const x = MAP_OFFSET_X + c * CELL;
      const y = MAP_OFFSET_Y + r * CELL;

      const distWoods = Math.hypot(c - 10, r - 24);
      const distVillage = Math.hypot(c - 21, r - 15);
      const distCatacomb = Math.hypot(c - 33, r - 25);
      const distKeep = Math.hypot(c - 44, r - 13);
      const distObservatory = Math.hypot(c - 54, r - 23);
      const distCitadel = Math.hypot(c - 55, r - 7);

      let fill = '#529332';

      // Biome base terrain
      if (distCitadel < 11 + h * 2.2) {
        // Obsidian Citadel volcanic basalt + lava cracks
        if (h < 0.14 && distCitadel < 7) {
          fill = h2 > 0.5 ? '#eb5e28' : '#f7a22d';
        } else if (h < 0.45) {
          fill = '#25212d';
        } else if (h < 0.78) {
          fill = '#322b3d';
        } else {
          fill = '#40364d';
        }
      } else if (distObservatory < 10 + h * 1.8) {
        // Astral Observatory alpine crystal ridges
        if (h < 0.25) fill = '#355370';
        else if (h < 0.6) fill = '#446b8f';
        else if (h < 0.88) fill = '#5886ad';
        else fill = '#7ab2de';
      } else if (c >= rCol + 1.4) {
        // Eastern Sunspire sand / limestone plateau (matches Minecraft desert palette)
        if (distKeep < 6) {
          fill = h > 0.5 ? '#d9cc96' : '#ccc088';
        } else if (h < 0.35) {
          fill = '#dfd49f';
        } else if (h < 0.72) {
          fill = '#d5c68c';
        } else if (h < 0.92) {
          fill = '#cbb97e';
        } else {
          fill = '#bfb075';
        }
      } else if (distCatacomb < 8.5 + h * 1.5) {
        // Moss Catacombs mossy stone ruins
        if (h < 0.35) fill = '#455442';
        else if (h < 0.68) fill = '#566951';
        else if (h < 0.88) fill = '#63755c';
        else fill = '#4c5259';
      } else {
        // Western green forest & meadow plains
        if (h < 0.28) fill = '#48852b';
        else if (h < 0.62) fill = '#559933';
        else if (h < 0.88) fill = '#62a83d';
        else fill = '#72b84a';
      }

      // Winding river & shoreline banks
      const riverDist = Math.abs(c - rCol);
      const riverWidth = r > 22 && r < 27 ? 2.2 : 1.55;
      if (riverDist < riverWidth) {
        fill = h < 0.35 ? '#2045cc' : h < 0.78 ? '#2b58eb' : '#4070f5';
      } else if (riverDist < riverWidth + 0.9 && c >= rCol) {
        fill = '#d2c793';
      } else if (riverDist < riverWidth + 0.85 && c < rCol) {
        fill = '#5f9446';
      }

      // Pixel dirt roads connecting regions
      const onWestRoad =
        (Math.abs(r - (24 - (c - 10) * 0.7)) < 0.75 && c >= 10 && c <= 22) ||
        (Math.abs(r - (15 + (c - 22) * 0.85)) < 0.7 && c >= 22 && c <= 33) ||
        (Math.abs(r - (15 - (c - 22) * 0.14)) < 0.7 && c >= 22 && c <= 44);
      if (onWestRoad && riverDist >= riverWidth) {
        fill = h > 0.5 ? '#7a593a' : '#694b30';
      }
      // Wooden bridge over the river around row 13-14
      if (r >= 13 && r <= 14 && riverDist <= riverWidth + 0.8) {
        fill = (c + r) % 2 === 0 ? '#8c6239' : '#a37648';
      }

      tiles.push({ x, y, fill });

      // Dense Minecraft tree canopies (dark emerald pixel clusters in forest/plains)
      const isRoadOrWater = onWestRoad || riverDist < riverWidth + 1.1;
      if (
        !isRoadOrWater &&
        c < rCol - 1 &&
        distVillage > 4.5 &&
        distCatacomb > 5 &&
        ((distWoods < 13 && h2 > 0.44) || (h2 > 0.72 && r > 4))
      ) {
        canopy.push({
          x,
          y,
          fill: h < 0.33 ? '#1e4a16' : h < 0.72 ? '#295e1e' : '#357326',
        });
      }
    }
  }

  // Oakhaven terracotta village cottages (matches orange roof squares in Minecraft screenshot)
  for (const [vc, vr] of villageCenters) {
    const vx = MAP_OFFSET_X + vc * CELL;
    const vy = MAP_OFFSET_Y + vr * CELL;
    villages.push({ x: vx, y: vy, fill: '#b55422' });
    villages.push({ x: vx + CELL, y: vy, fill: '#cf6a2f' });
    villages.push({ x: vx, y: vy + CELL, fill: '#cf6a2f' });
    villages.push({ x: vx + CELL, y: vy + CELL, fill: '#e0823d' });
  }

  // Sunspire Keep stone castle walls + 4 corner towers
  for (const [kc, kr] of castleBlocks) {
    villages.push({
      x: MAP_OFFSET_X + kc * CELL,
      y: MAP_OFFSET_Y + kr * CELL,
      fill: (kc + kr) % 2 === 0 ? '#9da5b5' : '#7f8799',
    });
  }
  const keepTowers: [number, number][] = [
    [42, 11],
    [46, 11],
    [42, 15],
    [46, 15],
  ];
  for (const [tc, tr] of keepTowers) {
    villages.push({ x: MAP_OFFSET_X + tc * CELL, y: MAP_OFFSET_Y + tr * CELL, fill: '#b8c0d1' });
  }
  // Desert mesa rock spires east of Keep
  for (const [mc, mr] of [
    [49, 10],
    [50, 10],
    [49, 11],
    [51, 14],
  ] as [number, number][]) {
    villages.push({ x: MAP_OFFSET_X + mc * CELL, y: MAP_OFFSET_Y + mr * CELL, fill: '#b58a57' });
  }

  // Oakhaven central well, river dock & moored boat
  villages.push({ x: MAP_OFFSET_X + 20 * CELL, y: MAP_OFFSET_Y + 15 * CELL, fill: '#4f79b8' });
  villages.push({ x: MAP_OFFSET_X + 32 * CELL, y: MAP_OFFSET_Y + 16 * CELL, fill: '#8c6239' });
  villages.push({ x: MAP_OFFSET_X + 33 * CELL, y: MAP_OFFSET_Y + 16 * CELL, fill: '#a37648' });
  villages.push({ x: MAP_OFFSET_X + 34 * CELL, y: MAP_OFFSET_Y + 17 * CELL, fill: '#754c29' });

  // Whispering Woods monolith stones & warm camp ember
  for (const [sc, sr] of [
    [8, 25],
    [12, 25],
    [10, 27],
  ] as [number, number][]) {
    villages.push({ x: MAP_OFFSET_X + sc * CELL, y: MAP_OFFSET_Y + sr * CELL, fill: '#7b878c' });
  }
  villages.push({ x: MAP_OFFSET_X + 11 * CELL, y: MAP_OFFSET_Y + 23 * CELL, fill: '#ff8d36' });

  // Moss Catacombs stone crypt archway & glowing violet torches
  villages.push({ x: MAP_OFFSET_X + 32 * CELL, y: MAP_OFFSET_Y + 24 * CELL, fill: '#6c737d' });
  villages.push({ x: MAP_OFFSET_X + 33 * CELL, y: MAP_OFFSET_Y + 24 * CELL, fill: '#474c54' });
  villages.push({ x: MAP_OFFSET_X + 34 * CELL, y: MAP_OFFSET_Y + 24 * CELL, fill: '#6c737d' });
  villages.push({ x: MAP_OFFSET_X + 31 * CELL, y: MAP_OFFSET_Y + 25 * CELL, fill: '#c084fc' });
  villages.push({ x: MAP_OFFSET_X + 35 * CELL, y: MAP_OFFSET_Y + 25 * CELL, fill: '#c084fc' });

  // Astral Observatory snow-capped peaks, azure dome & star crystals
  for (const [ac, ar] of [
    [51, 20],
    [52, 19],
    [53, 20],
    [56, 20],
    [57, 21],
  ] as [number, number][]) {
    villages.push({
      x: MAP_OFFSET_X + ac * CELL,
      y: MAP_OFFSET_Y + ar * CELL,
      fill: ar === 19 ? '#e2f1ff' : '#b6d6f2',
    });
  }
  villages.push({ x: MAP_OFFSET_X + 54 * CELL, y: MAP_OFFSET_Y + 22 * CELL, fill: '#90d5ff' });
  villages.push({ x: MAP_OFFSET_X + 55 * CELL, y: MAP_OFFSET_Y + 22 * CELL, fill: '#5fb3f0' });
  villages.push({ x: MAP_OFFSET_X + 52 * CELL, y: MAP_OFFSET_Y + 24 * CELL, fill: '#c4f1ff' });

  // Obsidian Citadel dark fortress gate, lava channel, bridge & jagged spires
  for (const [lc, lr] of [
    [51, 7],
    [52, 8],
    [53, 9],
    [56, 9],
    [57, 10],
  ] as [number, number][]) {
    villages.push({ x: MAP_OFFSET_X + lc * CELL, y: MAP_OFFSET_Y + lr * CELL, fill: '#f77f2d' });
  }
  for (const [oc, or] of [
    [53, 5],
    [57, 5],
    [58, 7],
  ] as [number, number][]) {
    villages.push({ x: MAP_OFFSET_X + oc * CELL, y: MAP_OFFSET_Y + or * CELL, fill: '#4e3f63' });
  }
  villages.push({ x: MAP_OFFSET_X + 53 * CELL, y: MAP_OFFSET_Y + 8 * CELL, fill: '#2a2236' });
  villages.push({ x: MAP_OFFSET_X + 55 * CELL, y: MAP_OFFSET_Y + 8 * CELL, fill: '#524066' });
  villages.push({ x: MAP_OFFSET_X + 54 * CELL, y: MAP_OFFSET_Y + 8 * CELL, fill: '#ff8d36' });

  return { tiles, canopy, villages };
}

function PixelBannerMarker({
  x,
  y,
  color,
  unlocked,
  selected,
  isCurrent,
  hasChest,
  biome,
}: {
  x: number;
  y: number;
  color: string;
  unlocked: boolean;
  selected: boolean;
  isCurrent: boolean;
  hasChest: boolean;
  biome: string;
}) {
  const cloth = unlocked ? color : '#5c5f6e';
  const clothShade = unlocked ? '#1b1724' : '#353742';

  return (
    <g>
      {/* Selected reticle */}
      {selected && (
        <g>
          <rect x={x - 12} y={y - 24} width={24} height={26} fill="none" stroke="#ffe588" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      )}

      {/* Ground shadow */}
      <rect x={x - 5} y={y - 1} width={10} height={3} fill="#0e0d14" opacity="0.55" />

      {/* Minecraft Banner Outline & Pole */}
      <rect x={x - 1} y={y - 20} width={3} height={20} fill="#121017" />
      <rect x={x} y={y - 19} width={1} height={18} fill="#8a6542" />

      {/* Banner Crossbar */}
      <rect x={x - 7} y={y - 21} width={14} height={3} fill="#121017" />
      <rect x={x - 6} y={y - 20} width={12} height={1} fill="#b88b58" />

      {/* Hanging Banner Cloth with crisp 1px dark pixel outline */}
      <rect x={x - 6} y={y - 18} width={12} height={15} fill="#121017" />
      <rect x={x - 5} y={y - 17} width={10} height={13} fill={cloth} />
      {/* Inner highlight & bottom trim */}
      <rect x={x - 5} y={y - 17} width={2} height={13} fill="#ffffff" opacity="0.22" />
      <rect x={x - 5} y={y - 6} width={10} height={2} fill={clothShade} opacity="0.35" />

      {/* Biome Banner Emblem */}
      {biome === 'Forest' && (
        <g fill="#162e18">
          <rect x={x - 1} y={y - 15} width={2} height={2} />
          <rect x={x - 3} y={y - 13} width={6} height={3} />
          <rect x={x - 1} y={y - 10} width={2} height={3} />
        </g>
      )}
      {biome === 'Village' && (
        <g fill="#2b1b12">
          <rect x={x - 3} y={y - 14} width={6} height={2} />
          <rect x={x - 2} y={y - 12} width={4} height={4} />
          <rect x={x - 1} y={y - 10} width={2} height={2} fill="#ffefb0" />
        </g>
      )}
      {biome === 'Dungeon' && (
        <g fill="#1c1529">
          <rect x={x - 3} y={y - 15} width={6} height={4} />
          <rect x={x - 2} y={y - 13} width={1} height={1} fill="#f4f4f8" />
          <rect x={x + 1} y={y - 13} width={1} height={1} fill="#f4f4f8" />
          <rect x={x - 2} y={y - 11} width={4} height={2} />
        </g>
      )}
      {biome === 'Castle' && (
        <g fill="#182338">
          <rect x={x - 3} y={y - 15} width={2} height={2} />
          <rect x={x + 1} y={y - 15} width={2} height={2} />
          <rect x={x - 3} y={y - 13} width={6} height={5} />
        </g>
      )}
      {biome === 'Sanctuary' && (
        <g fill="#f5fbff">
          <rect x={x - 1} y={y - 15} width={2} height={6} />
          <rect x={x - 3} y={y - 13} width={6} height={2} />
        </g>
      )}
      {biome === 'Citadel' && (
        <g fill="#1d1118">
          <rect x={x - 2} y={y - 15} width={4} height={6} />
          <rect x={x - 1} y={y - 13} width={2} height={3} fill="#fde047" />
        </g>
      )}

      {/* Unclaimed Discovery Chest Pixel Icon */}
      {unlocked && hasChest && (
        <g transform={`translate(${x + 7}, ${y - 15})`}>
          <rect x={0} y={0} width={8} height={7} fill="#121017" />
          <rect x={1} y={1} width={6} height={5} fill="#d98c2b" />
          <rect x={1} y={3} width={6} height={1} fill="#784414" />
          <rect x={3} y={2} width={2} height={2} fill="#ffe97d" />
        </g>
      )}

      {/* Minecraft White Player Locator Pointer */}
      {isCurrent && (
        <g transform={`translate(${x - 16}, ${y - 13})`}>
          <polygon points="4,0 9,7 4,5 0,7" fill="#ffffff" stroke="#111015" strokeWidth="1.4" />
        </g>
      )}
    </g>
  );
}

const DIFFICULTY_STYLES: Record<
  (typeof WORLD_REGIONS)[number]['difficulty'],
  { color: string; bg: string }
> = {
  Safe: { color: '#30d158', bg: 'rgba(48, 209, 88, 0.14)' },
  Guarded: { color: '#eab949', bg: 'rgba(234, 185, 73, 0.14)' },
  Perilous: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  Deadly: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  Mythic: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)' },
  Abyssal: { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.18)' },
};

export function WorldMapSection({
  save,
  onTravel,
  onExplore,
}: {
  save: HeroSave;
  onTravel: (regionId: string) => void;
  onExplore: (regionId: string) => RegionEncounterResult | undefined;
}) {
  const t = getT(save.language);
  const lang = save.language || 'en';
  const [selectedId, setSelectedId] = useState(save.world.currentRegionId || WORLD_REGIONS[0].id);
  const [encounter, setEncounter] = useState<RegionEncounterResult | null>(null);
  const selected = WORLD_REGIONS.find((r) => r.id === selectedId) || WORLD_REGIONS[0];
  const unlocked = isRegionUnlocked(save, selected);
  const isCurrent = save.world.currentRegionId === selected.id;
  const chestClaimed = save.world.claimedChests.includes(selected.id);
  const canScout = unlocked && chestClaimed && canScoutRegionToday(save, selected.id);
  const totalChecks = save.habitChecks + save.todoChecks;
  const discountPct = save.world.merchantDiscountPct || 0;

  const maxStreak = getHeroMaxStreak(save);
  const statSum = getHeroStatSum(save);
  const maxDomainLv = getMaxDomainLevel(save);
  const mastery = getRegionMastery(save, selected.id);
  const diffStyle = DIFFICULTY_STYLES[selected.difficulty];

  const trialSatisfied =
    (!selected.reqStreak || maxStreak >= selected.reqStreak) &&
    (!selected.reqStatSum || statSum >= selected.reqStatSum) &&
    (!selected.reqDomainLv || maxDomainLv >= selected.reqDomainLv);

  const trialProgressText = selected.reqStreak && selected.reqStatSum
    ? `${maxStreak}/${selected.reqStreak}d · ${statSum}/${selected.reqStatSum}`
    : selected.reqStreak
      ? `${maxStreak} / ${selected.reqStreak}d`
      : selected.reqStatSum
        ? `${statSum} / ${selected.reqStatSum}`
        : selected.reqDomainLv
          ? `Lv.${maxDomainLv} / ${selected.reqDomainLv}`
          : lang === 'de'
            ? 'Bereit'
            : 'Ready';

  const terrain = useMemo(() => buildMinecraftTerrain(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.07] bg-[#18181b] px-4 py-3 text-xs">
        <span className="text-[#8e8e93]">
          {t.currentCamp}:{' '}
          <strong className="text-[#f5f5f7]">
            {WORLD_REGIONS.find((r) => r.id === save.world.currentRegionId)?.name || 'Whispering Woods'}
          </strong>
        </span>
        <span className="font-mono-num font-semibold text-[#30d158]">
          {save.world.exploredRegions.length} / {WORLD_REGIONS.length} {t.regionsExplored}
        </span>
      </div>

      {discountPct > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#eab949]/30 bg-[#221e14] px-4 py-2.5 text-xs text-[#f3ca6b]">
          <Tag className="h-4 w-4 shrink-0" />
          <span>{t.merchantDiscountBanner}</span>
        </div>
      )}

      {/* Minecraft-Style Pixel Locator Map with Banners */}
      <div className="overflow-hidden rounded-2xl border border-[#4a3f2f] bg-[#2a2319] p-2 shadow-inner">
        <svg
          viewBox="0 0 544 320"
          className="pixel-svg h-auto w-full select-none"
          shapeRendering="crispEdges"
          aria-label="ARCANA Minecraft-Style Pixel World Map"
        >
          {/* Parchment Map Frame */}
          <rect x="0" y="0" width="544" height="320" fill="#c7ae82" />
          <rect x="4" y="4" width="536" height="312" fill="#dec9a0" />
          <rect x="12" y="12" width="520" height="296" fill="#9c8056" />
          <rect x="14" y="14" width="516" height="292" fill="#6b5538" />
          {/* Frame Corner Pixel Tacks */}
          <rect x="6" y="6" width="4" height="4" fill="#9c8056" />
          <rect x="534" y="6" width="4" height="4" fill="#9c8056" />
          <rect x="6" y="310" width="4" height="4" fill="#9c8056" />
          <rect x="534" y="310" width="4" height="4" fill="#9c8056" />

          {/* Base Terrain Tiles */}
          {terrain.tiles.map((t, i) => (
            <rect key={i} x={t.x} y={t.y} width={CELL} height={CELL} fill={t.fill} />
          ))}

          {/* Forest Canopies */}
          {terrain.canopy.map((t, i) => (
            <rect key={`c-${i}`} x={t.x} y={t.y} width={CELL} height={CELL} fill={t.fill} />
          ))}

          {/* Village Cottage Roofs, Castle Towers, Observatory & Citadel */}
          {terrain.villages.map((t, i) => (
            <rect key={`v-${i}`} x={t.x} y={t.y} width={CELL} height={CELL} fill={t.fill} />
          ))}

          {/* Subtle Cartographic Grid Overlay */}
          {[144, 272, 400].map((gx) => (
            <line key={`gx-${gx}`} x1={gx} y1={16} x2={gx} y2={304} stroke="#14111a" strokeWidth="1" opacity="0.1" />
          ))}
          {[112, 208].map((gy) => (
            <line key={`gy-${gy}`} x1={16} y1={gy} x2={528} y2={gy} stroke="#14111a" strokeWidth="1" opacity="0.1" />
          ))}

          {/* Pixel Compass Rose (Top Left) */}
          <g transform="translate(26, 24)">
            <rect x="0" y="0" width="28" height="28" rx="4" fill="rgba(16, 15, 22, 0.72)" stroke="#c7ae82" strokeWidth="1" />
            <polygon points="14,3 16,12 12,12" fill="#f87171" />
            <polygon points="14,25 16,16 12,16" fill="#d4d4d8" />
            <polygon points="3,14 12,12 12,16" fill="#d4d4d8" />
            <polygon points="25,14 16,12 16,16" fill="#d4d4d8" />
            <rect x="13" y="13" width="2" height="2" fill="#fde047" />
            <text x="14" y="10" textAnchor="middle" fill="#fff3c4" fontSize="5.5" fontWeight="800">N</text>
          </g>

          {/* Trail Path Segments Between Regions */}
          {WORLD_REGIONS.slice(0, -1).map((reg, idx) => {
            const next = WORLD_REGIONS[idx + 1];
            const bothUnlocked = isRegionUnlocked(save, next);
            const x1 = MAP_OFFSET_X + (reg.mapX / 100) * 512;
            const y1 = MAP_OFFSET_Y + (reg.mapY / 100) * 288;
            const x2 = MAP_OFFSET_X + (next.mapX / 100) * 512;
            const y2 = MAP_OFFSET_Y + (next.mapY / 100) * 288;
            return (
              <line
                key={reg.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={bothUnlocked ? '#f2d98d' : '#2c2724'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity={bothUnlocked ? 0.85 : 0.6}
              />
            );
          })}

          {/* Subtle Fog Overlay on Locked Sectors */}
          {WORLD_REGIONS.map((reg) => {
            if (isRegionUnlocked(save, reg)) return null;
            const bx = Math.round(MAP_OFFSET_X + (reg.mapX / 100) * 512);
            const by = Math.round(MAP_OFFSET_Y + (reg.mapY / 100) * 288);
            return (
              <rect
                key={`fog-${reg.id}`}
                x={Math.max(16, bx - 44)}
                y={Math.max(16, by - 36)}
                width={88}
                height={72}
                fill="#111018"
                opacity="0.35"
              />
            );
          })}

          {/* Standing Minecraft Pixel Banners + Dark Translucent Nameplates */}
          {WORLD_REGIONS.map((reg) => {
            const bx = Math.round(MAP_OFFSET_X + (reg.mapX / 100) * 512);
            const by = Math.round(MAP_OFFSET_Y + (reg.mapY / 100) * 288);
            const regUnlocked = isRegionUnlocked(save, reg);
            const active = selected.id === reg.id;
            const here = save.world.currentRegionId === reg.id;
            const claimed = save.world.claimedChests.includes(reg.id);
            const levelMet = save.level >= reg.reqLevel;
            const regMastery = getRegionMastery(save, reg.id);
            const plateWidth = Math.max(82, reg.name.length * 5.6 + 16);
            const plateX = Math.max(20, Math.min(524 - plateWidth, bx - plateWidth / 2));
            const labelCenterX = plateX + plateWidth / 2;

            return (
              <g
                key={reg.id}
                onClick={() => setSelectedId(reg.id)}
                className="cursor-pointer"
              >
                <PixelBannerMarker
                  x={bx}
                  y={by}
                  color={reg.color}
                  unlocked={regUnlocked}
                  selected={active}
                  isCurrent={here}
                  hasChest={!claimed}
                  biome={reg.biome}
                />

                {/* Dark translucent banner nameplate with Required Level directly under the banner */}
                <rect
                  x={plateX}
                  y={by + 3}
                  width={plateWidth}
                  height={23}
                  rx={2}
                  fill="rgba(14, 13, 20, 0.92)"
                  stroke={active ? '#ffe588' : 'rgba(255, 255, 255, 0.22)'}
                  strokeWidth="1"
                />
                <circle
                  cx={plateX + 5}
                  cy={by + 8.5}
                  r={2}
                  fill={DIFFICULTY_STYLES[reg.difficulty].color}
                />
                <text
                  x={labelCenterX + 2}
                  y={by + 12}
                  textAnchor="middle"
                  fill={regUnlocked ? '#ffffff' : '#b8b8c4'}
                  fontSize="8.3"
                  fontWeight="700"
                >
                  {reg.name}
                </text>
                <text
                  x={labelCenterX}
                  y={by + 21.5}
                  textAnchor="middle"
                  fill={levelMet ? '#5ce09e' : '#fbbf24'}
                  fontSize="7.2"
                  fontWeight="700"
                >
                  Req. Lv. {reg.reqLevel}{regMastery > 0 ? ` · ★${regMastery}` : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick Banner Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#9b9ab0]">
        <span>Tap any Banner to inspect biome hazards, solo unlock trials, and daily scouting.</span>
        <span className="text-[#e8b84b]">White Pointer = Camp · Gold Chest = Unclaimed</span>
      </div>

      {/* Selected Region Detail Card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold" style={{ color: selected.color }}>
                {selected.biome} {isCurrent ? '· Current Camp' : ''}
              </p>
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: diffStyle.color, backgroundColor: diffStyle.bg }}
              >
                {selected.difficulty}
              </span>
              {mastery > 0 && (
                <span className="font-mono-num rounded-md bg-[#242429] px-2 py-0.5 text-[10px] font-semibold text-[#eab949]">
                  ★ Mastery {mastery}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-xl font-bold text-[#f5f5f7]">{selected.name}</h2>
          </div>

          <span className="font-mono-num text-xs font-semibold text-[#eab949]">
            Discovery: +{selected.rewardXp} XP · +{selected.rewardGold} Gold
            {selected.rewardEgg ? ' · +1 Egg' : ''}
          </span>
        </div>

        <p className="mt-2 text-sm text-[#d4d4d8]">{selected.desc}</p>
        <p className="mt-1 text-xs italic text-[#8e8e93]">{selected.lore}</p>

        {/* Solo Unlock Requirements */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-[#202024] px-3 py-2 text-xs">
            <p className="text-[#8e8e93]">Hero Level</p>
            <p className={`font-mono-num font-bold ${save.level >= selected.reqLevel ? 'text-[#30d158]' : 'text-[#f5f5f7]'}`}>
              {save.level} / {selected.reqLevel}
            </p>
          </div>
          <div className="rounded-xl bg-[#202024] px-3 py-2 text-xs">
            <p className="text-[#8e8e93]">Quests Done</p>
            <p className={`font-mono-num font-bold ${totalChecks >= selected.reqChecks ? 'text-[#30d158]' : 'text-[#f5f5f7]'}`}>
              {totalChecks} / {selected.reqChecks}
            </p>
          </div>
          <div className="rounded-xl bg-[#202024] px-3 py-2 text-xs">
            <p className="text-[#8e8e93]">Boss Wins</p>
            <p className={`font-mono-num font-bold ${save.bossWins >= selected.reqBossWins ? 'text-[#30d158]' : 'text-[#f5f5f7]'}`}>
              {save.bossWins} / {selected.reqBossWins}
            </p>
          </div>
          <div className="rounded-xl bg-[#202024] px-3 py-2 text-xs">
            <p className="truncate text-[#8e8e93]">
              {lang === 'de' ? selected.trialLabelDe : selected.trialLabelEn}
            </p>
            <p className={`font-mono-num font-bold ${trialSatisfied ? 'text-[#30d158]' : 'text-[#fbbf24]'}`}>
              {trialProgressText}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {!unlocked ? (
            <div className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#202024] px-4 py-2 text-xs font-medium text-[#8e8e93]">
              <Lock className="h-4 w-4" />
              {t.unlockReqMissing}
            </div>
          ) : !chestClaimed ? (
            <button
              type="button"
              onClick={() => {
                const enc = onExplore(selected.id);
                if (enc) setEncounter(enc);
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111114] hover:bg-white"
            >
              <Compass className="h-4 w-4" />
              {t.exploreChestBtn}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isCurrent}
                onClick={() => onTravel(selected.id)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#27272c] px-5 py-2 text-xs font-semibold text-[#f5f5f7] hover:bg-[#323238] disabled:opacity-50"
              >
                <MapPin className="h-4 w-4 text-[#30d158]" />
                {isCurrent ? t.campedHere : t.travelHere}
              </button>
              {canScout && (
                <button
                  type="button"
                  onClick={() => {
                    const enc = onExplore(selected.id);
                    if (enc) setEncounter(enc);
                  }}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#f5f5f7] px-5 py-2 text-xs font-semibold text-[#111114] hover:bg-white"
                >
                  <Swords className="h-4 w-4" />
                  {t.scoutEncounterBtn}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {encounter && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
            encounter.kind === 'ambush'
              ? 'border-[#fb923c]/40 bg-[#211915]'
              : 'border-[#eab949]/35 bg-[#1b1916]'
          }`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                encounter.kind === 'ambush'
                  ? 'bg-[#fb923c]/15 text-[#fb923c]'
                  : 'bg-[#eab949]/15 text-[#eab949]'
              }`}
            >
              {encounter.kind === 'ambush' ? (
                <Swords className="h-4 w-4" />
              ) : encounter.kind === 'merchant' ? (
                <Tag className="h-4 w-4" />
              ) : encounter.kind === 'shrine' ? (
                <Flame className="h-4 w-4" />
              ) : encounter.kind === 'critter' ? (
                <Shield className="h-4 w-4" />
              ) : (
                <Compass className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  encounter.kind === 'ambush' ? 'text-[#fb923c]' : 'text-[#eab949]'
                }`}
              >
                {t.encounterTitle}
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-[#f5f5f7]">
                {save.language === 'de' ? encounter.titleDe : encounter.titleEn}
              </h3>
              <p className="mt-1 text-xs text-[#d4d4d8]">
                {save.language === 'de' ? encounter.descDe : encounter.descEn}
              </p>
              <p className="font-mono-num mt-2 text-xs font-semibold text-[#30d158]">
                {encounter.rewardSummary}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEncounter(null)}
            aria-label={t.close}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#27272c] text-[#8e8e93] hover:text-[#f5f5f7]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function PixelTrophyIcon({ id, x, y, color }: { id: string; x: number; y: number; color: string }) {
  if (id === 'first-weekly-boss') {
    // Warden Banner
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={0} y={0} width={10} height={11} fill="#14111c" />
        <rect x={1} y={1} width={8} height={2} fill="#e8b84b" />
        <rect x={2} y={3} width={6} height={7} fill={color} />
        <rect x={4} y={4} width={2} height={4} fill="#fff3c4" />
      </g>
    );
  }
  if (id === 'boss-slayer') {
    // Wyrmfang Skull Crest
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={1} y={2} width={8} height={8} fill="#14111c" />
        <rect x={2} y={0} width={2} height={3} fill="#f2e6d0" />
        <rect x={6} y={0} width={2} height={3} fill="#f2e6d0" />
        <rect x={2} y={3} width={6} height={6} fill={color} />
        <rect x={3} y={5} width={1} height={2} fill="#fff3c4" />
        <rect x={6} y={5} width={1} height={2} fill="#fff3c4" />
      </g>
    );
  }
  if (id === 'focus-adept') {
    // Hourglass Relic
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={1} y={0} width={8} height={2} fill="#cfa969" />
        <rect x={1} y={9} width={8} height={2} fill="#cfa969" />
        <rect x={2} y={2} width={6} height={3} fill={color} />
        <rect x={4} y={5} width={2} height={1} fill="#e0f2fe" />
        <rect x={2} y={6} width={6} height={3} fill="#93c5fd" />
      </g>
    );
  }
  if (id === 'world-explorer') {
    // Cartographer Compass
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={1} y={1} width={8} height={9} fill="#14111c" />
        <rect x={2} y={2} width={6} height={7} fill="#d4af37" />
        <rect x={3} y={3} width={4} height={5} fill="#182230" />
        <rect x={4} y={3} width={2} height={2} fill="#f87171" />
        <rect x={4} y={6} width={2} height={2} fill={color} />
      </g>
    );
  }
  // Golden Seal
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={1} y={1} width={8} height={9} fill="#14111c" />
      <rect x={2} y={2} width={6} height={7} fill={color} />
      <rect x={3} y={4} width={4} height={3} fill="#fff8d6" />
      <rect x={3} y={9} width={1} height={2} fill="#d94646" />
      <rect x={6} y={9} width={1} height={2} fill="#d94646" />
    </g>
  );
}

export function HomeSection({
  save,
  onUpgradeRoom,
  onBuyFurniture,
  onRenameHome,
}: {
  save: HeroSave;
  onUpgradeRoom: (roomId: HomeRoomId) => void;
  onBuyFurniture: (id: string) => void;
  onRenameHome: (name: string) => void;
}) {
  const t = getT(save.language);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(save.home.houseName);
  const [focusedRoom, setFocusedRoom] = useState<HomeRoomId>('living');
  const [inspected, setInspected] = useState<{
    title: string;
    subtitle: string;
    detail: string;
    color: string;
  } | null>(null);
  const homeB = getHomeBonuses(save);
  const furn = new Set(save.home.furniture);
  const rooms = save.home.rooms;
  const totalLevels = Object.values(rooms).reduce((a, b) => a + b, 0);

  const activeSeason = getActiveSeason();
  const ownedSeasonalItems = [
    ...ITEMS.filter((i) => i.seasonal && save.owned.includes(i.id)).map((i) => ({
      name: i.name,
      season: i.seasonal,
    })),
    ...COSMETICS.filter((c) => 'seasonal' in c && c.seasonal && save.ownedCosmetics.includes(c.id)).map((c) => ({
      name: c.name,
      season: c.seasonal,
    })),
  ];
  const hasFallDecor = ownedSeasonalItems.some((x) => x.season === 'fall');
  const hasWinterDecor = ownedSeasonalItems.some((x) => x.season === 'christmas');

  const heroLayers = useMemo(
    () =>
      buildHeroSpriteLayers({
        avatar: save.avatar,
        className: save.className,
        equipped: save.equipped,
        costume: save.costume,
        costumeMode: save.costumeMode,
        activeCosmetics: save.activeCosmetics,
        showGear: true,
        includeBackground: false,
      }),
    [save.avatar, save.className, save.equipped, save.costume, save.costumeMode, save.activeCosmetics]
  );

  const activePet = useMemo(
    () => save.pets.find((p) => p.id === save.activePetId) || null,
    [save.pets, save.activePetId]
  );

  const petSprite = useMemo(
    () => (activePet ? buildPetSprite(activePet) : null),
    [activePet]
  );

  const roomColors: Record<HomeRoomId, string> = {
    living: '#fb923c',
    library: '#60a5fa',
    training: '#f87171',
    garden: '#5ce09e',
    trophy: '#e8b84b',
  };

  return (
    <div className="space-y-5">
      {/* Header + Ultra-Detailed Pixel House Diorama */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Home className="h-5 w-5 text-[#e8b84b]" />
            {editingName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onRenameHome(nameInput);
                  setEditingName(false);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  maxLength={35}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-lg border border-[#4c4063] bg-[#14141b] px-2.5 py-1 text-sm font-bold text-[#f5f5f9]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#9b7bf0] px-3 py-1 text-xs font-bold text-[#14111c]"
                >
                  Save
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameInput(save.home.houseName);
                  setEditingName(true);
                }}
                className="text-left text-lg font-bold text-[#f4f4f8] hover:text-[#c4a3f5]"
              >
                {save.home.houseName}
              </button>
            )}
          </div>
          <span className="font-mono-num text-xs font-bold text-[#e8b84b]">
            Sanctuary Lv. {totalLevels} · {save.gold} Gold
          </span>
        </div>

        {/* Terraria / Stardew-Inspired High-Detail Pixel Sanctuary Cross-Section */}
        <div className="overflow-hidden rounded-xl border border-[#3a364d] bg-[#0e101c]">
          <svg
            viewBox="0 0 440 224"
            className="pixel-svg h-auto w-full select-none"
            shapeRendering="crispEdges"
            aria-label="Detailed Personal Pixel Home"
          >
            {/* Layered Twilight Sky */}
            <rect x="0" y="0" width="440" height="58" fill="#0d1122" />
            <rect x="0" y="58" width="440" height="48" fill="#131932" />
            <rect x="0" y="106" width="440" height="44" fill="#1b2442" />
            <rect x="0" y="150" width="440" height="32" fill="#23304f" />

            {/* Twinkling Stars & Moon */}
            {[
              [24, 18], [52, 34], [84, 14], [136, 20], [282, 16], [322, 30], [412, 22], [356, 48], [18, 70],
            ].map(([sx, sy], i) => (
              <g key={i}>
                <rect x={sx} y={sy} width={2} height={2} fill={i % 2 === 0 ? '#eef2ff' : '#9fb4e8'} />
                {i % 3 === 0 && (
                  <>
                    <rect x={sx - 1} y={sy} width={1} height={2} fill="#7e94cc" />
                    <rect x={sx + 2} y={sy} width={1} height={2} fill="#7e94cc" />
                  </>
                )}
              </g>
            ))}

            {/* Glowing Crescent Moon */}
            <rect x="374" y="14" width="24" height="24" fill="#253257" opacity="0.45" />
            <rect x="378" y="18" width="16" height="16" fill="#f7df94" />
            <rect x="380" y="16" width="12" height="20" fill="#f7df94" />
            <rect x="376" y="20" width="20" height="12" fill="#f7df94" />
            <rect x="384" y="17" width="13" height="14" fill="#0d1122" />

            {/* Distant Mountain Ridge & Horizon Mist */}
            <polygon points="0,178 46,120 98,178" fill="#161d34" />
            <polygon points="280,178 344,114 416,178" fill="#18213a" />
            <polygon points="366,178 424,126 440,148 440,178" fill="#1c2742" />
            <rect x="0" y="166" width="440" height="14" fill="#2a3a57" opacity="0.45" />

            {/* Background Pine Trees (Left & Far Right) */}
            {[16, 32, 418].map((tx, idx) => (
              <g key={idx}>
                <rect x={tx} y={142} width={4} height={38} fill="#3d2922" />
                <polygon points={`${tx - 10},162 ${tx + 2},132 ${tx + 14},162`} fill="#1d3c30" />
                <polygon points={`${tx - 8},148 ${tx + 2},120 ${tx + 12},148`} fill="#264e3d" />
                <polygon points={`${tx - 6},134 ${tx + 2},112 ${tx + 10},134`} fill="#2f614b" />
              </g>
            ))}

            {/* Grass, Cobble & Deep Soil Foundation */}
            <rect x="0" y="178" width="440" height="46" fill="#2b5236" />
            <rect x="0" y="178" width="440" height="4" fill="#46804f" />
            <rect x="0" y="188" width="440" height="36" fill="#3b2820" />
            <rect x="0" y="198" width="440" height="26" fill="#2b1d17" />
            {/* Soil pebbles & grass tufts */}
            {[14, 28, 304, 344, 396, 422].map((gx, i) => (
              <rect key={i} x={gx} y={175} width={4} height={3} fill="#5ca361" />
            ))}
            {[22, 68, 128, 188, 258, 332, 394].map((px, i) => (
              <rect key={i} x={px} y={194 + (i % 3) * 7} width={6} height={3} fill="#4d3d38" />
            ))}

            {/* Front Porch Cobble Path */}
            <rect x="52" y="180" width="48" height="6" fill="#6b7280" />
            <rect x="56" y="182" width="10" height="3" fill="#9ca3af" />
            <rect x="72" y="181" width="12" height="3" fill="#9ca3af" />
            <rect x="88" y="182" width="10" height="3" fill="#9ca3af" />

            {/* Wooden House Signpost on Left Lawn */}
            <rect x="22" y="156" width="3" height="24" fill="#5e3e2c" />
            <rect x="8" y="150" width="30" height="12" fill="#261913" />
            <rect x="10" y="152" width="26" height="8" fill="#8f6343" />
            <rect x="13" y="155" width="20" height="2" fill="#f5dfb0" />

            {/* ================== HOUSE ROOF & CHIMNEY ================== */}
            {/* Stone Brick Chimney with Rising Pixel Smoke */}
            <rect x="242" y="16" width="20" height="34" fill="#454859" />
            <rect x="240" y="14" width="24" height="4" fill="#63687d" />
            <rect x="245" y="20" width="6" height="3" fill="#5d6175" />
            <rect x="253" y="25" width="6" height="3" fill="#5d6175" />
            <rect x="245" y="30" width="6" height="3" fill="#5d6175" />
            {/* Animated / Layered Smoke Puffs */}
            <rect x="249" y="8" width="5" height="4" fill="#9da7c4" opacity="0.7" />
            <rect x="253" y="3" width="6" height="4" fill="#c2cbe3" opacity="0.55" />
            <rect x="258" y="0" width="4" height="3" fill="#dce3f5" opacity="0.4" />

            {/* Shingled Gable Roof */}
            <polygon points="32,56 176,12 320,56" fill="#3a1e28" />
            <polygon points="38,56 176,16 314,56" fill="#592e3b" />
            <polygon points="48,56 176,22 304,56" fill="#733c4b" />
            {/* Shingle Horizontal Stripes */}
            <rect x="92" y="40" width="168" height="2" fill="#4a2531" />
            <rect x="66" y="48" width="220" height="2" fill="#4a2531" />
            {/* Attic Dormer Window */}
            <rect x="164" y="26" width="24" height="20" fill="#3a2822" />
            <rect x="168" y="30" width="16" height="12" fill="#7ec2f2" />
            <rect x="175" y="30" width="2" height="12" fill="#3a2822" />
            <rect x="168" y="35" width="16" height="2" fill="#3a2822" />

            {/* Exterior House Frame */}
            <rect x="44" y="54" width="264" height="126" fill="#2e221d" />

            {/* ================== UPPER LEFT: STUDY LIBRARY ================== */}
            <g onClick={() => setFocusedRoom('library')} className="cursor-pointer">
              <rect x="48" y="58" width="126" height="54" fill="#231d30" />
              {/* Wallpaper vertical stripes & wood wainscot */}
              {[58, 72, 86, 100, 114, 128, 142, 156].map((wx) => (
                <rect key={wx} x={wx} y={58} width={2} height={40} fill="#2b243b" />
              ))}
              <rect x="48" y="96" width="126" height="16" fill="#3d2b24" />
              <rect x="48" y="96" width="126" height="2" fill="#593f34" />

              {/* Arched Window Looking Out to Night Sky */}
              <rect x="108" y="64" width="22" height="24" fill="#4d352b" />
              <rect x="111" y="67" width="16" height="18" fill="#172442" />
              <rect x="114" y="70" width="2" height="2" fill="#fff2b2" />
              <rect x="122" y="75" width="2" height="2" fill="#c7d8ff" />
              <rect x="118" y="67" width="2" height="18" fill="#4d352b" />
              <rect x="111" y="75" width="16" height="2" fill="#4d352b" />

              {rooms.library > 0 ? (
                <g>
                  {/* Tall Oak Bookcase 1 */}
                  <rect x="54" y="62" width="32" height="48" fill="#4f3325" />
                  <rect x="56" y="64" width="28" height="44" fill="#261916" />
                  {/* Shelves & Multi-Colored Books */}
                  {[66, 76, 86, 96].map((sy, si) => (
                    <g key={sy}>
                      <rect x="56" y={sy + 7} width="28" height="2" fill="#6b4634" />
                      <rect x="58" y={sy} width="4" height="7" fill={si % 2 === 0 ? '#d95b5b' : '#589be0'} />
                      <rect x="63" y={sy + 1} width="3" height="6" fill="#e8b84b" />
                      <rect x="67" y={sy} width="4" height="7" fill="#5ce09e" />
                      <rect x="72" y={sy + 1} width="3" height="6" fill="#a78bfa" />
                      <rect x="76" y={sy} width="5" height="7" fill={si === 1 ? '#38bdf8' : '#e07a5f'} />
                    </g>
                  ))}

                  {/* Extra Lv.2+ Arcane Scroll Stand & Floating Crystal */}
                  {rooms.library >= 2 && (
                    <g>
                      <rect x="91" y="70" width="12" height="16" fill="#734b35" />
                      <rect x="93" y="72" width="8" height="12" fill="#ebd9b0" />
                      <rect x="95" y="75" width="4" height="2" fill="#78533a" />
                      <rect x="95" y="79" width="4" height="2" fill="#78533a" />
                    </g>
                  )}
                  {rooms.library >= 3 && (
                    <g>
                      <rect x="94" y="60" width="6" height="6" fill="#60a5fa" />
                      <rect x="95" y="61" width="4" height="4" fill="#cfeaff" />
                    </g>
                  )}

                  {/* Rune-Carved Desk Furniture (Clickable for Tooltip) */}
                  {furn.has('scholar-desk') && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedRoom('library');
                        const def = HOME_FURNITURE.find((f) => f.id === 'scholar-desk');
                        if (def) {
                          setInspected({
                            title: def.name,
                            subtitle: `Study Library · Lv.${rooms.library || 0}`,
                            detail: def.perk,
                            color: roomColors.library,
                          });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <rect x="92" y="94" width="38" height="4" fill="#82563c" />
                      <rect x="95" y="98" width="4" height="14" fill="#593827" />
                      <rect x="123" y="98" width="4" height="14" fill="#593827" />
                      {/* Open Spellbook & Glowing Lamp */}
                      <rect x="98" y="89" width="14" height="5" fill="#f5ead0" />
                      <rect x="104" y="89" width="2" height="5" fill="#c7b287" />
                      <rect x="116" y="86" width="7" height="8" fill="#38bdf8" />
                      <rect x="118" y="88" width="3" height="4" fill="#e0f7ff" />
                    </g>
                  )}

                  {/* Brass Astrolabe Telescope Furniture (Clickable for Tooltip) */}
                  {furn.has('star-telescope') && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedRoom('library');
                        const def = HOME_FURNITURE.find((f) => f.id === 'star-telescope');
                        if (def) {
                          setInspected({
                            title: def.name,
                            subtitle: `Study Library · Lv.${rooms.library || 0}`,
                            detail: def.perk,
                            color: roomColors.library,
                          });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <rect x="148" y="76" width="14" height="5" fill="#e8b84b" />
                      <rect x="145" y="74" width="5" height="5" fill="#fde68a" />
                      <rect x="159" y="77" width="4" height="4" fill="#93c5fd" />
                      <rect x="153" y="81" width="3" height="29" fill="#7d533c" />
                      <rect x="147" y="106" width="4" height="6" fill="#593827" />
                      <rect x="158" y="106" width="4" height="6" fill="#593827" />
                    </g>
                  )}
                </g>
              ) : (
                <g>
                  {/* Cobweb & Locked Dusty Crates */}
                  <polygon points="48,58 68,58 48,78" fill="#666882" opacity="0.35" />
                  <rect x="58" y="94" width="18" height="16" fill="#4f3728" />
                  <rect x="60" y="96" width="14" height="12" fill="#694b38" />
                  <rect x="82" y="76" width="58" height="14" fill="#171421" opacity="0.85" />
                  <text x="111" y="86" textAnchor="middle" fill="#9c9cb5" fontSize="7.5" fontWeight="700">
                    Study (Locked)
                  </text>
                </g>
              )}
            </g>

            {/* ================== UPPER RIGHT: TROPHY ALCOVE & QUARTERS ================== */}
            <g onClick={() => setFocusedRoom('trophy')} className="cursor-pointer">
              <rect x="178" y="58" width="126" height="54" fill="#2b202e" />
              {/* Warm wood wainscot & Crimson Wall Tapestry */}
              <rect x="178" y="96" width="126" height="16" fill="#422c26" />
              <rect x="184" y="62" width="16" height="26" fill="#7c2d3b" />
              <rect x="186" y="64" width="12" height="20" fill="#a13d4f" />
              <rect x="190" y="68" width="4" height="10" fill="#e8b84b" />

              {/* Cozy Quilted Hero Bed */}
              <rect x="254" y="92" width="44" height="18" fill="#593828" />
              <rect x="252" y="84" width="5" height="26" fill="#6e4632" />
              <rect x="295" y="88" width="5" height="22" fill="#6e4632" />
              <rect x="257" y="88" width="12" height="6" fill="#ede9fe" />
              <rect x="269" y="90" width="26" height="12" fill="#9b7bf0" />
              <rect x="271" y="92" width="22" height="4" fill="#c4b5fd" />

              {/* Oak Trophy Shelf */}
              <rect x="206" y="78" width="74" height="4" fill="#7d523a" />
              <rect x="208" y="82" width="4" height="5" fill="#543626" />
              <rect x="274" y="82" width="4" height="5" fill="#543626" />

              {rooms.trophy > 0 || save.home.trophies.length > 0 ? (
                <g>
                  {save.home.trophies.slice(0, 5).map((tid, idx) => {
                    const tr = HOME_TROPHIES[tid];
                    return (
                      <g
                        key={tid}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusedRoom('trophy');
                          if (tr) {
                            setInspected({
                              title: tr.name,
                              subtitle: 'Trophy Alcove',
                              detail: tr.desc,
                              color: tr.color,
                            });
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <PixelTrophyIcon
                          id={tid}
                          x={210 + idx * 14}
                          y={67}
                          color={tr?.color || '#e8b84b'}
                        />
                      </g>
                    );
                  })}
                  {/* Knight Armor Stand at Lv.2+ */}
                  {rooms.trophy >= 2 && (
                    <g transform="translate(230, 88)">
                      <rect x={4} y={0} width={6} height={6} fill="#9ca3af" />
                      <rect x={2} y={6} width={10} height={10} fill="#6b7280" />
                      <rect x={5} y={16} width={4} height={6} fill="#4b3629" />
                    </g>
                  )}
                </g>
              ) : (
                <g>
                  <rect x="208" y="64" width="68" height="13" fill="#181421" opacity="0.82" />
                  <text x="242" y="73" textAnchor="middle" fill="#a2a2b8" fontSize="7" fontWeight="700">
                    Trophy Alcove
                  </text>
                </g>
              )}
            </g>

            {/* Floor Divider Beam & Central Ladder Shaft */}
            <rect x="44" y="112" width="264" height="6" fill="#5e4031" />
            <rect x="44" y="112" width="264" height="2" fill="#825a46" />
            <rect x="174" y="58" width="4" height="122" fill="#4f3629" />
            {/* Wooden Ladder Connecting Floors */}
            <rect x="158" y="86" width="2" height="86" fill="#9c6f4b" />
            <rect x="168" y="86" width="2" height="86" fill="#9c6f4b" />
            {[92, 102, 112, 122, 132, 142, 152, 162].map((ly) => (
              <rect key={ly} x="160" y={ly} width="8" height="2" fill="#ba8961" />
            ))}

            {/* ================== GROUND LEFT: LIVING HALL (+ HERO & PET!) ================== */}
            <g onClick={() => setFocusedRoom('living')} className="cursor-pointer">
              <rect x="48" y="118" width="126" height="62" fill="#2c2330" />
              {/* Brick lower stone wainscot */}
              <rect x="48" y="156" width="126" height="24" fill="#3a2c29" />
              <rect x="48" y="156" width="126" height="2" fill="#5e453b" />
              {/* Wooden Floorboards */}
              <rect x="48" y="176" width="126" height="4" fill="#6b4a36" />

              {/* Arched Oak Front Door with Iron Bands */}
              <rect x="54" y="132" width="24" height="44" fill="#261914" />
              <rect x="56" y="134" width="20" height="42" fill="#63402e" />
              <rect x="56" y="144" width="20" height="2" fill="#3b3d4a" />
              <rect x="56" y="162" width="20" height="2" fill="#3b3d4a" />
              <rect x="70" y="152" width="3" height="3" fill="#fbbf24" />

              {/* Framed Landscape Painting on Wall */}
              <rect x="88" y="124" width="24" height="16" fill="#704b36" />
              <rect x="90" y="126" width="20" height="12" fill="#3b6e8c" />
              <polygon points="90,138 98,131 105,138" fill="#3a6b48" />
              <rect x="104" y="128" width="3" height="3" fill="#fde047" />

              {/* Crackling Stone Hearth Furniture */}
              {furn.has('oak-hearth') ? (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedRoom('living');
                    const def = HOME_FURNITURE.find((f) => f.id === 'oak-hearth');
                    if (def) {
                      setInspected({
                        title: def.name,
                        subtitle: `Living Hall · Lv.${rooms.living || 0}`,
                        detail: def.perk,
                        color: roomColors.living,
                      });
                    }
                  }}
                  className="cursor-pointer"
                >
                  <rect x="132" y="124" width="30" height="52" fill="#545869" />
                  <rect x="130" y="142" width="34" height="4" fill="#73788c" />
                  {/* Brick pattern */}
                  <rect x="135" y="128" width="8" height="4" fill="#696e82" />
                  <rect x="148" y="134" width="9" height="4" fill="#696e82" />
                  {/* Firebox & Layered Flames */}
                  <rect x="138" y="154" width="18" height="22" fill="#140f17" />
                  <rect x="140" y="170" width="14" height="4" fill="#5c3a28" />
                  <rect x="141" y="160" width="12" height="11" fill="#ea580c" opacity="0.9" />
                  <rect x="143" y="158" width="8" height="12" fill="#fb923c" />
                  <rect x="145" y="162" width="4" height="8" fill="#fde047" />
                  <rect x="146" y="165" width="2" height="4" fill="#ffffff" />
                  {/* Warm Firelight Floor Reflection */}
                  <rect x="128" y="176" width="36" height="3" fill="#fb923c" opacity="0.25" />
                </g>
              ) : (
                /* Cozy Small Dining Table with Candle when Hearth not bought yet */
                <g>
                  <rect x="132" y="158" width="26" height="4" fill="#7d533c" />
                  <rect x="135" y="162" width="3" height="14" fill="#593a2a" />
                  <rect x="152" y="162" width="3" height="14" fill="#593a2a" />
                  <rect x="142" y="152" width="4" height="6" fill="#fef3c7" />
                  <rect x="143" y="149" width="2" height="3" fill="#fb923c" />
                </g>
              )}

              {/* Embroidered Geometric Tapestry Rug */}
              {furn.has('woven-rug') && (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedRoom('living');
                    const def = HOME_FURNITURE.find((f) => f.id === 'woven-rug');
                    if (def) {
                      setInspected({
                        title: def.name,
                        subtitle: `Living Hall · Lv.${rooms.living || 0}`,
                        detail: def.perk,
                        color: roomColors.living,
                      });
                    }
                  }}
                  className="cursor-pointer"
                >
                  <rect x="82" y="173" width="54" height="4" fill="#b83b5e" />
                  <rect x="85" y="174" width="48" height="2" fill="#f08a5d" />
                  <rect x="103" y="174" width="12" height="2" fill="#ffe680" />
                </g>
              )}

              {/* The Player's Actual Customized Hero Standing Inside Their Home! */}
              <g transform="translate(82, 126) scale(0.8)">
                <g dangerouslySetInnerHTML={{ __html: heroLayers.charRects }} />
                {heroLayers.wispRects && <g dangerouslySetInnerHTML={{ __html: heroLayers.wispRects }} />}
              </g>

              {/* Active Pet Companion Inside the Living Hall */}
              {petSprite && (
                <g transform="translate(114, 155) scale(0.9)">
                  <g dangerouslySetInnerHTML={{ __html: petSprite.rects }} />
                </g>
              )}
            </g>

            {/* ================== GROUND RIGHT: TRAINING ROOM & ARMORY ================== */}
            <g onClick={() => setFocusedRoom('training')} className="cursor-pointer">
              <rect x="178" y="118" width="126" height="62" fill="#232530" />
              {/* Ashlar Stone Wall Blocks */}
              {[124, 138, 152, 166].map((by, row) =>
                [184, 212, 240, 268].map((bx) => (
                  <rect
                    key={`${bx}-${by}`}
                    x={bx + (row % 2 === 0 ? 0 : 8)}
                    y={by}
                    width={18}
                    height={10}
                    fill="#2b2e3d"
                  />
                ))
              )}
              <rect x="178" y="176" width="126" height="4" fill="#4f5466" />

              {rooms.training > 0 ? (
                <g>
                  {/* Wall Torch */}
                  <rect x="188" y="134" width="3" height="12" fill="#63402e" />
                  <rect x="187" y="128" width="5" height="6" fill="#fb923c" />
                  <rect x="188" y="130" width="3" height="3" fill="#fde047" />

                  {/* Weapon & Shield Rack */}
                  <rect x="198" y="142" width="36" height="34" fill="#4f3325" />
                  <rect x="200" y="144" width="32" height="30" fill="#2e211b" />
                  {/* Sword */}
                  <rect x="206" y="146" width="3" height="18" fill="#cbd5e1" />
                  <rect x="203" y="160" width="9" height="2" fill="#e8b84b" />
                  {/* Battleaxe */}
                  <rect x="218" y="146" width="3" height="22" fill="#8c5f42" />
                  <rect x="215" y="146" width="8" height="7" fill="#94a3b8" />
                  {/* Round Shield */}
                  <rect x="224" y="152" width="8" height="10" fill="#2563eb" />
                  <rect x="226" y="154" width="4" height="6" fill="#fbbf24" />

                  {/* Archery Bullseye Target */}
                  <rect x="282" y="134" width="14" height="18" fill="#f5e6c8" />
                  <rect x="284" y="136" width="10" height="14" fill="#dc2626" />
                  <rect x="286" y="139" width="6" height="8" fill="#f5e6c8" />
                  <rect x="288" y="141" width="2" height="4" fill="#eab308" />

                  {/* Iron Anvil at Lv.2+ */}
                  {rooms.training >= 2 && (
                    <g transform="translate(238, 162)">
                      <rect x={0} y={4} width={16} height={4} fill="#64748b" />
                      <rect x={4} y={8} width={8} height={6} fill="#475569" />
                    </g>
                  )}

                  {/* Sparring Automaton Furniture */}
                  {furn.has('iron-dummy') && (
                    <g
                      transform="translate(260, 138)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedRoom('training');
                        const def = HOME_FURNITURE.find((f) => f.id === 'iron-dummy');
                        if (def) {
                          setInspected({
                            title: def.name,
                            subtitle: `Training Room · Lv.${rooms.training || 0}`,
                            detail: def.perk,
                            color: roomColors.training,
                          });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <rect x={7} y={22} width={4} height={16} fill="#63402e" />
                      <rect x={3} y={10} width={12} height={14} fill="#c2956b" />
                      <rect x={0} y={12} width={18} height={4} fill="#7d533c" />
                      <rect x={5} y={1} width={8} height={9} fill="#94a3b8" />
                      <rect x={7} y={4} width={4} height={2} fill="#1e293b" />
                      {/* Wooden Buckler on arm */}
                      <rect x={15} y={11} width={5} height={8} fill="#d97706" />
                    </g>
                  )}
                </g>
              ) : (
                <g>
                  <rect x="194" y="156" width="22" height="20" fill="#4a3327" />
                  <rect x="206" y="136" width="70" height="14" fill="#171421" opacity="0.85" />
                  <text x="241" y="146" textAnchor="middle" fill="#9c9cb5" fontSize="7.5" fontWeight="700">
                    Training (Locked)
                  </text>
                </g>
              )}
            </g>

            {/* Exterior Porch Hanging Lantern */}
            <rect x="36" y="114" width="10" height="3" fill="#3a3d4d" />
            <rect x="38" y="117" width="6" height="8" fill="#18141c" />
            <rect x="39" y="119" width="4" height="4" fill="#fde047" />

            {/* ================== COURTYARD RIGHT: HERB GARDEN ================== */}
            <g onClick={() => setFocusedRoom('garden')} className="cursor-pointer">
              {/* Garden Fence */}
              <rect x="308" y="160" width="114" height="3" fill="#5e3f2d" />
              {[316, 336, 356, 376, 396, 416].map((fx) => (
                <rect key={fx} x={fx} y={154} width={4} height={24} fill="#78513a" />
              ))}

              {rooms.garden > 0 ? (
                <g>
                  {/* Stone Lantern Post */}
                  <rect x="406" y="144" width="6" height="34" fill="#6b7280" />
                  <rect x="404" y="138" width="10" height="8" fill="#4b5563" />
                  <rect x="407" y="140" width="4" height="4" fill="#a7f3d0" />

                  {/* Raised Oak Planter Boxes */}
                  <rect x="314" y="164" width="84" height="14" fill="#63402e" />
                  <rect x="316" y="164" width="80" height="4" fill="#3b261c" />

                  {/* Sprouting Pixel Herbs & Glowing Mushrooms */}
                  <rect x="320" y="152" width="12" height="12" fill="#34d399" />
                  <rect x="322" y="148" width="8" height="6" fill="#6ee7b7" />
                  <rect x="338" y="150" width="14" height="14" fill="#22c55e" />
                  <rect x="342" y="148" width="4" height="4" fill="#f43f5e" />
                  <rect x="346" y="154" width="4" height="4" fill="#fbbf24" />

                  {/* Glowing Mushrooms at Lv.2+ */}
                  {rooms.garden >= 2 && (
                    <g>
                      <rect x="358" y="156" width="4" height="8" fill="#e2e8f0" />
                      <rect x="355" y="152" width="10" height="5" fill="#38bdf8" />
                    </g>
                  )}

                  {/* Luminous Moonflower Planter Furniture */}
                  {furn.has('moon-planter') && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedRoom('garden');
                        const def = HOME_FURNITURE.find((f) => f.id === 'moon-planter');
                        if (def) {
                          setInspected({
                            title: def.name,
                            subtitle: `Herb Garden · Lv.${rooms.garden || 0}`,
                            detail: def.perk,
                            color: roomColors.garden,
                          });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <rect x="374" y="146" width="16" height="18" fill="#4c1d95" opacity="0.4" />
                      <rect x="380" y="154" width="3" height="10" fill="#4ade80" />
                      <rect x="376" y="144" width="12" height="10" fill="#a78bfa" />
                      <rect x="379" y="146" width="6" height="6" fill="#e9d5ff" />
                      <rect x="381" y="148" width="2" height="2" fill="#fef08a" />
                      {/* Fireflies */}
                      <rect x="372" y="138" width="2" height="2" fill="#fde047" />
                      <rect x="392" y="140" width="2" height="2" fill="#67e8f9" />
                    </g>
                  )}
                </g>
              ) : (
                <g>
                  <rect x="326" y="154" width="76" height="14" fill="#171421" opacity="0.82" />
                  <text x="364" y="164" textAnchor="middle" fill="#9c9cb5" fontSize="7.5" fontWeight="700">
                    Garden (Locked)
                  </text>
                </g>
              )}
            </g>

            {/* Seasonal Sanctuary Decor (Unlocked via Seasonal Shop) */}
            {hasFallDecor && (
              <g
                onClick={() =>
                  setInspected({
                    title: 'Autumn Harvest Lanterns',
                    subtitle: t.seasonalDecorTitle,
                    detail: 'Glowing carved pumpkin & amber leaf garland from the Fall Collection.',
                    color: '#fb923c',
                  })
                }
                className="cursor-pointer"
              >
                {/* Glowing Jack-o'-Lantern on Porch */}
                <rect x="32" y="169" width="10" height="9" fill="#ea580c" />
                <rect x="36" y="166" width="2" height="3" fill="#4d7c0f" />
                <rect x="34" y="172" width="2" height="2" fill="#fef08a" />
                <rect x="38" y="172" width="2" height="2" fill="#fef08a" />
                <rect x="34" y="175" width="6" height="1" fill="#fde047" />
                {/* Autumn Leaf Eave Garland */}
                {[52, 74, 96, 118, 140, 162, 184, 206, 228, 250, 272, 294].map((gx, gi) => (
                  <rect
                    key={gx}
                    x={gx}
                    y={55}
                    width={6}
                    height={3}
                    fill={gi % 2 === 0 ? '#f97316' : '#eab308'}
                  />
                ))}
              </g>
            )}

            {hasWinterDecor && (
              <g
                onClick={() =>
                  setInspected({
                    title: 'Wintertide Frost Lights & Wreath',
                    subtitle: t.seasonalDecorTitle,
                    detail: 'Festive wreath, roof lights, and frosted pine from the Christmas Collection.',
                    color: '#60a5fa',
                  })
                }
                className="cursor-pointer"
              >
                {/* Snow Lights under Eaves */}
                {[52, 72, 92, 112, 132, 152, 172, 192, 212, 232, 252, 272, 292].map((lx, li) => (
                  <rect
                    key={lx}
                    x={lx}
                    y={55}
                    width={4}
                    height={3}
                    fill={li % 3 === 0 ? '#93c5fd' : li % 3 === 1 ? '#fde047' : '#f87171'}
                  />
                ))}
                {/* Festive Wreath on Front Door */}
                <rect x="61" y="138" width="10" height="10" fill="#16a34a" />
                <rect x="63" y="140" width="6" height="6" fill="#63402e" />
                <rect x="65" y="138" width="2" height="2" fill="#ef4444" />
                {/* Mini Frosted Pine by Porch */}
                <rect x="32" y="170" width="2" height="8" fill="#5c3a28" />
                <polygon points="26,172 33,158 40,172" fill="#15803d" />
                <rect x="32" y="156" width="2" height="2" fill="#fde047" />
              </g>
            )}

            {/* Active Room Highlight Frame */}
            {focusedRoom === 'library' && (
              <rect x="48" y="58" width="126" height="54" fill="none" stroke={roomColors.library} strokeWidth="1.5" strokeDasharray="4 3" />
            )}
            {focusedRoom === 'trophy' && (
              <rect x="178" y="58" width="126" height="54" fill="none" stroke={roomColors.trophy} strokeWidth="1.5" strokeDasharray="4 3" />
            )}
            {focusedRoom === 'living' && (
              <rect x="48" y="118" width="126" height="62" fill="none" stroke={roomColors.living} strokeWidth="1.5" strokeDasharray="4 3" />
            )}
            {focusedRoom === 'training' && (
              <rect x="178" y="118" width="126" height="62" fill="none" stroke={roomColors.training} strokeWidth="1.5" strokeDasharray="4 3" />
            )}
            {focusedRoom === 'garden' && (
              <rect x="308" y="138" width="114" height="42" fill="none" stroke={roomColors.garden} strokeWidth="1.5" strokeDasharray="4 3" />
            )}
          </svg>
        </div>

        {/* Interactive Room Selector Pills */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {HOME_ROOMS.map((rm) => {
              const active = focusedRoom === rm.id;
              return (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() => {
                    setFocusedRoom(rm.id);
                    setInspected({
                      title: rm.name,
                      subtitle: `Lv. ${rooms[rm.id] || 0} / ${rm.maxLevel}`,
                      detail: rm.desc,
                      color: roomColors[rm.id],
                    });
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    active ? 'bg-[#2c2c32] text-[#f5f5f7]' : 'bg-[#202024] text-[#8e8e93] hover:text-[#e5e5ea]'
                  }`}
                  style={active ? { boxShadow: `inset 0 0 0 1px ${roomColors[rm.id]}` } : undefined}
                >
                  {rm.name} · Lv.{rooms[rm.id] || 0}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Inspection Tooltip Card */}
        {inspected ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#202024] px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: inspected.color }}>
                {inspected.subtitle}
              </p>
              <p className="text-sm font-semibold text-[#f5f5f7]">{inspected.title}</p>
              <p className="text-xs text-[#a1a1aa]">{inspected.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setInspected(null)}
              aria-label={t.close}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2b2b30] text-[#8e8e93] hover:text-[#f5f5f7]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="mt-2.5 text-[11px] text-[#636369]">{t.inspectHint}</p>
        )}

        {/* Seasonal Sanctuary Decor Summary */}
        {ownedSeasonalItems.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-[#141418] px-3 py-2 text-[11px] text-[#a1a1aa]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#fb923c]" />
            <span className="font-semibold text-[#f5f5f7]">{t.seasonalDecorTitle}:</span>
            <span>
              {ownedSeasonalItems.slice(0, 3).map((x) => x.name).join(' · ')}
              {ownedSeasonalItems.length > 3 ? ` +${ownedSeasonalItems.length - 3}` : ''}
              {' '}({activeSeason === 'christmas' ? 'Winter' : 'Fall'})
            </span>
          </div>
        )}

        {/* Active Home Bonuses */}
        <p className="mt-3 text-xs text-[#8e8e93]">
          {t.activeHomePerks}:{' '}
          <span className="font-mono-num text-[#f5f5f7]">
            +{homeB.bonusXpPerQuest} XP/quest · +{homeB.bonusGoldPerQuest} Gold/quest · +{homeB.bonusBossDmg} Boss DMG · +{homeB.cleanHealHp} HP clean day
          </span>
        </p>
      </div>

      {/* Rooms */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t.roomsExpansions}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HOME_ROOMS.map((room) => {
            const lvl = rooms[room.id] || 0;
            const maxed = lvl >= room.maxLevel;
            const cost = room.baseCost + lvl * 35;
            const isSelected = focusedRoom === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setFocusedRoom(room.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition ${
                  isSelected ? 'border-white/20 bg-[#202024]' : 'border-white/[0.07] bg-[#18181b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#f5f5f7]">{room.name}</p>
                    <span className="font-mono-num text-xs font-semibold text-[#eab949]">
                      Lv. {lvl}/{room.maxLevel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8e8e93]">{room.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={maxed || save.gold < cost}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpgradeRoom(room.id);
                  }}
                  className="font-mono-num mt-3 min-h-[38px] w-full rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#111114] hover:bg-white disabled:bg-[#27272c] disabled:text-[#636369]"
                >
                  {maxed ? 'Max Level' : lvl === 0 ? `Build · ${cost} Gold` : `Upgrade · ${cost} Gold`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Furniture */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t.furnitureDecor}</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {HOME_FURNITURE.map((item) => {
            const owned = furn.has(item.id);
            const roomName = HOME_ROOMS.find((r) => r.id === item.room)?.name || item.room;
            const finalCost = getDiscountedCost(save, item.cost);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#18181b] p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f5f5f7]">{item.name}</p>
                  <p className="mt-0.5 text-xs text-[#8e8e93]">{item.perk}</p>
                  <p className="mt-0.5 text-[10px] font-semibold" style={{ color: roomColors[item.room] }}>
                    {roomName}
                  </p>
                </div>
                {owned ? (
                  <span className="shrink-0 text-xs font-semibold text-[#30d158]">Placed ✓</span>
                ) : (
                  <button
                    type="button"
                    disabled={save.gold < finalCost}
                    onClick={() => onBuyFurniture(item.id)}
                    className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#27272c] px-3.5 py-1.5 text-xs font-semibold text-[#f5f5f7] hover:bg-[#323238] disabled:opacity-40"
                  >
                    {finalCost < item.cost ? `${finalCost}G (${item.cost})` : `${item.cost} Gold`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trophies */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#eab949]" />
          <h3 className="text-sm font-semibold text-[#f5f5f7]">Trophy Shelf ({save.home.trophies.length})</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(HOME_TROPHIES).map(([id, tr]) => {
            const unlocked = save.home.trophies.includes(id);
            return (
              <div
                key={id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  unlocked
                    ? 'border-[#eab949]/30 bg-[#202024]'
                    : 'border-white/[0.04] bg-[#141418] opacity-55'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: unlocked ? tr.color : '#636369' }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#f5f5f7]">{tr.name}</p>
                  <p className="text-[11px] text-[#8e8e93]">{tr.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
