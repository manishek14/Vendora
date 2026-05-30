import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserService = {
  findByEmail: jest.fn(),
  findByPhone: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  verifyPhone: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock_secret'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('registerLocal', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });
      await expect(service.registerLocal({ email: 'test@test.com', password: '123456', fullName: 'Test' }))
        .rejects.toThrow(ConflictException);
    });

    it('should register user and return tokens', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue({ id: 1, email: 'new@test.com', roles: [] });
      const result = await service.registerLocal({ email: 'new@test.com', password: '123456', fullName: 'Test' });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('validateLocalUser', () => {
    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const result = await service.validateLocalUser('test@test.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null if password is wrong', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        id: 1, email: 'test@test.com', password: await bcrypt.hash('correct', 10),
      });
      const result = await service.validateLocalUser('test@test.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return user if credentials are valid', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: hashed });
      const result = await service.validateLocalUser('test@test.com', 'correct');
      expect(result).toBeTruthy();
    });
  });

  describe('requestOtp', () => {
    it('should return isNewUser true for new phone', async () => {
      mockUserService.findByPhone.mockResolvedValue(null);
      const result = await service.requestOtp('09123456789');
      expect(result.isNewUser).toBe(true);
    });

    it('should return isNewUser false for existing phone', async () => {
      mockUserService.findByPhone.mockResolvedValue({ id: 1 });
      const result = await service.requestOtp('09123456789');
      expect(result.isNewUser).toBe(false);
    });
  });

  describe('verifyOtp', () => {
    it('should throw BadRequestException for invalid OTP', async () => {
      await expect(service.verifyOtp('09123456789', '000000'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
