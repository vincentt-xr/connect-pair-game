# Connect Pairs remix guide

## What this template is

This is a full-bleed, endless connect-the-pairs micro-game for a Vincentt XR
scene. The live camera remains behind the game. Game UI is ordinary HTML and SVG,
mounted inside the R3F canvas with Drei's `<Html fullscreen>`; tokens and paths
are not face-anchored AR objects.

Players can paint with a mouse or touch. When face tracking is available, the
nose tip is also a cursor: dwell on a token for two seconds to begin painting,
then move onto a different token to release the stroke. A successful board
quietly advances to the next generated level with a confetti burst. An invalid
stroke flashes red, clears the board, and retries the same layout.

## Runtime map

```text
App.tsx (protected XR shell)
  └─ Scene.tsx                 R3F composition only
       └─ Game.tsx             game session + face tracking + level loop
            └─ <Html fullscreen>
                 └─ GameBoard.tsx
                      ├─ SVG painted paths
                      ├─ pointer fallback input
                      ├─ nose dwell input
                      └─ PairToken.tsx
```

| Module | Owns | Do not put here |
| --- | --- | --- |
| `Scene.tsx` | Rendering `<Game />` from the R3F scene | State, pointer math, game rules, styles |
| `Game.tsx` | Level number, completed connections, board retries, level advance, face landmark to percentage-point conversion, celebration trigger | SVG drawing, hit testing, placement rules |
| `GameBoard.tsx` | Input events, active/error paint state, SVG path rendering, calling shared rules | Level generation, session progression, confetti |
| `gameData.ts` | Token/level types, shapes, deterministic level generator | React, DOM, SVG |
| `gameRules.ts` | Hit testing, pair validation, path-crossing validation | React, DOM, timers |
| `connectionPath.ts` | Sampling freehand points and converting them to a smooth SVG path | Gameplay validation, React |
| `PairToken.tsx` | Accessible endpoint markup | Game state or level generation |
| `game.css` | Full-screen layout, token appearances, cursor, paint feedback | Behaviour or game state |
| `celebration.ts` | Confetti implementation | Level/session state |

## Required modularization rule

Keep responsibilities separated by domain. A component may call a pure helper,
but it must not copy that helper's logic.

- Keep `Scene.tsx` as a composition boundary only.
- Keep level data and procedural placement in `gameData.ts`.
- Keep matching, hit-area, and collision policy in `gameRules.ts`.
- Keep raw path sampling and SVG path creation in `connectionPath.ts`.
- Keep the outer game loop in `Game.tsx`: it decides what a win or loss means.
- Keep the board as an interaction/rendering adapter. It reports `onConnect` or
  `onLoss`; it does not advance or regenerate a level itself.
- When an input mode becomes non-trivial, extract it before adding unrelated
  behaviour to `GameBoard.tsx`. For example, use `usePointerPaintInput.ts` and
  `useNosePaintInput.ts` rather than adding gesture recognition into the board.
- Split a module at its domain boundary once it begins to own two independent
  concerns or grows beyond roughly 200 lines.

`App.tsx`, `main.tsx`, the media/XR shell, and build configuration belong to the
Vincentt template. Preserve them when remixing this game.

## Game state and event contract

`Game.tsx` is the owner of persistent round state.

```text
createLevel(levelNumber)
       │
       ▼
GameBoard receives tokens + confirmed connections
       │
       ├─ valid matching, non-crossing stroke ──► onConnect(connection)
       │                                         └─ Game appends it
       │
       └─ invalid stroke ───────────────────────► onLoss()
                                                 └─ clear connections + retry board

all pairs connected ──► confetti ──► 350 ms ──► levelNumber + 1
```

The board is remounted with a key after a loss so its local `active`, error, and
dwell state are discarded. Keep that behaviour if a new input method has local
gesture state.

## Input behaviour

### Mouse and touch fallback

1. Pointer-down must occur in an unfinished token hit area.
2. The board captures the pointer and records freehand points as it moves.
3. Pointer-up checks the release point against a token.
4. Only the matching opposite token is accepted, and its path must not intersect
   a confirmed path.

### Nose cursor

1. `Game` turns the normalized nose-tip landmark into board percentages.
2. While idle, hovering the same unfinished token for two seconds starts a paint
   stroke.
3. While painting, the nose position adds freehand points.
4. Entering any other token releases the stroke immediately. The same shared
   validation determines whether it connects or loses.
5. If tracking disappears during a stroke, the board treats it as a failed
   stroke rather than leaving a stuck active path.

The circular `.nose-cursor` is visual feedback only; it must use
`pointer-events: none` so pointer controls remain available.

## Remix recipes

### Change difficulty or layout

Edit `createLevel` in `gameData.ts`.

- Change pair growth with `pairCount`.
- Change safe edges in the placement expression (`10 + next() * 80`).
- Change minimum separation in the placement distance test (`>= 14`).
- Preserve deterministic seeding unless you intentionally want a new board every
  retry. Determinism is what makes a failed level restart with the same layout.

Update `gameData.test.ts` when changing those rules.

### Add or replace token shapes

1. Add a value to `TOKEN_SHAPES` in `gameData.ts`.
2. Add its CSS selector in `game.css` under `.pair-token__bear--<shape>`.
3. Keep the token's `shape` data-driven; do not branch in `GameBoard.tsx`.

The existing shapes are `bear`, `circle`, `triangle`, `square`, `diamond`, and
`hexagon`.

### Change the paint feel

Use `connectionPath.ts`.

- Lower `minimumDistance` in `appendPaintPoint` for denser strokes.
- Change `makePaintPath` to alter smoothing without changing game validation.
- Change stroke width, dash treatment, and error feedback only in `game.css`.

Do not return to a start-to-end line: a connection stores the full freehand
point list so both appearance and intersection rules describe the path the
player actually drew.

### Change hit accuracy

Use `findTokenAtPoint` in `gameRules.ts`. Its radius is in board percentage
units and is deliberately tight (`4.5`) so the nose cursor cannot finish a pair
from an invisible halo. Update rule tests for any new threshold.

### Add a new input method

Keep the board event contract unchanged: an adapter needs to produce an origin,
sampled board points, and one final board point. It should call the same
`finishStroke` path so pair matching and crossing checks stay identical.

For a substantial new control, first extract the two existing systems into hooks:

```text
usePointerPaintInput → start / append / finish / cancel
useNosePaintInput    → start / append / finish / cancel
GameBoard            → renders paths + tokens and coordinates the hooks
```

Do not put tracker SDK calls in `gameRules.ts`, `gameData.ts`, or
`connectionPath.ts`.

### Change win or loss treatment

Change the policy in `Game.tsx`, not the board.

- Win delay, level advance, scores, lives, and persistence belong in `Game`.
- Confetti configuration belongs in `celebration.ts`.
- Error paint duration belongs in `GameBoard.tsx` because it is transient visual
  input feedback.

## Tests that protect the template

| Test file | Protects |
| --- | --- |
| `gameData.test.ts` | Deterministic boards, pair-count progression, spacing, shape pairing |
| `gameRules.test.ts` | Matches/mismatches, self-drops, hit range, completed tokens, crossings |
| `Game.test.tsx` | Painted points, win advance, invalid-stroke retry |

Run before handing a remix to another agent:

```sh
pnpm typecheck
pnpm test
pnpm build
```

For XR input, also verify on a phone with `pnpm preview`: the camera should stay
visible, the board must fill only the XR canvas, nose cursor coordinates should
match the camera view, and mouse/touch fallback must still work when no face is
tracked.
