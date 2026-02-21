import base from '../../eslint.config.mjs';

export default [
  { ignores: ['prisma.config.ts', 'vitest.config.ts', 'vitest.setup.ts', '**/*.test.ts'] },
  ...base,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
