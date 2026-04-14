import nextConfig from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import sonarjs from 'eslint-plugin-sonarjs'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

const eslintConfig = [
  {
    ignores: ['storybook-static/**', 'test-results/**', 'playwright-report/**', 'coverage/**'],
  },
  // Next.js configs (native flat config in v16)
  ...nextConfig,
  ...nextCoreWebVitals,
  // Prettier (disables formatting rules that conflict)
  eslintConfigPrettier,
  // Additional plugins
  eslintPluginUnicorn.configs.recommended,
  sonarjs.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      // Allow setState in useEffect for client-side hydration (SSR pattern)
      'react-hooks/set-state-in-effect': 'off',
      // Import rules (import plugin is included in nextConfig)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc' },
        },
      ],
      'import/no-duplicates': 'error',
      // Unicorn rules - disable some opinionated ones
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-array-sort': 'off', // Allow .sort() - toSorted() not supported in all environments
      'unicorn/consistent-function-scoping': 'off', // Allow nested functions for readability
      // SonarJS rules - adjust severity
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/pseudo-random': 'off', // Allow Math.random() for mock data
      'sonarjs/no-nested-conditional': 'off', // Allow nested ternary for concise JSX
      'sonarjs/todo-tag': 'warn',
    },
  },
  // Test files - allow explicit undefined for testing nullable parameters
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'unicorn/no-useless-undefined': 'off',
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/domain/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app/**',
                '@/ui/**',
                '@/use-cases/**',
                '@/adapters/**',
                '@/infrastructure/**',
                '@/lib/**',
              ],
              message:
                'Domain layer must stay pure and cannot depend on app, ui, use-cases, adapters, infrastructure, or lib.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/use-cases/**/*.ts', 'src/use-cases/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/ui/**', '@/adapters/inbound/**'],
              message:
                'Use-cases may depend on domain, infrastructure, and outbound adapters, but not on app, ui, or inbound adapters.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/server-state/**/*.ts', 'src/ui/server-state/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app/**',
                '@/ui/components/**',
                '@/ui/contexts/**',
                '@/ui/layout/**',
                '@/ui/layouts/**',
                '@/ui/messages/**',
                '@/ui/providers/**',
                '@/ui/stores/**',
                '@/ui/themes/**',
              ],
              message:
                'Server-state integration must stay UI-framework agnostic: no app entrypoints or presentation-layer imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/hooks/**/*.ts', 'src/ui/hooks/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/adapters/outbound/**'],
              message:
                'Reusable UI hooks must not depend on app entrypoints or outbound adapters directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/route.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/adapters/outbound/**',
                '@/adapters/api/**',
                '@/adapters/supabase/**',
                '@/adapters/transport/**',
              ],
              message:
                'Route handlers must delegate outbound access to inbound route-handler adapters.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/ui/**/actions.ts',
      'src/ui/**/actions.tsx',
      'src/app/**/actions.ts',
      'src/app/**/actions.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**'],
              message: 'UI action wrappers must not depend on app entrypoints.',
            },
            {
              group: [
                '@/adapters/outbound/**',
                '@/adapters/api/**',
                '@/adapters/supabase/**',
                '@/adapters/transport/**',
              ],
              message:
                'Feature-local UI actions must not import outbound adapters directly. Call inbound adapters only.',
            },
            {
              group: [
                '@/ui/components/**',
                '@/ui/contexts/**',
                '@/ui/layout/**',
                '@/ui/layouts/**',
                '@/ui/messages/**',
                '@/ui/providers/**',
                '@/ui/server-state/**',
                '@/ui/stores/**',
                '@/ui/themes/**',
              ],
              message:
                'Feature-local UI actions must stay isolated from presentation and server-state layers.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'src/ui/server-state/**/*.ts',
      'src/ui/server-state/**/*.tsx',
      'src/ui/**/actions.ts',
      'src/ui/**/actions.tsx',
      'src/app/**/actions.ts',
      'src/app/**/actions.tsx',
      'src/app/**/route.ts',
    ],
    files: ['src/ui/**/*.ts', 'src/ui/**/*.tsx', 'src/app/**/*.ts', 'src/app/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/adapters/inbound/**'],
              message:
                'Presentation and reusable UI code must not import inbound adapters directly. Go through ui/server-state.',
            },
            {
              group: [
                '@/adapters/outbound/**',
                '@/adapters/api/**',
                '@/adapters/supabase/**',
                '@/adapters/transport/**',
              ],
              message:
                'Presentation and Next.js entrypoints must not import outbound adapters directly. Go through use-cases or inbound adapters.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/use-cases/**/__tests__/**/*.ts', 'src/use-cases/**/__tests__/**/*.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/adapters/inbound/**/*.ts', 'src/adapters/inbound/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/ui/**'],
              message:
                'Inbound adapters must not depend on app or ui. They wire outbound adapters into use-cases.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/adapters/outbound/**/*.ts',
      'src/adapters/outbound/**/*.tsx',
      'src/adapters/api/**/*.ts',
      'src/adapters/api/**/*.tsx',
      'src/adapters/supabase/**/*.ts',
      'src/adapters/supabase/**/*.tsx',
      'src/adapters/transport/**/*.ts',
      'src/adapters/transport/**/*.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/ui/**', '@/adapters/inbound/**'],
              message: 'Outbound adapters must not depend on app, ui, or inbound adapters.',
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
