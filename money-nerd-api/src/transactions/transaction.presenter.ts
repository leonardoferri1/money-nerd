import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';

export class TransactionPresenter {
  constructor(private transaction: Transaction) {}

  toJSON() {
    return {
      _id: this.transaction._id,
      type: TransactionType[this.transaction.type],
      description: this.transaction.description,
      date: this.transaction.date,
      value: this.transaction.value,
      category: this.transaction.category,
      account: this.transaction.account,
    };
  }
}
