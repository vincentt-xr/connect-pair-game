import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { appendPaintPoint, makePaintPath } from "./connectionPath";
import type { BoardPoint, PairTokenData } from "./gameData";
import { canConnect, connectionCrossesExisting, findTokenAtPoint } from "./gameRules";
import type { Connection } from "./gameRules";
import { PairToken } from "./PairToken";

type ActivePath = { from: PairTokenData; points: BoardPoint[] };

// Pointer capture improves mouse/touch drags that leave the card. Some embedded
// browsers reject capture when an event has already been cancelled, so it must
// never be allowed to take down the game itself.
const safelyCapturePointer = (element: HTMLDivElement, pointerId: number) => {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // The board still receives in-bounds events and remains playable.
  }
};

const safelyReleasePointer = (element: HTMLDivElement, pointerId: number) => {
  try {
    if (element.hasPointerCapture?.(pointerId)) element.releasePointerCapture?.(pointerId);
  } catch {
    // Capture may have been released by the browser during the pointer-up.
  }
};

const pointFromEvent = (event: PointerEvent<HTMLDivElement>): BoardPoint => {
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
};

export const GameBoard = ({ tokens, connections, nosePoint, onConnect, onLoss }: { tokens: readonly PairTokenData[]; connections: readonly Connection[]; nosePoint: BoardPoint | null; onConnect: (connection: Connection) => void; onLoss: () => void }) => {
  const boardRef = useRef<HTMLDivElement>(null); const errorTimer = useRef<number | undefined>(); const hoverTimer = useRef<number | undefined>(); const hoveredId = useRef<string>();
  const [active, setActive] = useState<ActivePath | null>(null); const [errorPath, setErrorPath] = useState<ActivePath | null>(null);
  const completedPairIds = useMemo(() => new Set(connections.map((connection) => connection.pairId)), [connections]);
  const clearErrorSoon = (path: ActivePath) => { window.clearTimeout(errorTimer.current); setErrorPath(path); errorTimer.current = window.setTimeout(onLoss, 300); };
  const finishStroke = (path: ActivePath, point: BoardPoint) => {
    const target = findTokenAtPoint(point, tokens, completedPairIds); const points = appendPaintPoint(path.points, point, 0);
    const candidate = target ? { fromId: path.from.id, toId: target.id, pairId: path.from.pairId, color: path.from.color, points: appendPaintPoint(points, target, 0) } : undefined;
    const valid = candidate && canConnect(path.from, target) && !connectionCrossesExisting(candidate, connections);
    if (valid) onConnect(candidate); else clearErrorSoon({ ...path, points }); setActive(null);
  };
  useEffect(() => {
    if (!nosePoint) { window.clearTimeout(hoverTimer.current); if (active) clearErrorSoon(active); hoveredId.current = undefined; return undefined; }
    if (active) {
      window.clearTimeout(hoverTimer.current); hoveredId.current = undefined;
      const target = findTokenAtPoint(nosePoint, tokens, completedPairIds);
      if (target && target.id !== active.from.id) finishStroke(active, nosePoint);
      else setActive((current) => {
        if (!current) return current;
        const points = appendPaintPoint(current.points, nosePoint);
        return points === current.points ? current : { ...current, points };
      });
      return undefined;
    }
    const token = findTokenAtPoint(nosePoint, tokens, completedPairIds);
    if (!token) { window.clearTimeout(hoverTimer.current); hoveredId.current = undefined; return undefined; }
    if (hoveredId.current !== token.id) { window.clearTimeout(hoverTimer.current); hoveredId.current = token.id; hoverTimer.current = window.setTimeout(() => setActive({ from: token, points: [token] }), 2000); }
    return undefined;
    // The helpers are rebuilt every render and completedPairIds follows connections; listing them would re-run the nose step on unrelated renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nosePoint, active, tokens, connections]);
  useEffect(() => () => { window.clearTimeout(errorTimer.current); window.clearTimeout(hoverTimer.current); }, []);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event); const token = findTokenAtPoint(point, tokens, completedPairIds);
    if (!token) return;
    safelyCapturePointer(event.currentTarget, event.pointerId); setActive({ from: token, points: [token] });
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // React only guarantees currentTarget while this handler is running. Read
    // the geometry now, before the state updater is scheduled.
    const point = pointFromEvent(event);
    if (active) setActive((current) => current && { ...current, points: appendPaintPoint(current.points, point) });
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!active) return;
    const point = pointFromEvent(event); finishStroke(active, point);
    if (boardRef.current) safelyReleasePointer(boardRef.current, event.pointerId);
  };
  return <div ref={boardRef} className="game-board" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => setActive(null)}>
    <svg aria-hidden="true" className="game-board__paths" preserveAspectRatio="none" viewBox="0 0 100 100">
      {connections.map((connection) => <path key={connection.pairId} d={makePaintPath(connection.points)} stroke={connection.color} />)}
      {active && <path d={makePaintPath(active.points)} className="game-path--preview" stroke={active.from.color} />}
      {errorPath && <path d={makePaintPath(errorPath.points)} className="game-path--error" />}
    </svg>
    {nosePoint && <span aria-hidden="true" className={`nose-cursor${active ? " nose-cursor--dragging" : ""}`} style={{ left: `${nosePoint.x}%`, top: `${nosePoint.y}%` }} />}
    {tokens.map((token) => <PairToken key={token.id} token={token} completed={completedPairIds.has(token.pairId)} />)}
  </div>;
};
