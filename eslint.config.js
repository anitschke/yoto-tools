import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import litPlugin from 'eslint-plugin-lit';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      lit: litPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...litPlugin.configs['flat/recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Chai assertion expressions in tests (e.g. expect(x).to.be.true; expect(x).to.exist;)
    files: ['src/**/*.test.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
