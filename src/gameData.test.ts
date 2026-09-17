import { describe, expect, it } from "vitest";
import { createLevel } from "./gameData";
describe("createLevel", () => {
  it("is deterministic and grows from three pairs to a maximum of seven", () => { expect(createLevel(1)).toEqual(createLevel(1)); expect(createLevel(1).tokens).toHaveLength(6); expect(createLevel(4).tokens).toHaveLength(8); expect(createLevel(99).tokens).toHaveLength(14); });
  it("keeps generated tokens safely separated", () => { const tokens = createLevel(99).tokens; tokens.forEach((token, index) => tokens.slice(index + 1).forEach((other) => expect(Math.hypot(token.x - other.x, token.y - other.y)).toBeGreaterThanOrEqual(14))); });
  it("gives both tokens in each pair the same shape from the shape array", () => { const tokens = createLevel(8).tokens; tokens.forEach((token) => expect(["bear", "circle", "triangle", "square", "diamond", "hexagon"]).toContain(token.shape)); expect(tokens[0].shape).toBe(tokens[1].shape); });
});
