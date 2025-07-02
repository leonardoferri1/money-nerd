import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'src/users/types/mongo-error';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categorySchema: Model<Category>,
    @InjectModel(Transaction.name)
    private readonly transactionSchema: Model<Transaction>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      return await this.categorySchema.create({
        ...createCategoryDto,
        user: userId,
      });
    } catch (error: unknown) {
      const err = error as MongoError;

      if (err.code === 11000) {
        throw new ConflictException(
          'A category with this name already exists.',
        );
      }

      throw new InternalServerErrorException('Failed to create new category', {
        cause: error,
      });
    }
  }

  async findAll(userId: string) {
    try {
      return await this.categorySchema.find({ user: userId });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories', {
        cause: error,
      });
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const category = await this.categorySchema.findOne({
        _id: id,
        user: userId,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the category');
    }
  }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  async remove(id: string, userId: string) {
    try {
      const isUsed = await this.transactionSchema.exists({ category: id });

      if (isUsed) {
        throw new BadRequestException(
          'It is not possible to delete the category as it is being used by an existing transaction.',
        );
      }

      const result = await this.categorySchema.deleteOne({
        _id: id,
        user: userId,
      });

      if (result.deletedCount === 0) {
        throw new NotFoundException('Category not found or already deleted.');
      }

      return { deleted: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error on deleting category.');
    }
  }
}
