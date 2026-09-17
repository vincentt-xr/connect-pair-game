import type { BoardPoint } from "./gameData";

export const appendPaintPoint = (points: readonly BoardPoint[], point: BoardPoint, minimumDistance = 0.45) => {
  const last = points[points.length - 1];
  if (last && Math.hypot(point.x - last.x, point.y - last.y) < minimumDistance) return points as BoardPoint[];
  return [...points, point];
};

// Midpoint quadratics soften a raw pointer polyline without replacing it with
// a synthetic start-to-end connection curve.
export const makePaintPath = (points: readonly BoardPoint[]) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const middle = points.slice(1, -1).map((point, index) => {
    const next = points[index + 2];
    return `Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
  });
  const last = points[points.length - 1];
  return [`M ${points[0].x} ${points[0].y}`, ...middle, `L ${last.x} ${last.y}`].join(" ");
};
