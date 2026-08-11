import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully register a new user and return sanitized user data', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const createdUser = {
        id: 'uuid-1234',
        name: registerDto.name,
        email: registerDto.email,
        password: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result.message).toBe('User registered successfully!');
      expect(result.user).toEqual({
        id: 'uuid-1234',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of registered users', async () => {
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
        { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const users = await service.getAllUsers();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });
  });
});
