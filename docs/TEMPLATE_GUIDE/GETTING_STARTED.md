# Getting Started

## 1. Bootstrap project identity

Run this from the repository root:

```bash
bun run bootstrap -- --name=fullstack-ai-template --title="Fullstack AI Template"
```

Required:

- `--name`
  Use kebab-case. This becomes the package name and the locale cookie prefix.

Optional:

- `--title`
  Human-readable product title. If omitted, it is derived from `--name`.

## 2. Configure environment

Copy:

```bash
cp .env.example .env.local
```

Fill at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII`
- `AI_SUGGESTIONS_API_URL`
- `AI_SUGGESTIONS_API_KEY`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

If E2E credentials are omitted, the template still runs anonymous access-control smoke tests.

## 3. Install and run

```bash
bun install
bun run dev
bun run storybook
```

## 4. Verify baseline health

Run sequentially:

```bash
bun run check
bun run test:e2e
```

## 5. Read these next

- `AGENTS.md`
- `docs/ARCHITECTURE/QUICK_REFERENCE.md`
- `docs/ARCHITECTURE/ARCHITECTURE.md`
- `docs/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_STORYBOOK.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_SENTRY.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_AI_ENDPOINT.md`
- `.agents/skills/project-onboarding/SKILL.md`
