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
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private accountSchema: Model<Account>,
    private transactionsService: TransactionsService,
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

  async getAccountsSummaryByPeriod(userId: string) {
    try {
      const [accounts, transactions] = await Promise.all([
        this.findAll(userId),
        this.transactionsService.findAllByUserId(userId),
      ]);

      const summaryByAccount = transactions.reduce(
        (acc, tx) => {
          const accountId =
            typeof tx.account === 'string'
              ? tx.account
              : (tx.account as { _id: string })?._id;

          if (!accountId) return acc;

          const date = new Date(tx.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;

          if (!acc[accountId]) acc[accountId] = {};
          if (!acc[accountId][year]) acc[accountId][year] = {};
          if (!acc[accountId][year][month])
            acc[accountId][year][month] = { totalIncome: 0, totalOutcome: 0 };

          if (tx.type === TransactionType.Income) {
            acc[accountId][year][month].totalIncome += tx.value;
          } else if (tx.type === TransactionType.Outcome) {
            acc[accountId][year][month].totalOutcome += tx.value;
          }

          return acc;
        },
        {} as Record<
          string,
          Record<
            number,
            Record<number, { totalIncome: number; totalOutcome: number }>
          >
        >,
      );

      return accounts.map((account) => {
        const accountSummary = summaryByAccount[account._id.toString()] || {};

        const transactionsByYear = Object.entries(accountSummary).map(
          ([year, months]) => ({
            year: +year,
            months: Object.entries(months).map(([month, totals]) => ({
              month: +month,
              totalIncome: totals.totalIncome,
              totalOutcome: totals.totalOutcome,
              balance: totals.totalIncome - totals.totalOutcome,
            })),
          }),
        );

        return {
          _id: account._id,
          name: account.name,
          description: account.description,
          transactionsByYear,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to summarize transactions by year/month',
        { cause: error },
      );
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
