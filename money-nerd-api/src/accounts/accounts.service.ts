import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
// import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './entities/account.entity';
import { Model } from 'mongoose';
import { MongoError } from 'src/users/types/mongo-error';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private accountSchema: Model<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto, userId: string) {
    try {
      return await this.accountSchema.create({
        ...createAccountDto,
        user: userId,
      });
    } catch (e) {
      const error = e as MongoError;

      if (error.code === 11000 && error.keyPattern?.name) {
        throw new ConflictException(
          'You already have an account with this name.',
        );
      }

      throw new InternalServerErrorException('Failed to create account', {
        cause: error,
      });
    }
  }

  async findAll(userId: string) {
    try {
      return await this.accountSchema.find({ user: userId });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch accounts', {
        cause: error,
      });
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const account = await this.accountSchema.findOne({
        _id: id,
        user: userId,
      });
      if (!account) {
        throw new NotFoundException('account not found');
      }
      return account;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the account');
    }
  }

  // update(id: number, updateAccountDto: UpdateAccountDto) {
  //   return `This action updates a #${id} account`;
  // }

  async remove(id: string, userId: string) {
    try {
      const result = await this.accountSchema.deleteOne({
        _id: id,
        user: userId,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException('Account not found or already deleted');
      }
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
