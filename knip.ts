import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  $schema: 'https://unpkg.com/knip@5/schema.json',

  entry: [
    'src/app/**/page.tsx',
    'src/app/**/layout.tsx',
    'src/app/**/route.ts',
    'src/**/*.test.{ts,tsx}',
    'src/modules/*/{actions,cache,client,rsc,server,stream,job,ui}.ts',
    '.storybook/**/*.{ts,tsx}',
    'scripts/*.ts',
  ],

  project: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'scripts/**/*.ts'],

  ignoreDependencies: [
    // ESLint plugin used in config
    'eslint-plugin-import',
    'eslint-import-resolver-typescript',
    '@eslint/eslintrc',
    // Testing utilities - used via @happy-dom/global-registrator
    'happy-dom',
    // Type reference used in tsconfig.json types array
    'bun-types',
    // MCP CLIs referenced from .mcp.json
    '@playwright/mcp',
    'chrome-devtools-mcp',
  ],

  ignoreBinaries: [
    // Supabase CLI — installed globally, not via npm
    'supabase',
  ],

  // Ignore exports that follow project patterns
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },

  rules: {
    // Types are often exported for external use
    types: 'off',
  },

  // Ignore exports in specific files/patterns
  ignoreIssues: {
    // Capability contracts, schemas, and framework entrypoints are reusable template API.
    'src/modules/*/{actions,cache,client,rsc,server,stream,job,ui}.ts': ['exports'],
    'src/modules/*/domain/**': ['exports'],
    // View components are exported for isolated tests and template customization.
    'src/modules/*/ui/**': ['exports'],
    'src/shared/ui/components/**': ['exports'],
    'src/shared/ui/hooks/**': ['exports'],
    'src/app/**/_internal/ui/**': ['exports'],
    'src/app/_internal/layout/**': ['exports'],
    // Theme exports - palette functions exported for customization
    'src/shared/ui/themes/**': ['exports'],
    // Shared helpers are part of the template's customization surface.
    'src/shared/ui/formatters/**': ['exports'],
    'src/shared/ui/html/**': ['exports'],
    'src/shared/ui/storage.ts': ['exports'],
    'src/shared/ui/create-mantine-validator.ts': ['exports'],
    'src/shared/ui/mantine-notifications.ts': ['exports'],
    'src/shared/ui/providers/query-client.ts': ['exports'],
    'src/shared/kernel/errors/**': ['exports'],
    'src/shared/server/env/runtime.ts': ['exports'],
    // Locale cookie and localStorage keys intentionally share the same template placeholder.
    'src/shared/ui/i18n/constants.ts': ['duplicates'],
  },

  next: {
    entry: ['next.config.ts', 'src/proxy.ts', 'src/app/**/page.tsx', 'src/app/**/layout.tsx'],
  },

  eslint: {
    config: ['eslint.config.mjs'],
  },

  bun: {
    config: ['bunfig.toml'],
    entry: ['tests/setup.ts', 'src/**/__tests__/*.test.{ts,tsx}'],
  },

  typescript: {
    config: ['tsconfig.json'],
  },
}

export default config
