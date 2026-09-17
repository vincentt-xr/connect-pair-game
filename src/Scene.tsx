// Scene.tsx — the agent's surface.
// Add SDK components and R3F primitives here.
// See GROUNDING.md for the API reference and pattern catalog.
//
// react/no-unknown-property is disabled for this file in .eslintrc.json, not by
// a directive here: R3F props (position, rotation, args) are unknown to the rule
// and every one of them errors, but this file is EMPTY of primitives until an
// agent adds some — so an in-file directive sits unused, and the lint script
// runs --report-unused-disable-directives, which makes the unused directive
// itself the error. Disabling at the config keeps the suppression true in both
// states.
import { Game } from "./Game";

// The game is intentionally DOM-first: Game bridges through drei's <Html>
// while this scene remains the small R3F composition boundary.
export const Scene = () => <Game />;
