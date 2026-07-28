import nextConfig from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import sonarjs from 'eslint-plugin-sonarjs'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import resolvedBoundaries from './rules/eslint-boundaries-resolved.mjs'
import capabilityBoundaries from './rules/eslint-boundaries.mjs'

const eslintConfig = [
  {
    ignores: [
      'storybook-static/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      'rules/**',
    ],
  },
  ...nextConfig,
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  eslintPluginUnicorn.configs.recommended,
  sonarjs.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc' },
        },
      ],
      'import/no-duplicates': 'error',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-export-from': 'off',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/todo-tag': 'warn',
    },
  },
  ...capabilityBoundaries,
  ...resolvedBoundaries,
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'unicorn/no-useless-undefined': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'src/shared/client/env/**/*.ts',
      'src/shared/server/env/**/*.ts',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            'Read environment variables through src/shared/client/env or src/shared/server/env.',
        },
      ],
    },
  },
]

export default eslintConfig
