import type { BoardPoint, PairTokenData } from "./gameData";

export type Connection = { fromId: string; toId: string; pairId: string; color: string; points: BoardPoint[] };

const orientation = (a: BoardPoint, b: BoardPoint, c: BoardPoint) =>
  (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
const onSegment = (a: BoardPoint, b: BoardPoint, c: BoardPoint) =>
  Math.min(a.x, c.x) <= b.x && b.x <= Math.max(a.x, c.x) && Math.min(a.y, c.y) <= b.y && b.y <= Math.max(a.y, c.y);

export const segmentsIntersect = (a: BoardPoint, b: BoardPoint, c: BoardPoint, d: BoardPoint) => {
  const abC = orientation(a, b, c); const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a); const cdB = orientation(c, d, b);
  if (abC === 0 && onSegment(a, c, b)) return true;
  if (abD === 0 && onSegment(a, d, b)) return true;
  if (cdA === 0 && onSegment(c, a, d)) return true;
  if (cdB === 0 && onSegment(c, b, d)) return true;
  return (abC > 0) !== (abD > 0) && (cdA > 0) !== (cdB > 0);
};

// The visible token is roughly 4% of the short board axis. Keep interaction
// equally tight so a nose cursor cannot complete a pair from an invisible halo.
export const findTokenAtPoint = (point: BoardPoint, tokens: readonly PairTokenData[], completedPairIds: ReadonlySet<string>, radius = 4.5) =>
  tokens.find((token) => !completedPairIds.has(token.pairId) && Math.hypot(point.x - token.x, point.y - token.y) <= radius);

export const canConnect = (from: PairTokenData, to: PairTokenData | undefined) =>
  Boolean(to) && from.id !== to?.id && from.pairId === to?.pairId;

const pathSegments = (points: readonly BoardPoint[]) => points.slice(1).map((point, index) => [points[index], point] as const);

export const connectionCrossesExisting = (candidate: Connection, connections: readonly Connection[]) =>
  pathSegments(candidate.points).some(([from, to]) =>
    connections.some((connection) => pathSegments(connection.points).some(([existingFrom, existingTo]) =>
      segmentsIntersect(from, to, existingFrom, existingTo))));
