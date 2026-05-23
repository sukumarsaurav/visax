// ESLint v9 flat config. Migrated from missing legacy .eslintrc.
import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'supabase/functions/**'] },

    js.configs.recommended,

    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        settings: {
            react: { version: '18.3' },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            // JSX-runtime makes the React import unnecessary
            'react/react-in-jsx-scope': 'off',
            // We rely on defaults + runtime checks rather than PropTypes
            'react/prop-types': 'off',
            // Allow unescaped apostrophes/quotes in copy
            'react/no-unescaped-entities': 'off',
            // Catch unused imports/vars but ignore intentional _ prefix
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                ignoreRestSiblings: true,
            }],
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },

    // Tests can use vitest globals
    {
        files: ['src/test/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                vi: 'readonly',
            },
        },
    },
]
