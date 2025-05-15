import { Category } from './entities/category.entity';

export class CategoryPresenter {
  constructor(private category: Category) {}

  toJSON() {
    return {
      _id: this.category._id,
      name: this.category.name,
    };
  }
}
