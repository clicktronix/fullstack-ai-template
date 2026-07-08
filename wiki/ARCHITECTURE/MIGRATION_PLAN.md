# Migration Plan

This document is kept for teams who adapt the template into a real product.

## Recommended Order

1. Rename the project and configure environment variables
2. Replace template metadata, branding, and README content
3. Decide whether to keep or remove owner-only placeholder pages
4. Replace the demo `work-items` slice with your first real feature
5. Expand `ui/server-state` and outbound adapters only as new product needs appear
6. Add product-specific E2E coverage after the real domain is in place

## Remove or Replace Early

- `work-items`
- `labels`
- template placeholder texts
- template app metadata

## Keep

- architecture boundaries
- ESLint import rules
- auth and Supabase baseline
- CI checks
- skills and onboarding docs
