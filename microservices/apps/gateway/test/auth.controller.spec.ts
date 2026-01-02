import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    refreshTokens: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: dto.email },
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: dto.email },
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('should return user profile', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = { id: '1', email: 'test@example.com', name: 'Test' };

      mockAuthService.getProfile.mockResolvedValue(result);

      expect(await controller.me(user)).toEqual(result);
      expect(authService.getProfile).toHaveBeenCalledWith('1');
    });
  });
});
