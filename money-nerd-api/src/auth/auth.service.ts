import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userSchema.findOne({ email: loginDto.email });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      name: user.name,
      email: user.email,
      sub: user._id.toString(),
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '10s',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '20s',
    });

    await this.userSchema.updateOne(
      { _id: user._id },
      { $push: { refreshTokens: refreshToken } },
    );

    return {
      accessToken,
      refreshToken,
    };
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
        throw new UnauthorizedException('Refresh token not valid');
      }

      const newAccessToken = this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
          sub: user._id.toString(),
        },
        {
          expiresIn: '10s',
          algorithm: 'HS256',
        },
      );

      // const newRefreshToken = this.jwtService.sign(
      //   {
      //     name: user.name,
      //     email: user.email,
      //     sub: user._id.toString(),
      //   },
      //   {
      //     expiresIn: '20s',
      //     algorithm: 'HS256',
      //   },
      // );

      // user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      // user.refreshTokens.push(newRefreshToken);
      await user.save();
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token', {
        cause: error,
      });
    }
  }
}
