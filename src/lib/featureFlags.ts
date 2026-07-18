// Flip this back to false (and redeploy) to bring the public feed back online.
// This is the ONLY place maintenance mode is controlled — every gated route/component
// must import MAINTENANCE_MODE from here, nothing should hardcode its own check.
export const MAINTENANCE_MODE = true;
