import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model } from 'mongoose';
import {
  MonthlySummary,
  WealthGrowthSummary,
} from './interfaces/monthly-summary.type';

@Injectable()
export class TransactionsSummaryService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionSchema: Model<Transaction>,
  ) {}

  async getYearlySummary(
    userId: string,
    year: number,
    accountId?: string,
  ): Promise<MonthlySummary[]> {
    const match: Record<string, unknown> = {
      user: userId,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    };

    if (accountId) {
      match.account = accountId;
    }

    const result: MonthlySummary[] = await this.transactionSchema
      .aggregate<MonthlySummary>([
        { $match: match },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$value' },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            totals: {
              $push: {
                type: '$_id.type',
                total: '$total',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            incomes: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$totals',
                      as: 't',
                      cond: { $eq: ['$$t.type', 1] },
                    },
                  },
                  as: 'income',
                  in: '$$income.total',
                },
              },
            },
            expenses: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$totals',
                      as: 't',
                      cond: { $eq: ['$$t.type', 2] },
                    },
                  },
                  as: 'expense',
                  in: '$$expense.total',
                },
              },
            },
          },
        },
        { $sort: { month: 1 } },
      ])
      .exec();

    return result;
  }

  async getWealthGrowth(
    userId: string,
    year: number,
    accountId?: string,
  ): Promise<WealthGrowthSummary> {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const matchBase: Record<string, unknown> = { user: userId };
    if (accountId) matchBase.account = accountId;

    const previousBalanceResult = await this.transactionSchema
      .aggregate<{ balance: number }>([
        { $match: { ...matchBase, date: { $lt: startOfYear } } },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 1] },
                  '$value',
                  { $multiply: ['$value', -1] },
                ],
              },
            },
          },
        },
      ])
      .exec();

    let balance = previousBalanceResult[0]?.balance ?? 0;

    type MonthlyAggregate = {
      month: number;
      incomes: number;
      expenses: number;
    };

    const monthlyTransactions = await this.transactionSchema
      .aggregate<MonthlyAggregate>([
        {
          $match: {
            ...matchBase,
            date: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: '$date' }, type: '$type' },
            total: { $sum: '$value' },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            totals: {
              $push: {
                type: '$_id.type',
                total: '$total',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            incomes: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$totals',
                      as: 't',
                      cond: { $eq: ['$$t.type', 1] },
                    },
                  },
                  as: 'income',
                  in: '$$income.total',
                },
              },
            },
            expenses: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$totals',
                      as: 't',
                      cond: { $eq: ['$$t.type', 2] },
                    },
                  },
                  as: 'expense',
                  in: '$$expense.total',
                },
              },
            },
          },
        },
        { $sort: { month: 1 } },
      ])
      .exec();

    const monthly: { month: number; balance: number }[] = [];
    let totalIncomes = 0;
    let totalExpenses = 0;

    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyTransactions.find((m) => m.month === i);
      const incomes = monthData?.incomes ?? 0;
      const expenses = monthData?.expenses ?? 0;

      totalIncomes += incomes;
      totalExpenses += expenses;

      balance += incomes - expenses;

      monthly.push({ month: i, balance });
    }

    return {
      monthly,
      totalIncomes,
      totalExpenses,
      finalBalance: balance,
    };
  }
}
