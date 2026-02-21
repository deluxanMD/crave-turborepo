import { beforeEach, describe, expect, it, vi } from 'vitest';
import { register, login } from './auth.controller.js';
import bcrypt from 'bcrypt';

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
import z from 'zod';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { Role } from '../types/auth.types.js';

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

    it('should return 400 if validation fails', async () => {
      const req = mockReq({ email: 'test@test.com' });
      const res = mockRes();

      const zodError = new z.ZodError([
        { code: 'custom', message: 'Validation failed', path: ['email'] },
      ]);
      vi.spyOn(registerSchema, 'parse').mockImplementationOnce(() => {
        throw zodError;
      });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: zodError.issues });
    });

    it('should return 500 on internal server error', async () => {
      const req = mockReq({ email: 'test@test.com' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Internal server error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
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

    it('should return 401 if user not available', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'wrong_password' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return 401 on invalid credentials', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'wrong_password' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password_hash: 'hashed_password',
        role: Role.CUSTOMER,
        created_at: new Date(),
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = mockReq({ email: 'test' });
      const res = mockRes();

      const zodError = new z.ZodError([
        { code: 'custom', message: 'Validation failed', path: ['email'] },
      ]);

      vi.spyOn(loginSchema, 'parse').mockImplementationOnce(() => {
        throw zodError;
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: zodError.issues });
    });

    it('should return 500 on internal server error', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'password123' });
      const res = mockRes();

      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Internal server error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });
});
