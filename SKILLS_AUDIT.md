# Skills Audit

## Keep mostly as-is

- `tanstack-query`
- `supabase-postgres-best-practices`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `frontend-design`
- `web-design-guidelines`
- `xlsx`

These skills are already generic enough and mostly depend on external best practices rather than current business domain.

## Rewrite / generalize

### `architector`

Current issues:

- uses current project naming and feature examples
- references `customer`, `campaigns`, `blogs`
- contains platform-specific examples in docs and paths

Action:

- keep architecture model
- replace all business examples with `work-items`, `labels`, `assistant-suggestions`

### `component-creator`

Current issues:

- examples still mention `blogs`, `blogger`, `blog-filter-store`
- some path examples are page-specific to current product

Action:

- keep component boundaries and hook rules
- replace examples with neutral UI examples
- add template-friendly examples around `work-items`

### `e2e-testing`

Current issues:

- highly project-specific
- references current Supabase project shape
- references `blogs`, `campaigns`, current agent endpoints
- references specific LangSmith projects

Action:

- rewrite into generic full-stack e2e guide
- keep Supabase + browser + API testing strategy
- replace examples with template demo domain

## Add new skill

### `project-onboarding`

Purpose:

- orient a new contributor in the template repo
- explain source of truth docs
- explain architecture layers
- show how to implement first feature
- point to commands and guardrails

Suggested sections:

1. What this template is
2. Read this first
3. Layer map
4. How to add a feature
5. How to test and validate
6. Common mistakes
