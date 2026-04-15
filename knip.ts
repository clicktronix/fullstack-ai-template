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

  ignore: [
    'src/**/*.d.ts',
    // Template library surface: intentionally shipped for new app features even when
    // the neutral demo slice does not import every reusable component yet.
    'src/adapters/supabase/admin.ts',
    'src/domain/shared/countries.ts',
    'src/domain/shared/crud-types.ts',
    'src/infrastructure/http/stream-headers.ts',
    'src/lib/countries.ts',
    'src/lib/errors/to-error-message.ts',
    'src/lib/format-phone.ts',
    'src/lib/rate-limiter.ts',
    'src/lib/stream/stream-error-utils.ts',
    'src/lib/test-helpers/react-intl-mock.ts',
    'src/lib/validators/code-validator.ts',
    'src/ui/components/ActionIconButton/**',
    'src/ui/components/ActionPopover/**',
    'src/ui/components/BadgeGroup/**',
    'src/ui/components/CrudTable/**',
    'src/ui/components/DataTable/**',
    'src/ui/components/EditPopover/**',
    'src/ui/components/FloatingInput/**',
    'src/ui/components/GridEmptyState/**',
    'src/ui/components/LazyMarkdown/**',
    'src/ui/components/MetricCard/**',
    'src/ui/components/MetricsGrid/**',
    'src/ui/components/PlatformToggleGroup/**',
    'src/ui/components/PrimaryItemMultiSelect/**',
    'src/ui/components/SimplePagination/**',
    'src/ui/components/TableEmptyState/**',
    'src/ui/components/TableSkeleton/**',
    'src/ui/components/ViewSection/**',
    'src/ui/hooks/use-confirm-action.ts',
    'src/ui/hooks/use-confirm-delete.ts',
    'src/ui/hooks/use-crud-modal-handler.ts',
    'src/ui/hooks/use-editable-cell.ts',
    'src/ui/hooks/use-form-state.ts',
    'src/ui/hooks/use-modal-form.ts',
    'src/ui/hooks/use-select-options.ts',
    'src/ui/hooks/use-settings-modal-state.ts',
    'src/ui/hooks/use-sidebar-resize.ts',
    'src/ui/layout/SidebarPageLayout/**',
    'src/ui/providers/ModalsProvider/**',
  ],

  ignoreDependencies: [
    // ESLint plugin used in config
    'eslint-plugin-import',
    '@eslint/eslintrc',
    // Testing utilities - used via @happy-dom/global-registrator
    'happy-dom',
    // Type reference used in tsconfig.json types array
    'bun-types',
    // Optional reusable component families included in the template library surface
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
    'exceljs',
    'i18n-iso-countries',
    'libphonenumber-js',
    'react-diff-viewer-continued',
    'react-markdown',
    'remark-gfm',
    'zustand',
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
    entry: ['next.config.ts', 'src/middleware.ts', 'src/app/**/page.tsx', 'src/app/**/layout.tsx'],
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
