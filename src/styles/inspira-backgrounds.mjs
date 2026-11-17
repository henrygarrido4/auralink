// Tailwind v4 `@plugin` needs a module whose default export is a plugin.
// @inspira-ui/plugins exports named plugins, so this file re-exports the one we use.
// `addVariablesForColors` is intentionally skipped: Tailwind v4 already exposes
// every theme color as a CSS variable (--color-*).
import { addBackgrounds } from '@inspira-ui/plugins';

export default addBackgrounds;
