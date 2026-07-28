# Shared Runtime Code

Shared code is admitted, not a default destination.

## Roots

- `kernel`: pure cross-capability types, error contracts, and functions.
- `server`: server-only auth, API boundaries, environment, logging, observability, and provider
  support.
- `client`: browser environment, observability, logging, and browser SDKs.
- `ui`: presentation primitives, providers, neutral i18n mechanics, formatting, and themes.

## Admission Gate

Add code only when all are true:

1. At least two real capabilities consume it.
2. Meaning and lifecycle are identical.
3. No capability is the natural owner.
4. The contract is narrow and has a clear maintainer.
5. Copying is now more expensive than coordinating the shared contract.

`shared/kernel` also requires identical terminology, invariants, and change cadence.

Shared code cannot import product capabilities. Server roots cannot import client/UI roots; client
and UI roots cannot import server roots. Demote or delete code when consumers diverge.

Generated provider schemas live in `src/generated`, not in shared kernel. Only shared
server/client runtime code and private capability server/client adapters may import them.
Product locale catalogs belong to app composition and are passed into shared providers.
