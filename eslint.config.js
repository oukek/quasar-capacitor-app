import js from '@eslint/js'
import pluginQuasar from '@quasar/app-vite/eslint'
import stylisticPlugin from '@stylistic/eslint-plugin'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
  },

  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  ...pluginVue.configs['flat/essential'],
  stylisticPlugin.configs.customize({
    indent: 2,
    semi: false,
    quotes: 'single',
  }),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
    },
  },
  // https://github.com/vuejs/eslint-config-typescript
  ...vueTsEslintConfig({
    // Optional: extend additional configurations from typescript-eslint'.
    // Supports all the configurations in
    // https://typescript-eslint.io/users/configs#recommended-configurations
    extends: [
      // By default, only the 'recommendedTypeChecked' rules are enabled.
      'recommendedTypeChecked',
      // You can also manually enable the stylistic rules.
      // "stylistic",

      // Other utility configurations, such as 'eslintRecommended', (note that it's in camelCase)
      // are also extendable here. But we don't recommend using them directly.
    ],
  }),

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },

    // add your custom rules here
    rules: {
      'sort-imports': 'off',
      'import/order': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'no-undef': 'off',
      'no-console': 'off',
      'no-dupe-class-members': 'off',
      'import/newline-after-import': 'off',
      'unicorn/prefer-number-properties': 'off',
      'new-cap': 'off',
      'node/prefer-global/process': 'off',
      'curly': 'off',
      'antfu/top-level-function': 'off',
      'prefer-arrow-callback': 'off',
      'no-alert': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'jsdoc/require-returns-description': 'off',
      'ts/no-require-imports': 'off',
      'jsdoc/check-param-names': 'off',
      'no-throw-literal': 'off',
      'node/prefer-global/buffer': 'off',
      'prefer-spread': 'off',
      'jsonc/sort-array-values': 'off',
      'prefer-regex-literals': 'off',
      'vue/no-unused-refs': 'off',
      'no-new': 'off',
      'ts/no-namespace': 'off',
      'no-case-declarations': 'off',
      'node/no-path-concat': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'regexp/no-useless-flag': 'off',
      'perfectionist/sort-imports': 'off',
      'ts/no-unsafe-function-type': 'off',
      'ts/prefer-literal-enum-member': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },

  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
]
