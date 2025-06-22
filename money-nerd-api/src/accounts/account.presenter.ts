import { Account } from './entities/account.entity';

export class AccountPresenter {
  constructor(private account: Account) {}

  toJSON() {
    return {
      _id: this.account._id,
      name: this.account.name,
      description: this.account.description,
    };
  }
}
