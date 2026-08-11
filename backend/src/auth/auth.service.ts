import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name.trim(),
          email,
          password: hashedPassword,
        },
      });

      // Exclude password from output
      const { password, ...result } = user;
      return {
        message: 'User registered successfully!',
        user: result,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to complete user registration. Please try again.');
    }
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  }
}
