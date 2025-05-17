import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionSchema: Model<Transaction>,
  ) {}

  async create(createTransactionsDto: CreateTransactionDto[], userId: string) {
    const converted = createTransactionsDto.map((dto) => ({
      ...dto,
      date: new Date(dto.date),
      user: userId,
    }));

    const transactions = await this.transactionSchema.insertMany(converted);
    return this.transactionSchema
      .find({ _id: { $in: transactions.map((t) => t._id) } })
      .populate('category');
  }

  findAll(userId: string) {
    return this.transactionSchema.find({ user: userId }).populate('category');
  }

  findOne(id: string, userId: string) {
    return this.transactionSchema
      .findOne({ id, user: userId })
      .populate('category');
  }

  // update(id: number, updateTransactionDto: UpdateTransactionDto) {
  //   return `This action updates a #${id} transaction`;
  // }

  remove(id: string, userId: string) {
    return this.transactionSchema.deleteOne({ _id: id, user: userId });
  }
}
