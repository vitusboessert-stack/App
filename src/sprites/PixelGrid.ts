export const SPRITE_INK = '#14101c';

export function shadeHex(hex: string, factor: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function mixHex(hexA: string, hexB: string, t: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hexA) || !/^#[0-9a-fA-F]{6}$/.test(hexB)) return hexA;
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class PixelGrid {
  readonly w: number;
  readonly h: number;
  readonly pixels: (string | null)[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.pixels = new Array<string | null>(w * h).fill(null);
  }

  get(x: number, y: number): string | null {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (rx < 0 || rx >= this.w || ry < 0 || ry >= this.h) return null;
    return this.pixels[ry * this.w + rx];
  }

  set(x: number, y: number, color: string | null): void {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (rx >= 0 && rx < this.w && ry >= 0 && ry < this.h) {
      this.pixels[ry * this.w + rx] = color;
    }
  }

  box(x: number, y: number, w: number, h: number, color: string): void {
    for (let j = Math.round(y); j < Math.round(y + h); j++) {
      for (let i = Math.round(x); i < Math.round(x + w); i++) {
        this.set(i, j, color);
      }
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, color: string): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) {
          this.set(x, y, color);
        }
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, thickness = 1): void {
    let cx = Math.round(x1);
    let cy = Math.round(y1);
    const tx = Math.round(x2);
    const ty = Math.round(y2);
    const dx = Math.abs(tx - cx);
    const dy = -Math.abs(ty - cy);
    const sx = cx < tx ? 1 : -1;
    const sy = cy < ty ? 1 : -1;
    let err = dx + dy;
    while (true) {
      this.box(cx, cy, thickness, thickness, color);
      if (cx === tx && cy === ty) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        cx += sx;
      }
      if (e2 <= dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  poly(points: [number, number][], color: string): void {
    const ys = points.map((p) => p[1]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y++) {
      const intersections: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y + 0.5 && y2 > y + 0.5) || (y2 <= y + 0.5 && y1 > y + 0.5)) {
          intersections.push(x1 + ((y + 0.5 - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      intersections.sort((a, b) => a - b);
      for (let j = 0; j < intersections.length - 1; j += 2) {
        for (let x = Math.ceil(intersections[j]); x < intersections[j + 1]; x++) {
          this.set(x, y, color);
        }
      }
    }
  }

  /**
   * Adds a crisp 1px 4-connected Terraria-style outline around all opaque pixels.
   */
  applyOutline(outlineColor = SPRITE_INK): void {
    const toOutline: [number, number][] = [];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y) !== null) continue;
        for (const [dx, dy] of dirs) {
          const neighbor = this.get(x + dx, y + dy);
          if (neighbor !== null && neighbor !== outlineColor) {
            toOutline.push([x, y]);
            break;
          }
        }
      }
    }
    for (const [x, y] of toOutline) {
      this.set(x, y, outlineColor);
    }
  }

  /**
   * Composites another PixelGrid on top of this one.
   */
  blit(src: PixelGrid, offsetX = 0, offsetY = 0): void {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.get(x, y);
        if (c !== null) {
          this.set(x + offsetX, y + offsetY, c);
        }
      }
    }
  }

  /**
   * Run-length-encoded SVG <rect> string for crisp, lightweight pixel rendering.
   */
  toSvgRects(): string {
    const parts: string[] = [];
    for (let y = 0; y < this.h; y++) {
      let x = 0;
      while (x < this.w) {
        const color = this.pixels[y * this.w + x];
        if (!color) {
          x++;
          continue;
        }
        let end = x + 1;
        while (end < this.w && this.pixels[y * this.w + end] === color) {
          end++;
        }
        parts.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${color}"/>`);
        x = end;
      }
    }
    return parts.join('');
  }
}
