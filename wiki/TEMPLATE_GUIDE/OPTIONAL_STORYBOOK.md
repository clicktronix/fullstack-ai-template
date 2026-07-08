# Optional Storybook Setup

Storybook is included in the template as a UI workshop and visual reference for the demo slice.

## What is already wired

- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `bun run storybook`
- `bun run build-storybook`

The preview already includes:

- `MantineProvider`
- theme switching
- `IntlProvider` with template messages
- global styles

## What stories exist by default

- `src/ui/themes/ThemePalette.stories.tsx`
- `src/app/(protected)/admin/work-items/_internal/ui/WorkItemFormModal/index.stories.tsx`
- `src/app/(protected)/admin/work-items/_internal/ui/LabelsPanel/index.stories.tsx`
- `src/app/(protected)/admin/work-items/_internal/ui/AssistantSuggestionsPanel/index.stories.tsx`

These stories intentionally demonstrate:

- shared theme tokens
- form composition
- reference data editing
- a small AI-flavored panel with deterministic local data

## Recommended use

Use Storybook when you want to:

- design shared UI primitives
- review component states without the full app shell
- document component APIs
- validate theming and dark/light variants

## If you do not want Storybook

You can remove:

- `.storybook/`
- `*.stories.tsx`
- `storybook` packages from `package.json`
- `storybook` scripts from `package.json`

The rest of the template does not depend on Storybook.
