import { describe, expect, it } from "vitest";
import type { PairTokenData } from "./gameData";
import { canConnect, connectionCrossesExisting, findTokenAtPoint, segmentsIntersect } from "./gameRules";
import type { Connection } from "./gameRules";

const tokens: PairTokenData[] = [
  { id: "a1", pairId: "a", color: "red", label: "A", shape: "circle", ordinal: 1, x: 10, y: 10 }, { id: "a2", pairId: "a", color: "red", label: "A", shape: "circle", ordinal: 2, x: 90, y: 90 },
  { id: "b1", pairId: "b", color: "blue", label: "B", shape: "triangle", ordinal: 1, x: 90, y: 10 }, { id: "b2", pairId: "b", color: "blue", label: "B", shape: "triangle", ordinal: 2, x: 10, y: 90 },
];

describe("game rules", () => {
  it("finds only unfinished tokens inside their hit radius", () => {
    expect(findTokenAtPoint({ x: 13, y: 10 }, tokens, new Set())).toMatchObject({ id: "a1" });
    expect(findTokenAtPoint({ x: 40, y: 40 }, tokens, new Set())).toBeUndefined();
    expect(findTokenAtPoint({ x: 10, y: 10 }, tokens, new Set(["a"]))).toBeUndefined();
  });
  it("accepts pairs but rejects a mismatch and self-drop", () => {
    expect(canConnect(tokens[0], tokens[1])).toBe(true); expect(canConnect(tokens[0], tokens[2])).toBe(false); expect(canConnect(tokens[0], tokens[0])).toBe(false);
  });
  it("detects crossing connection segments", () => {
    expect(segmentsIntersect(tokens[0], tokens[1], tokens[2], tokens[3])).toBe(true);
    const existing: Connection = { fromId: "a1", toId: "a2", pairId: "a", color: "red", points: [tokens[0], tokens[1]] };
    const candidate: Connection = { fromId: "b1", toId: "b2", pairId: "b", color: "blue", points: [tokens[2], tokens[3]] };
    expect(connectionCrossesExisting(candidate, [existing])).toBe(true);
  });
});
