import { RecurringTransaction } from './entities/recurring-transaction.entity';

export class RecurringTransactionPresenter {
  constructor(private transaction: RecurringTransaction) {}

  toJSON() {
    return {
      _id: this.transaction._id,
      name: this.transaction.name,
      transaction: this.transaction.transaction,
    };
  }
}
