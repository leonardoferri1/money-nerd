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
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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

  async processFile(
    uploadedFile: Express.Multer.File,
  ): Promise<ParsedTransaction[]> {
    try {
      const ext = path.extname(uploadedFile.originalname).toLowerCase();

      if (ext === '.pdf') {
        return await this.processPdf(uploadedFile.buffer);
      } else if (ext === '.csv') {
        return await this.processCsv(uploadedFile.buffer);
      } else {
        throw new BadRequestException('Unsupported file format');
      }
    } catch (error) {
      throw new BadRequestException(
        'Error processing file. Check format and content',
        {
          cause: error,
        },
      );
    }
  }

  private async processPdf(buffer: Buffer): Promise<ParsedTransaction[]> {
    try {
      const data = await pdfParse(buffer);
      const texto = data.text;
      const linhas = texto.split('\n');
      const transactions: ParsedTransaction[] = [];

      let dataAtual = '';

      for (const linha of linhas) {
        const matchItaú = linha.match(
          /^(\d{2}\/\d{2}\/\d{4}) (.+?) (-?\d+,\d{2})$/,
        );
        if (matchItaú) {
          const [, dataStr, descricao, valorStr] = matchItaú;
          const valor = this.parseValue(valorStr);

          transactions.push({
            date: this.parseDate(dataStr),
            value: Math.abs(valor),
            type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
            description: descricao.trim(),
          });
          continue;
        }

        const dataMatch = linha.match(/^(\d{1,2} de \w+ de \d{4})/);
        if (dataMatch) {
          dataAtual = this.converterExtenseDate(dataMatch[1]);
          continue;
        }

        const matchInter = linha.match(/^(.*?): "(.*?)" (-?R\$ [\d.,]+)/);
        if (dataAtual && matchInter) {
          const [, , descricao, valorStr] = matchInter;
          const valor = this.parseValue(valorStr.replace('R$', ''));

          transactions.push({
            date: this.parseDate(dataAtual),
            value: Math.abs(valor),
            type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
            description: descricao.trim(),
          });
        }
      }

      return transactions;
    } catch (error) {
      throw new BadRequestException('Unable to process uploaded PDF', {
        cause: error,
      });
    }
  }

  private async processCsv(buffer: Buffer): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    try {
      const tmpFile = path.join(os.tmpdir(), `extrato-${Date.now()}.csv`);
      fs.writeFileSync(tmpFile, buffer);

      return await new Promise<ParsedTransaction[]>((resolve, reject) => {
        fs.createReadStream(tmpFile)
          .pipe(csvParser())
          .on('data', (row: Record<string, string>) => {
            try {
              const dataStr = (row['Data Lançamento'] || row['Data]'])?.trim();
              const valorStr = row['Valor'];
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
            } catch (innerError) {
              console.warn('Error processing CSV line:', innerError);
            }
          })
          .on('end', () => {
            fs.unlinkSync(tmpFile);
            resolve(transactions);
          })
          .on('error', (err: Error) => {
            fs.unlinkSync(tmpFile);
            reject(err);
          });
      });
    } catch (error) {
      throw new BadRequestException('Unable to process uploaded CSV', {
        cause: error,
      });
    }
  }

  private parseValue(valueStr: string): number {
    return parseFloat(valueStr.replace('.', '').replace(',', '.'));
  }

  private parseDate(dateStr: string): Date {
    const partes = dateStr.split('/');
    if (partes.length === 3) {
      return new Date(+partes[2], +partes[1] - 1, +partes[0]);
    }
    return new Date(dateStr);
  }

  private converterExtenseDate(date: string): string {
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

    const match = date.match(/^(\d{1,2}) de (\w+) de (\d{4})$/i);
    if (!match) return date;

    const [, dia, mesExt, ano] = match;
    const mes = meses[mesExt.toLowerCase()] ?? '01';
    return `${dia.padStart(2, '0')}/${mes}/${ano}`;
  }
}
