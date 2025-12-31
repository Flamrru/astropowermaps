// Reveal flow components
export { default as RevealShell } from "./RevealShell";
export { default as SlideUpPanel, ActionPanel } from "./SlideUpPanel";

// Re-export state management
export {
  RevealContext,
  useReveal,
  revealReducer,
  initialRevealState,
  getMapOpacity,
} from "@/lib/reveal-state";

// Re-export types (all come through reveal-state which re-exports canonical types)
export type {
  RevealState,
  RevealAction,
  BirthData,
  BirthLocation,
  MapHighlight,
  AstrocartographyResult,
  YearForecast,
  MonthForecast,
} from "@/lib/reveal-state";
