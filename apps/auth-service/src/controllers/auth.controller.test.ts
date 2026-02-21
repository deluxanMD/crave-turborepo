import { beforeEach, describe, expect, it, vi } from 'vitest';
import { register, login } from './auth.controller.js';

// Mock dependencies
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
  },
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../schemas/auth.schema.js', () => ({
  registerSchema: { parse: vi.fn((data) => data) },
  loginSchema: { parse: vi.fn((data) => data) },
}));

import { prisma } from '../lib/prisma.js';

const mockReq = (body: object) => ({ body }) as any;
const mockRes = () => {
  const res = {} as any;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('register', () => {
    it('should create a user and return 201', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'password123', role: 'user' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', email: 'test@test.com' } as any);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        userId: '1',
      });
    });

    it('should return 400 if user already exists', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'password123', role: 'user' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockResolvedValue(res);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', email: 'test@test.com' } as any);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User already exists',
      });
    });
  });

  describe('login', () => {
    it('should return a token and role on valid credentials', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'password123' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password_hash: 'hashed_password',
        role: 'user',
      } as any);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        role: 'user',
      });
    });
  });
});
