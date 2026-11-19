import { useMemo, useState, type FormEvent } from 'react';
import {
  Award,
  BookOpen,
  Check,
  Coins,
  Crown,
  Dumbbell,
  Eye,
  Flame,
  Heart,
  Leaf,
  Lock,
  ScrollText,
  Shield,
  Sparkles,
  Sword,
  Target,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react';
import {
  DOMAIN_META,
  LIFE_DOMAINS,
  SKILL_TREE_NODES,
  WEEKLY_BOSSES,
  type HeroSave,
  type LifeDomain,
} from '../types/arcana';
import {
  computeAnalytics,
  DOMAIN_XP_PER_LEVEL,
  getWeeklyReviewSummary,
} from '../engine/game';
import { buildHeroSpriteLayers } from '../sprites/heroSprite';

const DOMAIN_ICONS: Record<LifeDomain, typeof BookOpen> = {
  Knowledge: BookOpen,
  Strength: Dumbbell,
  Discipline: Target,
  Mindfulness: Leaf,
};

const NODE_ICONS: Record<string, typeof Sparkles> = {
  'know-1': Sparkles,
  'know-2': Zap,
  'know-3': ScrollText,
  'str-1': Dumbbell,
  'str-2': Sword,
  'str-3': Flame,
  'disc-1': Coins,
  'disc-2': Shield,
  'disc-3': Crown,
  'mind-1': Wind,
  'mind-2': Eye,
  'mind-3': Heart,
};

function SvgTalentGlyph({
  nodeId,
  x,
  y,
  color,
}: {
  nodeId: string;
  x: number;
  y: number;
  color: string;
}) {
  if (nodeId === 'know-1') {
    return (
      <path
        d={`M ${x} ${y - 6} L ${x + 1.8} ${y - 1.8} L ${x + 6} ${y} L ${x + 1.8} ${y + 1.8} L ${x} ${y + 6} L ${x - 1.8} ${y + 1.8} L ${x - 6} ${y} L ${x - 1.8} ${y - 1.8} Z`}
        fill={color}
      />
    );
  }
  if (nodeId === 'know-2') {
    return (
      <path
        d={`M ${x + 1} ${y - 6} L ${x - 4} ${y + 1} L ${x} ${y + 1} L ${x - 1} ${y + 6} L ${x + 4} ${y - 1} L ${x} ${y - 1} Z`}
        fill={color}
      />
    );
  }
  if (nodeId === 'know-3') {
    return (
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${x - 6} ${y - 4} Q ${x - 3} ${y - 5} ${x} ${y - 3} Q ${x + 3} ${y - 5} ${x + 6} ${y - 4} V ${y + 4} Q ${x + 3} ${y + 2} ${x} ${y + 4} Q ${x - 3} ${y + 2} ${x - 6} ${y + 4} Z`} />
        <line x1={x} y1={y - 3} x2={x} y2={y + 4} />
      </g>
    );
  }
  if (nodeId === 'str-1') {
    return (
      <g fill={color}>
        <rect x={x - 6} y={y - 3} width={2.5} height={6} rx={0.8} />
        <rect x={x + 3.5} y={y - 3} width={2.5} height={6} rx={0.8} />
        <rect x={x - 3.5} y={y - 1} width={7} height={2} />
      </g>
    );
  }
  if (nodeId === 'str-2') {
    return (
      <g stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} />
        <line x1={x - 4} y1={y + 1} x2={x - 1} y2={y + 4} />
      </g>
    );
  }
  if (nodeId === 'str-3') {
    return (
      <path
        d={`M ${x} ${y - 6} C ${x + 4} ${y - 2} ${x + 5} ${y + 2} ${x + 2} ${y + 5} C ${x + 1} ${y + 6} ${x - 2} ${y + 6} ${x - 3} ${y + 4} C ${x - 5} ${y + 2} ${x - 4} ${y - 2} ${x} ${y - 6} Z`}
        fill={color}
      />
    );
  }
  if (nodeId === 'disc-1') {
    return (
      <g>
        <circle cx={x} cy={y} r="5" fill="none" stroke={color} strokeWidth="1.7" />
        <line x1={x} y1={y - 2.5} x2={x} y2={y + 2.5} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }
  if (nodeId === 'disc-2') {
    return (
      <path
        d={`M ${x} ${y - 5.5} L ${x + 5} ${y - 3.5} V ${y + 0.5} C ${x + 5} ${y + 3.5} ${x + 2.5} ${y + 5.2} ${x} ${y + 6} C ${x - 2.5} ${y + 5.2} ${x - 5} ${y + 3.5} ${x - 5} ${y + 0.5} V ${y - 3.5} Z`}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }
  if (nodeId === 'disc-3') {
    return (
      <path
        d={`M ${x - 5.5} ${y + 3.5} L ${x - 5.5} ${y - 2} L ${x - 2.5} ${y + 0.5} L ${x} ${y - 4.5} L ${x + 2.5} ${y + 0.5} L ${x + 5.5} ${y - 2} L ${x + 5.5} ${y + 3.5} Z`}
        fill={color}
      />
    );
  }
  if (nodeId === 'mind-1') {
    return (
      <path
        d={`M ${x - 4} ${y + 4} C ${x - 4} ${y - 2} ${x + 1} ${y - 5} ${x + 5} ${y - 5} C ${x + 5} ${y - 1} ${x + 2} ${y + 4} ${x - 4} ${y + 4} Z`}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }
  if (nodeId === 'mind-2') {
    return (
      <g>
        <path
          d={`M ${x - 6} ${y} Q ${x} ${y - 5} ${x + 6} ${y} Q ${x} ${y + 5} ${x - 6} ${y} Z`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
        <circle cx={x} cy={y} r="2" fill={color} />
      </g>
    );
  }
  return (
    <path
      d={`M ${x} ${y + 5} C ${x - 5.5} ${y + 1.5} ${x - 6} ${y - 3.5} ${x - 2.8} ${y - 4.5} C ${x - 1} ${y - 5} ${x} ${y - 3.2} ${x} ${y - 3.2} C ${x} ${y - 3.2} ${x + 1} ${y - 5} ${x + 2.8} ${y - 4.5} C ${x + 6} ${y - 3.5} ${x + 5.5} ${y + 1.5} ${x} ${y + 5} Z`}
      fill={color}
    />
  );
}

export function SkillTreeSection({
  save,
  onUnlockNode,
}: {
  save: HeroSave;
  onUnlockNode: (nodeId: string) => void;
}) {
  const unlockedSet = new Set(save.skillTree.unlockedNodes);
  const [selectedId, setSelectedId] = useState<string>(() => {
    const firstUnlockable = SKILL_TREE_NODES.find(
      (n) => !unlockedSet.has(n.id) && (!n.requires || unlockedSet.has(n.requires))
    );
    return firstUnlockable?.id || SKILL_TREE_NODES[0].id;
  });

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

  const selectedNode = SKILL_TREE_NODES.find((n) => n.id === selectedId) || SKILL_TREE_NODES[0];
  const selectedUnlocked = unlockedSet.has(selectedNode.id);
  const selectedReqMet = !selectedNode.requires || unlockedSet.has(selectedNode.requires);
  const selectedCanAfford = save.skillTree.skillPoints >= selectedNode.cost;
  const selectedMeta = DOMAIN_META[selectedNode.domain];
  const SelectedIcon = NODE_ICONS[selectedNode.id] || Sparkles;

  const center = { x: 200, y: 140 };
  const nodeCoords: Record<string, { x: number; y: number }> = {
    'know-1': { x: 142, y: 108 },
    'know-2': { x: 96, y: 74 },
    'know-3': { x: 52, y: 44 },
    'str-1': { x: 258, y: 108 },
    'str-2': { x: 304, y: 74 },
    'str-3': { x: 348, y: 44 },
    'disc-1': { x: 142, y: 172 },
    'disc-2': { x: 96, y: 206 },
    'disc-3': { x: 52, y: 236 },
    'mind-1': { x: 258, y: 172 },
    'mind-2': { x: 304, y: 206 },
    'mind-3': { x: 348, y: 236 },
  };

  // Creative curved Bezier path builder between parent & child nodes
  const buildConstellationPath = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    domain: LifeDomain
  ) => {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const bend = domain === 'Knowledge' || domain === 'Mindfulness' ? -10 : 10;
    return `M ${p1.x} ${p1.y} Q ${mx} ${my + bend} ${p2.x} ${p2.y}`;
  };

  return (
    <div className="space-y-4">
      {/* Apple-Minimalist Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#18181b] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8e8e93]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#f5f5f7]">
            <Target className="h-3.5 w-3.5 text-[#60a5fa]" />
            Habits &amp; Quests
          </span>
          <span className="text-[#48484e]">→</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#f5f5f7]">
            <Sparkles className="h-3.5 w-3.5 text-[#eab949]" />
            +1 SP / {DOMAIN_XP_PER_LEVEL} XP
          </span>
          <span className="text-[#48484e]">→</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#f5f5f7]">
            <Zap className="h-3.5 w-3.5 text-[#30d158]" />
            Activate Talent
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#222226] px-3.5 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#e5e5ea]" />
          <span className="font-mono-num text-xs font-bold text-[#f5f5f7]">
            {save.skillTree.skillPoints} SP
          </span>
        </div>
      </div>

      {/* Creative Constellation Skill Tree Canvas with Hero Avatar Core */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-3">
        <svg
          viewBox="0 0 400 280"
          className="h-auto w-full select-none rounded-xl bg-[#111114]"
          aria-label="ARCANA Interactive Skill Tree"
        >
          <defs>
            <clipPath id="skill-hero-clip">
              <circle cx="200" cy="140" r="25" />
            </clipPath>
            <radialGradient id="skill-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Subtle Constellation Halo & Orbital Rings */}
          <circle cx="200" cy="140" r="122" fill="url(#skill-core-glow)" />
          <circle cx="200" cy="140" r="62" fill="none" stroke="#222227" strokeWidth="1" />
          <circle
            cx="200"
            cy="140"
            r="102"
            fill="none"
            stroke="#1e1e23"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <circle cx="200" cy="140" r="142" fill="none" stroke="#18181c" strokeWidth="1" />

          {/* Tiny Ambient Starlight Dots */}
          {[
            [42, 114], [358, 114], [42, 166], [358, 166], [200, 32], [200, 248],
            [128, 36], [272, 36], [128, 244], [272, 244],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 2 === 0 ? 1.2 : 0.9} fill="#3f3f48" />
          ))}

          {/* Safe-Margin Corner Domain Labels */}
          <text x="16" y="20" fill="#60a5fa" fontSize="8.5" fontWeight="700" letterSpacing="0.06em">
            KNOWLEDGE
          </text>
          <text x="384" y="20" textAnchor="end" fill="#f87171" fontSize="8.5" fontWeight="700" letterSpacing="0.06em">
            STRENGTH
          </text>
          <text x="16" y="266" fill="#fbbf24" fontSize="8.5" fontWeight="700" letterSpacing="0.06em">
            DISCIPLINE
          </text>
          <text x="384" y="266" textAnchor="end" fill="#30d158" fontSize="8.5" fontWeight="700" letterSpacing="0.06em">
            MINDFULNESS
          </text>

          {/* Curved Constellation Branch Connections */}
          {SKILL_TREE_NODES.map((node) => {
            const p1 = node.requires ? nodeCoords[node.requires] : center;
            const p2 = nodeCoords[node.id];
            const isUnlocked = unlockedSet.has(node.id);
            const canUnlockNow =
              !isUnlocked &&
              (!node.requires || unlockedSet.has(node.requires)) &&
              save.skillTree.skillPoints >= node.cost;
            const dColor = DOMAIN_META[node.domain].color;
            const pathD = buildConstellationPath(p1, p2, node.domain);

            return (
              <g key={`edge-${node.id}`}>
                {isUnlocked && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={dColor}
                    strokeWidth={5}
                    opacity={0.18}
                    strokeLinecap="round"
                  />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isUnlocked ? dColor : canUnlockNow ? '#9898a6' : '#2a2a30'}
                  strokeWidth={isUnlocked ? 2.2 : 1.5}
                  strokeDasharray={isUnlocked ? 'none' : '3.5 3.5'}
                  strokeLinecap="round"
                  opacity={isUnlocked ? 0.95 : canUnlockNow ? 0.85 : 0.7}
                />
              </g>
            );
          })}

          {/* Central Hero Avatar Medallion (Replaces Star) */}
          <g>
            <circle cx="200" cy="140" r="29" fill="none" stroke="#2c2c33" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="140" r="26" fill="#232329" stroke="#63636e" strokeWidth="1.8" />
            <g clipPath="url(#skill-hero-clip)" className="pixel-svg">
              <g transform="translate(176, 114) scale(1)">
                <g dangerouslySetInnerHTML={{ __html: heroLayers.charRects }} />
                {heroLayers.wispRects && (
                  <g dangerouslySetInnerHTML={{ __html: heroLayers.wispRects }} />
                )}
              </g>
            </g>
            {/* Subtle SP Counter Tag Anchored Below Avatar */}
            <rect
              x="182"
              y="162"
              width="36"
              height="12"
              rx="6"
              fill="#18181b"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
            />
            <text
              x="200"
              y="170.5"
              textAnchor="middle"
              fill="#f5f5f7"
              fontSize="7"
              fontWeight="700"
            >
              {save.skillTree.skillPoints} SP
            </text>
          </g>

          {/* Icon Talent Nodes */}
          {SKILL_TREE_NODES.map((node) => {
            const pos = nodeCoords[node.id];
            const isUnlocked = unlockedSet.has(node.id);
            const reqMet = !node.requires || unlockedSet.has(node.requires);
            const ready = !isUnlocked && reqMet && save.skillTree.skillPoints >= node.cost;
            const isSelected = selectedId === node.id;
            const dColor = DOMAIN_META[node.domain].color;
            const glyphColor = isUnlocked ? '#111114' : reqMet ? dColor : '#5c5c66';

            return (
              <g
                key={node.id}
                onClick={() => setSelectedId(node.id)}
                className="cursor-pointer"
              >
                {isUnlocked && (
                  <rect
                    x={pos.x - 16}
                    y={pos.y - 16}
                    width="32"
                    height="32"
                    rx="10"
                    fill={dColor}
                    opacity="0.18"
                  />
                )}
                {isSelected && (
                  <rect
                    x={pos.x - 18}
                    y={pos.y - 18}
                    width="36"
                    height="36"
                    rx="11"
                    fill="none"
                    stroke="#f5f5f7"
                    strokeWidth="1.6"
                  />
                )}
                <rect
                  x={pos.x - 14}
                  y={pos.y - 14}
                  width="28"
                  height="28"
                  rx="8.5"
                  fill={isUnlocked ? dColor : reqMet ? '#1d1d22' : '#141418'}
                  stroke={isUnlocked ? '#ffffff' : ready ? dColor : reqMet ? dColor : '#2c2c33'}
                  strokeWidth={ready ? '1.8' : '1.4'}
                />
                <SvgTalentGlyph nodeId={node.id} x={pos.x} y={pos.y} color={glyphColor} />

                {/* Corner Check or Tier Number */}
                <circle
                  cx={pos.x + 12}
                  cy={pos.y - 12}
                  r="5.5"
                  fill={isUnlocked ? '#30d158' : '#1b1b20'}
                  stroke={isUnlocked ? '#111114' : '#35353d'}
                  strokeWidth="1"
                />
                <text
                  x={pos.x + 12}
                  y={pos.y - 9.5}
                  textAnchor="middle"
                  fill={isUnlocked ? '#111114' : '#a1a1aa'}
                  fontSize="6.5"
                  fontWeight="800"
                >
                  {isUnlocked ? '✓' : node.tier}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Minimalist Selected Talent Inspector */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#202024] px-3.5 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: `${selectedMeta.color}1e`, color: selectedMeta.color }}
            >
              <SelectedIcon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#f5f5f7]">
                {selectedNode.name}{' '}
                <span className="font-mono-num text-[11px] font-medium text-[#8e8e93]">
                  · Tier {selectedNode.tier}
                </span>
              </p>
              <p className="truncate text-xs text-[#8e8e93]">{selectedNode.effect}</p>
            </div>
          </div>

          {selectedUnlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#192f22] px-3 py-1.5 text-xs font-semibold text-[#30d158]">
              <Check className="h-3.5 w-3.5" />
              Active
            </span>
          ) : !selectedReqMet ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2a2a30] px-3 py-1.5 text-xs font-medium text-[#8e8e93]">
              <Lock className="h-3.5 w-3.5" />
              Tier {selectedNode.tier - 1}
            </span>
          ) : (
            <button
              type="button"
              disabled={!selectedCanAfford}
              onClick={() => onUnlockNode(selectedNode.id)}
              className="font-mono-num min-h-[36px] shrink-0 rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-semibold text-[#111114] transition hover:bg-white disabled:bg-[#2c2c32] disabled:text-[#6e6e76]"
            >
              Unlock · {selectedNode.cost} SP
            </button>
          )}
        </div>
      </div>

      {/* Minimalist 4-Domain Talent Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {LIFE_DOMAINS.map((domain) => {
          const meta = DOMAIN_META[domain];
          const DomainIcon = DOMAIN_ICONS[domain];
          const lvl = save.skillTree.domainLevel[domain] || 1;
          const xp = save.skillTree.domainXp[domain] || 0;
          const pct = Math.min(100, (xp / DOMAIN_XP_PER_LEVEL) * 100);
          const nodes = SKILL_TREE_NODES.filter((n) => n.domain === domain).sort(
            (a, b) => a.tier - b.tier
          );

          return (
            <div key={domain} className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `${meta.color}1c`, color: meta.color }}
                  >
                    <DomainIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f5f7]">{domain}</h3>
                </div>
                <span className="font-mono-num text-xs font-medium text-[#8e8e93]">
                  Lv. {lvl} · {xp}/{DOMAIN_XP_PER_LEVEL}
                </span>
              </div>

              <div className="my-3 h-1.5 w-full overflow-hidden rounded-full bg-[#111114]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: meta.color }}
                />
              </div>

              <div className="space-y-1.5">
                {nodes.map((node) => {
                  const NodeIcon = NODE_ICONS[node.id] || Sparkles;
                  const isUnlocked = unlockedSet.has(node.id);
                  const reqMet = !node.requires || unlockedSet.has(node.requires);
                  const canAfford = save.skillTree.skillPoints >= node.cost;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
                        isUnlocked
                          ? 'bg-[#17261e]'
                          : selectedId === node.id
                            ? 'bg-[#26262b]'
                            : 'bg-[#202024] hover:bg-[#25252a]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                          style={{
                            backgroundColor: isUnlocked ? `${meta.color}24` : '#141418',
                            color: isUnlocked || reqMet ? meta.color : '#5c5c66',
                          }}
                        >
                          <NodeIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#f5f5f7]">{node.name}</p>
                          <p className="truncate text-[11px] text-[#8e8e93]">{node.effect}</p>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <Check className="h-4 w-4 shrink-0 text-[#30d158]" />
                      ) : !reqMet ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-[#5c5c66]" />
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnlockNode(node.id);
                          }}
                          className="font-mono-num shrink-0 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold text-[#111114] hover:bg-white disabled:bg-[#2a2a30] disabled:text-[#636369]"
                        >
                          {node.cost} SP
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsSection({ save }: { save: HeroSave }) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const report = computeAnalytics(save, period);

  const heatColors = ['#141417', '#1f362a', '#245e40', '#2b8a58', '#30d158'];

  return (
    <div className="space-y-4">
      {/* Period Switch */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8e8e93]">Consistency, XP gains, and habit performance.</p>
        <div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-[#18181b] p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`min-h-[32px] rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                period === p
                  ? 'bg-[#f5f5f7] text-[#111114]'
                  : 'text-[#8e8e93] hover:text-[#f5f5f7]'
              }`}
            >
              {p === 'week' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <p className="text-xs text-[#8e8e93]">Success Rate</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#30d158]">
            {report.successRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <p className="text-xs text-[#8e8e93]">XP Earned</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#60a5fa]">
            +{report.xpEarned}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <p className="text-xs text-[#8e8e93]">Tasks Completed</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#eab949]">
            {report.totalCompleted}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <p className="text-xs text-[#8e8e93]">HP Lost</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#ff453a]">
            {report.hpLost}
          </p>
        </div>
      </div>

      {/* Habit Heatmap (Last 35 Days) */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f5f5f7]">35-Day Activity Heatmap</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e93]">
            <span>Less</span>
            {heatColors.map((c) => (
              <span
                key={c}
                className="inline-block h-3 w-3 rounded-[3px]"
                style={{ backgroundColor: c }}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {report.heatmap.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date}: ${cell.count} actions`}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border border-white/[0.04] text-[10px]"
              style={{ backgroundColor: heatColors[cell.level] }}
            >
              <span className="font-mono-num text-[#d4d4d8]/80">{cell.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest & Weakest Habits */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#30d158]" />
            <h3 className="text-sm font-semibold text-[#f5f5f7]">Strongest Habits</h3>
          </div>
          {report.strongestHabits.length > 0 ? (
            <div className="space-y-2">
              {report.strongestHabits.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-[#202024] px-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#f5f5f7]">{h.title}</p>
                    <p className="text-[#8e8e93]">Streak: {h.streak} days</p>
                  </div>
                  <span className="font-mono-num shrink-0 font-bold text-[#30d158]">{h.rate}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8e8e93]">Add habits to start tracking strengths.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#fb923c]" />
            <h3 className="text-sm font-semibold text-[#f5f5f7]">Needs Attention</h3>
          </div>
          {report.weakestHabits.length > 0 ? (
            <div className="space-y-2">
              {report.weakestHabits.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-[#202024] px-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#f5f5f7]">{h.title}</p>
                    <p className="text-[#8e8e93]">Slips: {h.slips}</p>
                  </div>
                  <span className="font-mono-num shrink-0 font-bold text-[#fb923c]">{h.rate}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8e8e93]">No habit data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WeeklyReviewSection({
  save,
  onEvaluateBoss,
  onSaveReview,
}: {
  save: HeroSave;
  onEvaluateBoss: () => void;
  onSaveReview: (goals: string[]) => void;
}) {
  const summary = getWeeklyReviewSummary(save);
  const [g1, setG1] = useState(summary.currentGoals[0] || '');
  const [g2, setG2] = useState(summary.currentGoals[1] || '');
  const [g3, setG3] = useState(summary.currentGoals[2] || '');

  const bossTemplate = WEEKLY_BOSSES[save.weeklyBoss.bossIndex % WEEKLY_BOSSES.length];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveReview([g1, g2, g3]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#8e8e93]">Sunday Reflection · {summary.weekKey}</p>
            <h2 className="text-xl font-bold text-[#f5f5f7]">Weekly Review</h2>
          </div>
          {summary.alreadyReviewed && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#30d158]">
              <Award className="h-4 w-4" />
              Reviewed This Week
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-[#202024] p-3">
            <p className="text-[11px] text-[#8e8e93]">Quests Done</p>
            <p className="font-mono-num mt-1 text-xl font-bold text-[#eab949]">{summary.questsDone}</p>
          </div>
          <div className="rounded-xl bg-[#202024] p-3">
            <p className="text-[11px] text-[#8e8e93]">Success Rate</p>
            <p className="font-mono-num mt-1 text-xl font-bold text-[#30d158]">{summary.successRate}%</p>
          </div>
          <div className="rounded-xl bg-[#202024] p-3">
            <p className="text-[11px] text-[#8e8e93]">HP Lost</p>
            <p className="font-mono-num mt-1 text-xl font-bold text-[#ff453a]">{summary.hpLost}</p>
          </div>
          <div className="rounded-xl bg-[#202024] p-3">
            <p className="text-[11px] text-[#8e8e93]">Boss DMG</p>
            <p className="font-mono-num mt-1 text-xl font-bold text-[#fb923c]">{summary.bossDmg}</p>
          </div>
        </div>

        {summary.bossNeedsEvaluation && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#fb923c]/30 bg-[#231d19] p-3.5">
            <div className="flex items-center gap-2.5 text-xs">
              <Flame className="h-4 w-4 shrink-0 text-[#fb923c]" />
              <span className="text-[#ffe8d6]">
                <strong>{bossTemplate.name}</strong> is ready for weekly evaluation!
              </span>
            </div>
            <button
              type="button"
              onClick={onEvaluateBoss}
              className="min-h-[38px] rounded-full bg-[#fb923c] px-4 py-1.5 text-xs font-semibold text-[#1a0d05] hover:bg-[#fda85c]"
            >
              Claim Boss Reward
            </button>
          </div>
        )}
      </div>

      {/* Top 3 Next-Week Goals */}
      <form onSubmit={handleSubmit} className="space-y-3.5 rounded-2xl border border-white/[0.07] bg-[#18181b] p-5">
        <div>
          <h3 className="text-base font-semibold text-[#f5f5f7]">Top 3 Goals for Next Week</h3>
          <p className="mt-0.5 text-xs text-[#8e8e93]">
            Set your 3 highest priorities. First review each week awards +35 XP &amp; +25 Gold.
          </p>
        </div>

        <div className="space-y-2.5">
          <input
            type="text"
            maxLength={80}
            value={g1}
            onChange={(e) => setG1(e.target.value)}
            placeholder="1. Primary goal..."
            className="min-h-[44px] w-full rounded-xl border border-white/[0.08] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
          <input
            type="text"
            maxLength={80}
            value={g2}
            onChange={(e) => setG2(e.target.value)}
            placeholder="2. Secondary habit or project goal..."
            className="min-h-[44px] w-full rounded-xl border border-white/[0.08] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
          <input
            type="text"
            maxLength={80}
            value={g3}
            onChange={(e) => setG3(e.target.value)}
            placeholder="3. Health or mindfulness goal..."
            className="min-h-[44px] w-full rounded-xl border border-white/[0.08] bg-[#111114] px-3.5 py-2 text-sm text-[#f5f5f7] focus:border-white/30 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="min-h-[44px] w-full rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-semibold text-[#111114] hover:bg-white"
        >
          {summary.alreadyReviewed ? 'Update Weekly Goals' : 'Complete Weekly Review (+35 XP · +25 Gold)'}
        </button>
      </form>

      {save.weeklyReview.pastReviews.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#18181b] p-4">
          <h3 className="mb-2.5 text-sm font-semibold text-[#f5f5f7]">Past Weekly Reviews</h3>
          <div className="divide-y divide-white/[0.06]">
            {save.weeklyReview.pastReviews.slice(0, 5).map((r) => (
              <div key={r.weekKey} className="py-2.5 text-xs">
                <div className="flex justify-between font-semibold text-[#f5f5f7]">
                  <span>{r.weekKey}</span>
                  <span className="font-mono-num text-[#8e8e93]">
                    {r.questsDone} quests · {r.bossDmg} Boss DMG
                  </span>
                </div>
                {r.goals.length > 0 && (
                  <p className="mt-1 text-[#8e8e93]">{r.goals.join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
