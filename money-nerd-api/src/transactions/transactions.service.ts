import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionDocument,
} from './entities/transaction.entity';
import { Model } from 'mongoose';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { FilterQuery } from 'mongoose';
import { TransactionType } from './enums/transaction-type.enum';

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

  private toUTCDateOnly(dateString: string): Date {
    const date = new Date(dateString);
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  async findAll(userId: string, filters: FilterTransactionsDto) {
    try {
      const query: FilterQuery<TransactionDocument> = { user: userId };

      if (filters.type !== undefined) {
        query.type = Number(filters.type);
      }

      if (filters.wasPaid !== undefined) {
        query.wasPaid = filters.wasPaid === 'true';
      }

      if (filters.isCreditCard !== undefined) {
        query.isCreditCard = filters.isCreditCard === 'true';
      }

      if (filters.description) {
        query.description = { $regex: filters.description, $options: 'i' };
      }

      if (filters.account) {
        query.account = filters.account;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      const valueQuery: Record<string, number> = {};
      if (filters.minValue) valueQuery.$gte = Number(filters.minValue);
      if (filters.maxValue) valueQuery.$lte = Number(filters.maxValue);
      if (Object.keys(valueQuery).length > 0) query.value = valueQuery;

      const dateQuery: Record<string, Date> = {};
      if (filters.startDate) {
        dateQuery.$gte = this.toUTCDateOnly(filters.startDate);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        const inclusiveEnd = new Date(
          Date.UTC(
            end.getUTCFullYear(),
            end.getUTCMonth(),
            end.getUTCDate() + 1,
          ),
        );
        dateQuery.$lt = inclusiveEnd;
      }
      if (Object.keys(dateQuery).length > 0) query.date = dateQuery;

      const transactions = await this.transactionSchema
        .find(query)
        .populate('category')
        .populate('account')
        .sort({ date: -1 });

      const allTransactions = await this.transactionSchema.find({
        user: userId,
      });

      const filterDate = filters.startDate ? new Date(filters.startDate) : null;
      const year = filterDate?.getFullYear() ?? null;
      const month = filterDate?.getMonth() ?? null;

      const yearTransactions = year
        ? allTransactions.filter((t) => new Date(t.date).getFullYear() === year)
        : [];

      const monthTransactions =
        year !== null && month !== null
          ? yearTransactions.filter(
              (t) => new Date(t.date).getMonth() === month,
            )
          : [];

      const sumByType = (items: TransactionDocument[], type: TransactionType) =>
        items
          .filter((t) => t.type === type)
          .reduce((acc, t) => acc + t.value, 0);

      const income = sumByType(allTransactions, TransactionType.Income);
      const incomeYear = sumByType(yearTransactions, TransactionType.Income);
      const incomeMonth = sumByType(monthTransactions, TransactionType.Income);

      const expense = sumByType(allTransactions, TransactionType.Outcome);
      const expenseYear = sumByType(yearTransactions, TransactionType.Outcome);
      const expenseMonth = sumByType(
        monthTransactions,
        TransactionType.Outcome,
      );

      const summary = {
        total: income - expense,
        totalYear: incomeYear - expenseYear,
        totalMonth: incomeMonth - expenseMonth,
        income,
        incomeYear,
        incomeMonth,
        expense,
        expenseYear,
        expenseMonth,
      };

      return { transactions, summary };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch transactions', {
        cause: error,
      });
    }
  }

  async findAllByUserId(userId: string): Promise<TransactionDocument[]> {
    try {
      return await this.transactionSchema.find({ user: userId });
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
