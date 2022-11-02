module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['svelte3', '@typescript-eslint'],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: {
    'svelte3/typescript': () => require('typescript')
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  rules: {
    // udonarium用 記法緩和
    '@typescript-eslint/no-namespace': ['warn'],
    '@typescript-eslint/no-empty-function': ['warn'],
    '@typescript-eslint/prefer-namespace-keyword': ['warn'],
    '@typescript-eslint/ban-types': ['warn'],
    'no-empty': ['warn'],
    'prefer-spread': ['warn']
  }
};
