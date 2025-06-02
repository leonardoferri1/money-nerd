import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { MongoError } from './types/mongo-error';
import { MailService } from 'src/mail/mail.service';
import { generateCodeEmailHtml } from '../mail/templates/verification-email.template';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userSchema.create({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
        provider: 'local',
        canLoginWithPassword: true,
        isEmailVerified: false,
      });

      await this.sendEmailVerificationCode(newUser);

      return newUser;
    } catch (err: unknown) {
      const error = err as MongoError;

      if (error.code === 11000 && error.keyPattern?.email) {
        throw new ConflictException('Email is already in use.');
      }

      throw new InternalServerErrorException('Failed to create user.', {
        cause: error,
      });
    }
  }

  private async sendEmailVerificationCode(user: UserDocument): Promise<void> {
    const code = this.generateVerificationCode();
    const expires = new Date(Date.now() + 1000 * 60 * 10);

    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = expires;
    await user.save();

    await this.mailService.sendMail(
      user.email,
      'Verify your email',
      generateCodeEmailHtml(code),
    );
  }

  async resendEmailVerification(email: string) {
    const user = await this.userSchema.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendEmailVerificationCode(user);

    return { message: 'Verification code resent' };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async findAll() {
    try {
      return await this.userSchema.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userSchema.findOne({
        _id: id,
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the user');
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: string) {
    try {
      const result = await this.userSchema.deleteOne({
        _id: id,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException('User not found or already deleted');
      }
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
