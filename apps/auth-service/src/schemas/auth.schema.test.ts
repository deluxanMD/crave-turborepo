import { describe, it, expect } from 'vitest';
import { registerSchema } from './auth.schema.js';
import { email } from 'zod';

describe('Auth Schema', () => {
  it('should parse valid input', () => {
    const result = registerSchema.parse({ email: 'test@example.com', password: 'test123' });
    expect(result.email).toBe('test@example.com');
    expect(result.password).toBe('test123');
  });
});
