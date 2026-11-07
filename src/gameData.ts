export type BoardPoint = { x: number; y: number };

export type PairTokenData = BoardPoint & {
  id: string;
  pairId: string;
  color: string;
  label: string;
  ordinal: 1 | 2;
  shape: TokenShape;
};

export const TOKEN_SHAPES = ["bear", "circle", "triangle", "square", "diamond", "hexagon"] as const;
export type TokenShape = (typeof TOKEN_SHAPES)[number];

export type GameLevel = { id: string; tokens: readonly PairTokenData[] };
const palette = [["#ff3e5f", "Coral"], ["#ffc72c", "Gold"], ["#1f9eff", "Blue"], ["#9d63ff", "Violet"], ["#40d989", "Mint"], ["#ff8b35", "Orange"], ["#f45cd5", "Pink"]] as const;
// mulberry32: a seeded PRNG so every level lays out the same way each time; bit operations are the algorithm.
/* eslint-disable no-bitwise */
const rng = (seed: number) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let n = state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
};
/* eslint-enable no-bitwise */

export const createLevel = (levelNumber: number): GameLevel => {
  const pairCount = Math.min(7, 3 + Math.floor((levelNumber - 1) / 3)); const next = rng(levelNumber * 7919); const positions: BoardPoint[] = [];
  const place = () => { for (let attempt = 0; attempt < 500; attempt += 1) { const point = { x: 10 + next() * 80, y: 10 + next() * 80 }; if (positions.every((item) => Math.hypot(point.x - item.x, point.y - item.y) >= 14)) { positions.push(point); return point; } } const i = positions.length; const point = { x: 12 + (i % 4) * 25, y: 15 + Math.floor(i / 4) * 24 }; positions.push(point); return point; };
  return { id: `level-${levelNumber}`, tokens: Array.from({ length: pairCount }, (_, index) => { const [color, name] = palette[(levelNumber + index - 1) % palette.length]; const shape = TOKEN_SHAPES[(levelNumber + index - 1) % TOKEN_SHAPES.length]; const pairId = `level-${levelNumber}-pair-${index}`; return [1, 2].map((ordinal) => ({ id: `${pairId}-${ordinal}`, pairId, color, label: `${name} ${shape}`, ordinal: ordinal as 1 | 2, shape, ...place() })); }).flat() };
};
