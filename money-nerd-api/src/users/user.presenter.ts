import { User } from './entities/user.entity';

export class UserPresenter {
  constructor(private asset: User) {}

  toJSON() {
    return {
      _id: this.asset._id,
      name: this.asset.name,
      email: this.asset.email,
    };
  }
}
