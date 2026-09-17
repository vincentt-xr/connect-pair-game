import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Game } from "./Game";
import { createLevel } from "./gameData";
vi.mock("@react-three/drei", () => ({ Html: ({ children }: { children: ReactNode }) => children }));
vi.mock("@vincentt-xr/sdk/tracking", () => ({ FACE_LANDMARK_INDICES: { "face.noseTip": 1 }, useFaceInfo: () => null }));
vi.mock("./celebration", () => ({ celebrateLevelWin: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
const setBoardRect = () => vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ bottom: 100, height: 100, left: 0, right: 100, toJSON: () => ({}), top: 0, width: 100, x: 0, y: 0 });
const draw = (board: HTMLDivElement, type: "pointerdown" | "pointerup", x: number, y: number) => fireEvent(board, new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
describe("Game", () => {
  it("automatically advances after the last pair", () => {
    vi.useFakeTimers(); setBoardRect(); const { container } = render(<Game />); const board = container.querySelector(".game-board") as HTMLDivElement; const level = createLevel(1);
    for (let i = 0; i < level.tokens.length; i += 2) { draw(board, "pointerdown", level.tokens[i].x, level.tokens[i].y); draw(board, "pointerup", level.tokens[i + 1].x, level.tokens[i + 1].y); }
    act(() => vi.advanceTimersByTime(350)); expect(screen.getByRole("button", { name: `${createLevel(2).tokens[0].label} 1` })).toBeTruthy();
  });
  it("restarts the same board after an invalid stroke", () => {
    vi.useFakeTimers(); setBoardRect(); const { container } = render(<Game />); const board = container.querySelector(".game-board") as HTMLDivElement; const level = createLevel(1);
    draw(board, "pointerdown", level.tokens[0].x, level.tokens[0].y); draw(board, "pointerup", level.tokens[2].x, level.tokens[2].y); act(() => vi.advanceTimersByTime(300));
    expect(container.querySelectorAll(".game-board__paths path")).toHaveLength(0); expect(screen.getByRole("button", { name: `${level.tokens[0].label} 1` }) as HTMLButtonElement).toHaveProperty("disabled", false);
  });
});
