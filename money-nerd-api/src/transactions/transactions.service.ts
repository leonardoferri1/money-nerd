import {
  BadRequestException,
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
import { ParsedTransaction } from './interfaces/parsed-transaction.type';
import pdfParse from 'pdf-parse';
import csvParser from 'csv-parser';
import * as path from 'path';
import { Readable } from 'stream';
import { MonthlySummary } from './interfaces/monthly-summary.type';

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
      if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
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

  async processFile(
    uploadedFile: Express.Multer.File,
  ): Promise<ParsedTransaction[]> {
    try {
      const ext = path.extname(uploadedFile.originalname).toLowerCase();
      const fileName = uploadedFile.originalname.toLowerCase();

      if (ext === '.pdf') {
        if (fileName.includes('itau')) {
          return await this.processItauPdf(uploadedFile.buffer);
        } else {
          return await this.processInterPdf(uploadedFile.buffer);
        }
      } else if (ext === '.csv') {
        return await this.processInterCsv(uploadedFile.buffer);
      } else {
        throw new BadRequestException('Unsupported file format');
      }
    } catch (error) {
      throw new BadRequestException('Error processing file.', { cause: error });
    }
  }

  private async processItauPdf(buffer: Buffer): Promise<ParsedTransaction[]> {
    const data = await pdfParse(buffer);
    const linhas = data.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const transactions: ParsedTransaction[] = [];

    for (const linha of linhas) {
      const match = linha.match(
        /^(\d{2}\/\d{2}\/\d{4})(.*?)(-?\d{1,3}(?:\.\d{3})*,\d{2})$/,
      );
      if (match) {
        const [, dataStr, descricao, valorStr] = match;
        const valor = this.parseValue(valorStr);
        transactions.push({
          date: this.parseDate(dataStr),
          value: Math.abs(valor),
          type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
          description: descricao.replace(/\d{2}\/\d{2}/g, '').trim(),
        });
      }
    }

    return transactions;
  }

  private async processInterPdf(buffer: Buffer): Promise<ParsedTransaction[]> {
    const data = await pdfParse(buffer);
    const linhas = data.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const transactions: ParsedTransaction[] = [];

    let dataAtual: string | null = null;

    for (let linha of linhas) {
      linha = linha.replace(/-R\$ ([\d.,]+)R\$ .*/, '-$1');
      const dataMatch = linha.match(/^(\d{1,2} de \w+ de \d{4})/i);
      if (dataMatch) {
        dataAtual = this.converterExtenseDate(dataMatch[1]);
        continue;
      }

      const match = linha.match(/^[^:]+:\s+"(.*?)"\s*(-?R?\$?\s*[\d.,]+)/);

      if (dataAtual && match) {
        const [, descricao, valorStrRaw] = match;
        const valorStr = valorStrRaw.replace(/[R$\s]/g, '');
        const valor = this.parseValue(valorStr);

        transactions.push({
          date: this.parseDate(dataAtual),
          value: Math.abs(valor),
          type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
          description: descricao.trim(),
        });
      }
    }

    return transactions;
  }

  private async processInterCsv(buffer: Buffer): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    try {
      const raw = buffer.toString('utf-8');

      const lines = raw.split('\n');
      const startIndex = lines.findIndex(
        (line) => line.includes('Data Lançamento') || line.includes('Data'),
      );

      if (startIndex === -1) {
        throw new BadRequestException('Cabeçalho do CSV não encontrado.');
      }

      const csvLines = lines.slice(startIndex);
      const csvData = csvLines.join('\n');

      return await new Promise<ParsedTransaction[]>((resolve, reject) => {
        Readable.from([csvData])
          .pipe(
            csvParser({
              separator: ';',
              mapHeaders: ({ header }) => header.trim(),
            }),
          )
          .on('data', (row: Record<string, string>) => {
            try {
              const dataStr = (row['Data Lançamento'] || row['Data]'])?.trim();
              const valorStr = row['Valor']?.trim();
              const descricao = row['Descrição']?.trim();
              if (dataStr && valorStr) {
                const valor = this.parseValue(valorStr);
                transactions.push({
                  date: this.parseDate(dataStr),
                  value: Math.abs(valor),
                  type:
                    valor >= 0
                      ? TransactionType.Income
                      : TransactionType.Outcome,
                  description: descricao || undefined,
                });
              }
            } catch (err) {
              console.warn('Error processing CSV line:', err);
            }
          })
          .on('end', () => resolve(transactions))
          .on('error', (err) => reject(err));
      });
    } catch (error) {
      throw new BadRequestException('Unable to process uploaded CSV', {
        cause: error,
      });
    }
  }

  private parseValue(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }

  private parseDate(dataStr: string): Date {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  private converterExtenseDate(dataExtenso: string): string {
    const meses: Record<string, string> = {
      janeiro: '01',
      fevereiro: '02',
      março: '03',
      abril: '04',
      maio: '05',
      junho: '06',
      julho: '07',
      agosto: '08',
      setembro: '09',
      outubro: '10',
      novembro: '11',
      dezembro: '12',
    };
    const match = dataExtenso.match(/(\d{1,2}) de (\w+) de (\d{4})/i);
    if (!match) throw new Error('Data inválida: ' + dataExtenso);
    const [, dia, mes, ano] = match;
    const mesNum = meses[mes.toLowerCase()];
    return `${dia.padStart(2, '0')}/${mesNum}/${ano}`;
  }

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
}
