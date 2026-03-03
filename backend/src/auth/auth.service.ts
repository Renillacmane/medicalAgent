import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegisterDto } from './dto';
import { User, UserDocument } from './schemas/user.schema';

const SALT_ROUNDS = 10;

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  access_token: string;
  expires_in: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userModel.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      dateOfBirth: new Date(dto.dateOfBirth),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
    });

    return this.issueTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase(), isActive: true })
      .select('+passwordHash')
      .exec();
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    const { passwordHash, ...result } = user.toObject();
    void passwordHash;
    return result as unknown as User;
  }

  login(user: User): Promise<AuthTokens> {
    return Promise.resolve(this.issueTokens(user));
  }

  async getProfile(userId: string): Promise<User | null> {
    const user = await this.userModel.findById(userId).select('-passwordHash').exec();
    return user ?? null;
  }

  private issueTokens(user: User | UserDocument): AuthTokens {
    const doc = user as UserDocument & {
      id?: string;
      _id?: { toString(): string };
    };
    const sub = doc.id ?? doc._id?.toString?.();
    const payload: JwtPayload = { sub: sub, email: user.email };
    const expiresIn = 3600; // 1 hour in seconds
    const access_token = this.jwtService.sign(payload, { expiresIn });
    return { access_token, expires_in: expiresIn };
  }
}
