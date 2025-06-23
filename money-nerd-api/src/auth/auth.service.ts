import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { RequestWithUser } from './types/request-with-user';
import { VerifyEmailDto } from 'src/users/dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userSchema.findOne({ email: loginDto.email });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (!(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException('Incorrect password.');
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email first.');
      }

      if (!user.canLoginWithPassword) {
        throw new UnauthorizedException(
          'Login with password is not allowed for this account.',
        );
      }

      const payload = {
        name: user.name,
        email: user.email,
        sub: user._id.toString(),
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1h',
        algorithm: 'HS256',
      });

      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d',
        algorithm: 'HS256',
      });

      await this.userSchema.updateOne(
        { _id: user._id },
        { $set: { refreshTokens: [refreshToken] } },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Login failed due to an unexpected error',
        { cause: error },
      );
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        name: string;
        email: string;
        sub: string;
      }>(refreshToken);
      const user = await this.userSchema.findById({ _id: payload.sub });

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException('Refresh token not valid.');
      }

      const newAccessToken = this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
          sub: user._id.toString(),
        },
        {
          expiresIn: '1h',
          algorithm: 'HS256',
        },
      );

      await user.save();
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token.', {
        cause: error,
      });
    }
  }

  async loginWithGoogle(googleUser: RequestWithUser) {
    try {
      const existingUser = await this.userSchema
        .findOne({ email: googleUser.user.email })
        .exec();

      let finalUser: UserDocument;

      if (!existingUser) {
        finalUser = await this.userSchema.create({
          email: googleUser.user.email,
          name: googleUser.user.name,
          googleId: googleUser.user.googleId,
          picture: googleUser.user.picture,
          provider: 'google',
          canLoginWithPassword: false,
          isEmailVerified: true,
        });
      } else {
        finalUser = existingUser;
        await this.userSchema.updateOne(
          { _id: finalUser?._id },
          {
            $set: { provider: 'google', googleId: googleUser.user.googleId },
          },
        );
      }

      const payload = {
        sub: finalUser._id,
        email: finalUser.email,
        name: finalUser.name,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      await this.userSchema.updateOne(
        { _id: finalUser._id },
        {
          $set: { refreshTokens: [refreshToken] },
        },
      );

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Failed to login with Google', {
        cause: error,
      });
    }
  }

  async loginWithGithub(githubUser: RequestWithUser) {
    try {
      const existingUser = await this.userSchema
        .findOne({ email: githubUser.user.email })
        .exec();

      let finalUser: UserDocument;

      if (!existingUser) {
        finalUser = await this.userSchema.create({
          githubId: githubUser.user.githubId,
          email: githubUser.user.email,
          name: githubUser.user.name,
          picture: githubUser.user.picture,
          provider: 'github',
          canLoginWithPassword: false,
          isEmailVerified: true,
        });
      } else {
        finalUser = existingUser;
        await this.userSchema.updateOne(
          { _id: finalUser?._id },
          {
            $set: { provider: 'github', githubId: githubUser.user.githubId },
          },
        );
      }

      const payload = {
        sub: finalUser?._id,
        email: finalUser?.email,
        name: finalUser?.name,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      await this.userSchema.updateOne(
        { _id: finalUser?._id },
        {
          $set: { refreshTokens: [refreshToken] },
        },
      );

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Failed to login with Github', {
        cause: error,
      });
    }
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    try {
      const user = await this.userSchema.findOne({ email: dto.email });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('E-mail already verified.');
      }

      if (user.emailVerificationCode !== dto.code) {
        throw new BadRequestException('Invalid code.');
      }

      if (user.emailVerificationCodeExpires! < new Date()) {
        throw new BadRequestException('Expired code.');
      }

      user.isEmailVerified = true;
      user.canLoginWithPassword = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationCodeExpires = undefined;

      await user.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException(
        'E-mail verification failed due to an unexpected error',
        { cause: error },
      );
    }
  }
}
