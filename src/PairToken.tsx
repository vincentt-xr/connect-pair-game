import type { CSSProperties } from "react";
import type { PairTokenData } from "./gameData";

export const PairToken = ({ token, completed }: { token: PairTokenData; completed: boolean }) => (
  <button
    aria-label={`${token.label} ${token.ordinal}`}
    aria-pressed={completed}
    className={`pair-token${completed ? " pair-token--completed" : ""}`}
    disabled={completed}
    style={{ "--token-color": token.color, left: `${token.x}%`, top: `${token.y}%` } as CSSProperties}
    type="button"
  >
    <span aria-hidden="true" className={`pair-token__bear pair-token__bear--${token.shape}`} />
    <span className="sr-only">{completed ? "Connected" : "Draw a line from this token"}</span>
  </button>
);
