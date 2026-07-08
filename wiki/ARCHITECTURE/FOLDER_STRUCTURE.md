# Folder Structure

```text
src/
├── app/
│   ├── (protected)/
│   │   └── admin/
│   │       ├── work-items/
│   │       ├── settings/
│   │       └── team/
│   └── (public)/
├── domain/
│   ├── work-item/
│   ├── label/
│   └── user/
├── use-cases/
│   ├── work-items/
│   └── labels/
├── adapters/
│   ├── inbound/next/
│   │   └── server-actions/
│   └── outbound/
│       └── supabase/
├── infrastructure/
│   ├── errors/       # ApiError/ActionError types, route + server-read error wrappers
│   ├── logging/      # logger, server-logger, log redaction
│   ├── sentry/       # Sentry config, redact, capture helper
│   ├── api/          # api-config, route context/response helpers
│   ├── auth/         # session verification, auth routes
│   ├── cache/        # cache tags
│   ├── env/          # public/client/server/runtime env access
│   └── i18n/         # locale detection
└── ui/
    ├── server-state/
    │   ├── work-items/
    │   └── labels/
    ├── components/
    ├── hooks/
    └── providers/    # query-client (TanStack), Auth/Locale contexts
```

## Notes

- `app/` is an entry layer, not a business layer
- page-specific UI lives under route-local `_internal/ui/`
- `ui/server-state` is separate from `use-cases`
- feature-local `actions.ts` live next to the component or hook that uses them
- there is no `src/lib/`; former `lib/**` modules were relocated into `infrastructure/` or `ui/` by owning concern
