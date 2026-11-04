import next from '@next/eslint-plugin-next'
import js from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import a11y from 'eslint-plugin-jsx-a11y-x'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import basket from './eslint.rules.mjs'

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.{jsx,tsx}'],
    extends: [
      next.configs['core-web-vitals'],
      react.configs['recommended-typescript'],
      reactHooks.configs.flat.recommended,
      a11y.configs.recommended,
    ],
    rules: {
      'func-style': ['error', 'expression'],
      'jsx-a11y-x/label-has-associated-control': ['error', { depth: 3 }],
    },
  },

  {
    plugins: {
      '@stylistic': stylistic,
      basket,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^next', '^@next', '^@?\\w'],
            ['^@/i18n'],
            ['^@/constant'],
            ['^@/app/actions'],
            ['^@/lib', '^@/context', '^@/hooks', '^@/store', '^@/utils', '^@/helpers'],
            ['^@/components', '^@/modules', '^@/widgets'],
            [
              '^@/sections.*/skeleton$',
              '^\\.\\.?/.*/skeleton$'
            ],
            ['^@/sections', '^\\.\\./'],
            ['^\\./action'],
            ['^\\./(?!(index\\.module\\.scss|.*\\.css$))'],
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'basket/jsx-layout': 'error',
      'basket/clsx-layout': 'error',

      '@stylistic/padding-line-between-statements': ['error',
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'always', prev: 'export', next: '*' },
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'always', prev: '*', next: ['return', 'if', 'try'] },
        { blankLine: 'always', prev: ['if', 'try'], next: '*' },
        { blankLine: 'any', prev: 'if', next: 'if' },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],

      '@stylistic/object-curly-newline': [
        'error',
        {
          ImportDeclaration: { multiline: true, minProperties: 4 },
          ExportDeclaration: { multiline: true, minProperties: 4 },
          ObjectExpression: { consistent: true },
          ObjectPattern: { consistent: true },
        },
      ],

      '@stylistic/object-property-newline': 'off',

      '@stylistic/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          ignoredNodes: ['JSXElement', 'JSXElement *', 'JSXFragment', 'JSXFragment *'],
        },
      ],
      '@stylistic/jsx-max-props-per-line': ['error', { maximum: 1, when: 'always' }],
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
      '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
      '@stylistic/jsx-indent-props': ['error', 2],
      '@stylistic/jsx-wrap-multilines': 'off',
      '@stylistic/jsx-curly-newline': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },

  globalIgnores([
    '.next/**',
    'coverage/**',
    'supabase/.temp/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
