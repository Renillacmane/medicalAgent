import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto, RegisterDto } from './dto';
import { User } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() _dto: LoginDto, @CurrentUser() user: User): Promise<AuthTokens> {
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(
    @CurrentUser() user: User,
  ): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    isActive: boolean;
  }> {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const id = doc.id ?? doc._id?.toString?.() ?? '';
    return {
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      isActive: user.isActive,
    };
  }
}
