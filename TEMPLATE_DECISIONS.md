# Template Decisions

## Demo vertical slice

Шаблон будет строиться вокруг одного нейтрального эталонного slice:

- feature: `work-items`
- reference data: `labels`
- optional AI-flavored flow: `assistant-suggestions`

## Why `work-items`

- достаточно нейтрально для B2B и AI-продуктов
- позволяет показать CRUD
- хорошо ложится на list/detail/create/update/archive flow
- удобно для auth, server-state, e2e и demo данных

## Planned feature map

### Domain

- `domain/work-item`
- `domain/label`
- `domain/assistant`

### Use-cases

- `use-cases/work-items`
- `use-cases/labels`
- `use-cases/assistant-suggestions`

### Server-state

- `ui/server-state/work-items`
- `ui/server-state/labels`
- `ui/server-state/assistant-suggestions`

### Inbound adapters

- `adapters/inbound/next/server-actions/work-items.ts`
- `adapters/inbound/next/server-actions/labels.ts`
- `adapters/inbound/next/server-actions/assistant-suggestions.ts`

### Outbound adapters

- `adapters/outbound/supabase/work-items.repository.ts`
- `adapters/outbound/supabase/labels.repository.ts`
- `adapters/outbound/api/assistant-suggestions.gateway.ts`

### UI

- protected page for work item list/detail
- shared table/list pattern
- feature-local `actions.ts` where direct Server Action calls are needed

## Template posture

The template should feel like:

- serious production baseline
- minimal but opinionated architecture
- ready for AI-assisted products
- reusable for internal tools and B2B apps
