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
└── ui/
    ├── server-state/
    │   ├── work-items/
    │   └── labels/
    ├── components/
    └── hooks/
```

## Notes

- `app/` is an entry layer, not a business layer
- page-specific UI lives under route-local `_internal/ui/`
- `ui/server-state` is separate from `use-cases`
- feature-local `actions.ts` live next to the component or hook that uses them
