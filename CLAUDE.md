# Influencer Marketing Platform Frontend

Next.js 15 platform for managing influencer marketing campaigns with AI-powered blogger search.

## Language

**Always respond in Russian (Русский язык).**

## Commands

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `bun run dev`       | Development server (port 3000) |
| `bun run build`     | Production build               |
| `bun run lint`      | ESLint                         |
| `bun run format`    | Prettier formatting            |
| `bun run typecheck` | TypeScript validation          |
| `bun test`          | Run tests                      |

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Mantine UI, CSS Modules
- **Validation**: Valibot (domain schemas)
- **State**: TanStack Query (server), Zustand (page UI), React Context (global)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth
- **i18n**: React Intl
- **Package Manager**: Bun

## Architecture

Clean Architecture with four layers:

| Layer         | Path          | Purpose                           | Dependencies      |
| ------------- | ------------- | --------------------------------- | ----------------- |
| **Domain**    | `domain/`     | Valibot schemas, pure utilities   | None              |
| **Adapters**  | `adapters/`   | Supabase clients, API             | Domain            |
| **Use-Cases** | `use-cases/`  | React Query hooks, business logic | Adapters, Domain  |
| **UI**        | `app/`, `ui/` | Components, pages, layouts        | Use-Cases, Domain |

**Dependency Flow**: `UI → Use-Cases → Adapters → Domain`

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (protected)/       # Authenticated pages (admin/bloggers, campaigns)
│   └── (public)/          # Public pages (home, login)
├── domain/                # Business entities (Valibot schemas)
├── adapters/              # Supabase clients, API layer
├── use-cases/             # TanStack Query hooks
├── infrastructure/        # Cross-cutting concerns (i18n, logging)
│   └── i18n/              # Translations (ru.ts, en.ts, types)
└── ui/                    # Reusable components, contexts
```

## Key Patterns

**Domain Validation**: Valibot schemas for runtime validation + TypeScript types.

**Component Pattern**: Smart/Dumb separation via `composeHooks(View)(useProps)`.

**State Management**: UI state (useState), Page UI (Zustand), Server state (TanStack Query), Global (Context).

**i18n**: `messages.json` + `<TranslationText {...messages.key} />`.

**Forms**: Mantine Forms + `createMantineValidator(ValibotSchema)`.

## Critical Constraints

- ❌ No manual `bun run lint`, `bun run format`, `bun run knip` — hooks run them automatically after response
- ❌ No `interface` — use `type`
- ❌ No classes — functional only
- ❌ No inline `style={{}}` — use Mantine props or CSS Modules
- ❌ No `import * as v from 'valibot'` — import functions directly
- ❌ No `any` types
- ❌ No barrel exports (`index.ts` for re-exporting) — import directly from files
- ❌ No hardcoded hex colors — use Mantine CSS vars or `ui/themes/palette-*.ts`
- ✅ Import domain types from `@/domain/entity`
- ✅ Use `composeHooks` for Smart/Dumb separation
- ✅ Use `TranslationText` for i18n, never hardcoded strings
- ✅ Dark theme is default (`defaultColorScheme="dark"`)
- ✅ Many types in component? Create `interfaces.ts` file

## Adding Features

Follow layer order: **Domain → Adapters → Use-Cases → UI**

```typescript
// 1. Domain (domain/blogger/index.ts)
export const BloggerSchema = object({ id: string(), instagram_username: string() })
export type Blogger = InferOutput<typeof BloggerSchema>

// 2. Adapter (adapters/api/blogger.ts)
export async function getBloggers(filters: BloggerFilters): Promise<Blogger[]> {
  const { data, error } = await supabase.from('bloggers').select('*')
  if (error) throw error
  return data
}

// 3. Use-Case (use-cases/bloggers/queries.ts)
export function useBloggers(filters: BloggerFilters) {
  return useQuery({
    queryKey: bloggerKeys.list(filters),
    queryFn: () => bloggerApi.getBloggers(filters),
  })
}

// 4. UI Component
export function ComponentView({ data, isLoading }: ViewProps) { ... }
export const Component = composeHooks<ViewProps, Props>(ComponentView)(useProps)
```

## Naming Conventions

| Type         | Convention            | Example                                            |
| ------------ | --------------------- | -------------------------------------------------- |
| Domain files | kebab-case            | `chat-message.ts`, `campaign-blogger.ts`           |
| Components   | PascalCase folders    | `BloggerCard/`, `CampaignView/`                    |
| Hooks        | camelCase             | `useBloggers()`, `useCampaigns()`                  |
| Types        | Inferred from schemas | `type Blogger = InferOutput<typeof BloggerSchema>` |

## Modular Documentation

Rules files loaded conditionally by file path:

| Document                         | Paths                                                  | Purpose                                       |
| -------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `@.claude/rules/core.md`         | `frontend/**/*`                                        | Critical constraints, naming, common pitfalls |
| `@.claude/rules/architecture.md` | `src/domain/**`, `src/adapters/**`, `src/use-cases/**` | Clean Architecture layers                     |
| `@.claude/rules/components.md`   | `src/ui/**`, `src/app/**`                              | composeHooks, i18n, Server/Client components  |
| `@.claude/rules/styling.md`      | `**/*.module.css`, `**/*Form*/**`                      | CSS Modules, Form validation                  |
| `@.claude/rules/data-state.md`   | `src/use-cases/**`, `src/ui/widgets/store/**`          | State management decision tree                |
| `@.claude/rules/quality.md`      | `**/*.test.{ts,tsx}`                                   | Testing, Performance                          |

Detailed documentation:

| Document                                    | Purpose                             |
| ------------------------------------------- | ----------------------------------- |
| `.claude/skills/component-creator/SKILL.md` | Step-by-step component creation     |
| `.claude/skills/architector/SKILL.md`       | Clean Architecture guide            |
| `@docs/ARCHITECTURE/QUICK_REFERENCE.md`     | One-page cheatsheet                 |
| `@docs/ARCHITECTURE/ARCHITECTURE.md`        | Complete architecture guide         |
| `@docs/ARCHITECTURE/COMPONENT_PATTERNS.md`  | composeHooks + Custom Hooks Library |
| `@docs/ARCHITECTURE/USE_CASES.md`           | TanStack Query hooks guide          |
| `@docs/ARCHITECTURE/DATA_ACCESS.md`         | API adapters, Supabase              |
| `@docs/ARCHITECTURE/FOLDER_STRUCTURE.md`    | Project structure                   |

## Environment Variables

Required in `.env.local`:

| Variable                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key                   |
| `ANALYZER_API_URL`              | Analyzer API URL (scraper/analyzer service) |
| `ANALYZER_API_KEY`              | Analyzer API key                            |

## Quick Links

- [Project Overview](docs/PLANS/PROJECT_OVERVIEW.md) — Full project description
- [Platform Plan](docs/PLANS/PLATFORM_PLAN.md) — Next.js platform roadmap
- [Architecture](docs/ARCHITECTURE/ARCHITECTURE.md) — Complete architecture guide
- [Quick Reference](docs/ARCHITECTURE/QUICK_REFERENCE.md) — One-page cheatsheet

Archived plans and reviews: `docs/ARCHIVE/`
