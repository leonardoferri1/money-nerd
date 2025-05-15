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

  create(createCategoryDto: CreateCategoryDto) {
    return this.categorySchema.create(createCategoryDto);
  }

  findAll() {
    return this.categorySchema.find();
  }

  findOne(id: string) {
    return this.categorySchema.findOne({ id });
  }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  remove(id: number) {
    return this.categorySchema.deleteOne({ id });
  }
}
