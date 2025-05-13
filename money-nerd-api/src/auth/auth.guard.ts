import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<{
        name: string;
        email: string;
        sub: string;
      }>(token, {
        algorithms: ['HS256'],
      });

      const user = await this.userSchema.findOne({ _id: payload.sub }).lean();

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request['user'] = user;
      return true;
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Invalid token', { cause: e });
    }
  }
}
