// apps/api-service-1/eslint.config.mjs
import base from '../../eslint.config.mjs';

export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
