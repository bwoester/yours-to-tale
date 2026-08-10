// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      'no-restricted-imports': ['error', {
        patterns: [
          {
            regex: String.raw`^\.\./`,
            message: 'Use a Nuxt alias for cross-directory imports; relative imports are reserved for colocated modules.',
          },
          {
            regex: String.raw`\.tsx?$`,
            message: 'Omit .ts and .tsx extensions from TypeScript imports.',
          },
        ],
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
    },
  },
);
