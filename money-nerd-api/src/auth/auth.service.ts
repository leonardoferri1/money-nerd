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

    const token = this.jwtService.sign({
      name: user.name,
      email: user.email,
      sub: user._id.toString(),
    });

    return { access_token: token };
  }
}
