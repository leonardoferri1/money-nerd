import {
  BadRequestException,
  ConflictException,
  HttpException,
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
import { generatePasswordResetEmailHtml } from 'src/mail/templates/password-reset-emai.template';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<User>,
    private readonly mailService: MailService,
    @InjectModel(Category.name)
    private categorySchema: Model<Category>,
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

      await this.createDefaultCategory(newUser._id.toString());

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

  async passwordResetCode(email: string) {
    try {
      const user = await this.userSchema.findOne({
        email: email,
      });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      await this.sendPasswordReseter(user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the user');
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

  private async sendPasswordReseter(user: UserDocument): Promise<void> {
    const code = this.generateVerificationCode();
    const expires = new Date(Date.now() + 1000 * 60 * 10);

    user.passwordResetCode = code;
    user.passwordResetCodeExpires = expires;
    await user.save();

    await this.mailService.sendMail(
      user.email,
      'Reset your password',
      generatePasswordResetEmailHtml(code),
    );
  }

  async resendEmailVerification(email: string) {
    const user = await this.userSchema.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('E-mail already verified.');
    }

    await this.sendEmailVerificationCode(user);

    return { message: 'Verification code resent.' };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    try {
      const user = await this.userSchema.findOne({
        email: email,
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (user?.passwordResetCode != code) {
        throw new BadRequestException('Invalid code.');
      }

      if (user.passwordResetCodeExpires! < new Date()) {
        throw new BadRequestException('Expired code.');
      }

      if (user.password && (await bcrypt.compare(newPassword, user.password))) {
        throw new BadRequestException(
          'Your new password is the same as the previous one.',
        );
      }

      user.password = bcrypt.hashSync(newPassword, 10);
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpires = undefined;
      await user.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
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
        throw new NotFoundException('User not found.');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the user');
    }
  }

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

  private async createDefaultCategory(userId: string): Promise<void> {
    try {
      await this.categorySchema.create({
        name: 'Generic',
        color: '#ec684a',
        icon: 'bi bi-alarm',
        user: userId,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
