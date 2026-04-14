# fullstack-ai-template plan

## Goal

Transform the current codebase into a reusable template for AI products and full-stack B2B apps.

## Required outcome

- full template repository in `~/Projects/ai/fullstack-ai-template`
- Supabase/Auth/E2E/Storybook/MCP baseline
- one reference vertical slice using:
  - `domain`
  - `use-cases`
  - `adapters/inbound`
  - `adapters/outbound`
  - `ui/server-state`
  - `app/ui`
- generalized skills, rules, and docs
- CI baseline:
  - lint
  - typecheck
  - unit tests
  - e2e tests

## Decisions

- Template name: `fullstack-ai-template`
- Storybook and Sentry remain optional
- Architecture stays strict:
  - `domain`
  - `use-cases`
  - `ui/server-state`
  - feature-local `actions.ts`
  - `adapters/inbound`
  - `adapters/outbound`
- Reuse existing skills and MCP setup, but generalize project-specific examples
- Add onboarding skill for project structure and architecture walkthrough

## Extraction phases

1. Stabilize the baseline
   - make `check`, `test`, and baseline `e2e` deterministic
   - remove hard dependency on project-specific env for anonymous template checks

2. Replace the default product surface
   - switch default authenticated route from legacy admin pages to `work-items`
   - add minimal `work-items` routes and navigation

3. Build the reference vertical slice
   - work item domain
   - work item use-cases
   - Supabase outbound adapter
   - Next inbound server actions
   - `ui/server-state/work-items`
   - example admin UI

4. Remove legacy business domain
   - blogs
   - campaigns
   - customer
   - analyzer
   - related docs, tests, seeds, env, and helpers

5. Generalize agent tooling
   - `AGENTS.md`
   - `.claude`
   - `.agents`
   - `.mcp.json`
   - onboarding skill

6. Finalize template repo
   - initialize git repository
   - verify docs and checks
   - prepare for template-style reuse

## Current focus

- stabilize baseline tooling
- point auth and admin entry flows to `work-items`
- continue replacing legacy runtime surfaces with template runtime
