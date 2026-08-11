import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    getAllUsers: jest.fn(),
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
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto: RegisterDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securePassword123',
      };

      const expectedResponse = {
        message: 'User registered successfully!',
        user: {
          id: 'uuid-5678',
          name: dto.name,
          email: dto.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUsers', () => {
    it('should call authService.getAllUsers and return user list', async () => {
      const expectedUsers = [
        { id: '1', name: 'User One', email: 'one@example.com', createdAt: new Date() },
      ];

      mockAuthService.getAllUsers.mockResolvedValue(expectedUsers);

      const result = await controller.getUsers();

      expect(service.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });
});
