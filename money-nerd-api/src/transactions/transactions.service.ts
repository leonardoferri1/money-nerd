import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model } from 'mongoose';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionSchema: Model<Transaction>,
  ) {}

  async create(createTransactionsDto: CreateTransactionDto[], userId: string) {
    try {
      const converted = createTransactionsDto.map((dto) => ({
        ...dto,
        date: new Date(dto.date),
        user: userId,
      }));

      const transactions = await this.transactionSchema.insertMany(converted);

      return this.transactionSchema.find({
        _id: { $in: transactions.map((t) => t._id) },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create transaction', {
        cause: error,
      });
    }
  }

  async findAll(userId: string) {
    try {
      return await this.transactionSchema
        .find({ user: userId })
        .populate('category')
        .populate('account');
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch transactions', {
        cause: error,
      });
    }
  }

  async findRecurring(userId: string) {
    try {
      return await this.transactionSchema
        .find({
          user: userId,
          $or: [{ recurringTransaction: true }],
        })
        .populate('category')
        .populate('account');
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
      const transaction = await this.transactionSchema
        .findOne({
          _id: id,
          user: userId,
        })
        .populate('category')
        .populate('account');

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the transaction');
    }
  }

  async update(
    transactionId: string,
    dto: UpdateTransactionDto,
    userId: string,
  ) {
    console.log('Update Transaction:', transactionId, userId);
    try {
      const updated = await this.transactionSchema.findOneAndUpdate(
        { _id: transactionId, user: userId },
        { ...dto, ...(dto.date ? { date: new Date(dto.date) } : {}) },
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException('Transaction not found.');
      }

      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update transaction', {
        cause: error,
      });
    }
  }

  async remove(id: string, userId: string) {
    try {
      const result = await this.transactionSchema.deleteOne({
        _id: id,
        user: userId,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException('Transaction not found or already deleted');
      }
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete transaction');
    }
  }
}
