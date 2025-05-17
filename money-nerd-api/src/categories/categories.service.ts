import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categorySchema: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.categorySchema.create({ ...createCategoryDto, user: userId });
  }

  findAll(userId: string) {
    return this.categorySchema.find({
      user: userId,
    });
  }

  findOne(id: string, userId: string) {
    return this.categorySchema.findOne({ id, user: userId });
  }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  remove(id: string, userId: string) {
    return this.categorySchema.deleteOne({ _id: id, user: userId });
  }
}
