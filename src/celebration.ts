import { confetti } from "@tsparticles/confetti";

// Two low, angled bursts feel physical without obscuring the next board.
export const celebrateLevelWin = () => {
  const options = {
    count: 65,
    colors: ["#ff3e5f", "#ffc72c", "#1f9eff", "#9d63ff", "#40d989"],
    decay: 0.92,
    gravity: 1.15,
    scalar: 0.9,
    shapes: ["square", "circle"],
    spread: 62,
    startVelocity: 52,
    ticks: 180,
    zIndex: 1000,
  };
  void Promise.all([
    confetti({ ...options, angle: 60, position: { x: 18, y: 78 } }),
    confetti({ ...options, angle: 120, position: { x: 82, y: 78 } }),
  ]).catch(() => {});
};
