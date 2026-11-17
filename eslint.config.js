// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Lint configuration for Astro, Vue, and TypeScript files.
 * Run on changed files first: `npm run lint -- src/components/Foo.astro`.
 * Docs: https://eslint.org/docs/latest/use/configure/configuration-files
 */
export default defineConfig([
  globalIgnores([
    'dist/**',
    '.astro/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
    'public/**',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
    rules: {
      // Component files are named by their folder and purpose (e.g. islands/ContactForm.vue).
      'vue/multi-word-component-names': 'off',
      // Script first, then template, then (rarely) style. See .cursor/rules/vue-islands.mdc.
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,vue,astro}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  // Must be last: turns off formatting rules that Prettier owns.
  prettier,
]);
