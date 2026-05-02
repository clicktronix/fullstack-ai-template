import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  $schema: 'https://unpkg.com/knip@5/schema.json',

  entry: [
    'src/app/**/page.tsx',
    'src/app/**/layout.tsx',
    'src/app/**/route.ts',
    'src/**/__tests__/*.test.{ts,tsx}',
    'scripts/*.ts',
  ],

  project: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'scripts/**/*.ts'],

  ignore: ['src/**/*.d.ts', 'src/adapters/supabase/admin.ts'],

  ignoreDependencies: [
    // ESLint plugin used in config
    'eslint-plugin-import',
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
    // Domain layer - schemas and utilities exported for type inference
    'src/domain/**': ['exports'],
    // Adapters - public API layer
    'src/adapters/**': ['exports'],
    // Use-cases - hooks and mutations exported for components
    'src/use-cases/**': ['exports'],
    // UI components - View components exported for testing (composeHooks)
    'src/ui/components/**': ['exports'],
    'src/ui/widgets/**': ['exports'],
    'src/ui/charts/**': ['exports'],
    'src/ui/hooks/**': ['exports'],
    'src/ui/layout/**': ['exports'],
    'src/ui/layouts/**': ['exports'],
    'src/ui/server-state/**': ['exports'],
    'src/app/**/ui/**': ['exports'],
    // Theme exports - palette functions exported for customization
    'src/ui/themes/**': ['exports'],
    // Lib utilities - helper functions
    'src/lib/**': ['exports'],
    // Infrastructure layer
    'src/infrastructure/**': ['exports'],
    // Locale cookie and localStorage keys intentionally share the same template placeholder.
    'src/lib/constants.ts': ['duplicates'],
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
