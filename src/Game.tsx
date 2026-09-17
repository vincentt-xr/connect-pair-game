import { useEffect, useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { FACE_LANDMARK_INDICES, useFaceInfo } from "@vincentt-xr/sdk/tracking";
import { GameBoard } from "./GameBoard";
import { createLevel } from "./gameData";
import type { Connection } from "./gameRules";
import { celebrateLevelWin } from "./celebration";
import "./game.css";

export const Game = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [levelNumber, setLevelNumber] = useState(1);
  const [round, setRound] = useState(0);
  const face = useFaceInfo({ active: true, targetFps: 30 });
  const nose = face?.landmarks[FACE_LANDMARK_INDICES["face.noseTip"]];
  const nosePoint = nose ? { x: nose.x * 100, y: nose.y * 100 } : null;
  const level = useMemo(() => createLevel(levelNumber), [levelNumber]);
  const totalPairs = level.tokens.length / 2;
  const resetRound = () => { setConnections([]); setRound((current) => current + 1); };
  const connect = (connection: Connection) =>
    setConnections((current) => current.some((item) => item.pairId === connection.pairId) ? current : [...current, connection]);
  useEffect(() => {
    if (connections.length !== totalPairs) return undefined;
    celebrateLevelWin();
    const timer = window.setTimeout(() => { setConnections([]); setLevelNumber((current) => current + 1); }, 350);
    return () => window.clearTimeout(timer);
  }, [connections.length, totalPairs]);
  return (
    <Html fullscreen style={{ pointerEvents: "auto" }}>
      <main className="connect-pairs-game">
        <GameBoard key={`${level.id}-${round}`} tokens={level.tokens} connections={connections} nosePoint={nosePoint} onConnect={connect} onLoss={resetRound} />
      </main>
    </Html>
  );
};
