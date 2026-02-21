import base from '../../eslint.config.mjs';

export default [
  { ignores: ['prisma.config.ts'] },
  ...base,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
