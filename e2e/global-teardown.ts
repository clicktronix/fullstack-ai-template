import { test as teardown } from '@playwright/test'

teardown('cleanup', async () => {
  // Template baseline keeps teardown empty by default.
  // Project-specific E2E cleanup should be added after the real demo entities are finalized.
})
