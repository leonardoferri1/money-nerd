import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { Model } from 'mongoose';
import { MongoError } from 'src/users/types/mongo-error';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectModel(RecurringTransaction.name)
    private recurringTransactionSchema: Model<RecurringTransaction>,
  ) {}

  async create(
    createRecurringTransactionDto: CreateRecurringTransactionDto,
    userId: string,
  ) {
    try {
      return await this.recurringTransactionSchema.create({
        ...createRecurringTransactionDto,
        user: userId,
      });
    } catch (error: unknown) {
      const err = error as MongoError;

      if (err.code === 11000) {
        throw new ConflictException(
          'A recurring transaction with this name already exists.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to create recurring transaction',
        {
          cause: error,
        },
      );
    }
  }

  async findAll(userId: string) {
    try {
      return await this.recurringTransactionSchema.find({ user: userId });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch recurring transactions',
        {
          cause: error,
        },
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const recurringTransaction =
        await this.recurringTransactionSchema.findOne({
          _id: id,
          user: userId,
        });
      if (!recurringTransaction) {
        throw new NotFoundException('Recurring transaction not found');
      }
      return recurringTransaction;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch the recurring transaction',
      );
    }
  }

  // update(
  //   id: number,
  //   updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  // ) {
  //   return `This action updates a #${id} recurringTransaction`;
  // }

  async remove(id: string, userId: string) {
    try {
      const result = await this.recurringTransactionSchema.deleteOne({
        _id: id,
        user: userId,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(
          'Recurring transaction not found or already deleted',
        );
      }
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to delete recurring transaction',
      );
    }
  }
}
