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
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';
import { ExpenseCategorySummary } from './interfaces/category-summary.type';

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

  async getExpenseSummary(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<ExpenseCategorySummary[]> {
    try {
      const match: Record<string, unknown> = {
        user: userId,
        type: TransactionType.Outcome,
      };

      if (year) {
        match.date = {
          $gte: new Date(year, (month ?? 1) - 1, 1),
          $lt: month ? new Date(year, month, 1) : new Date(year + 1, 0, 1),
        };
      }

      const summary =
        await this.transactionSchema.aggregate<ExpenseCategorySummary>([
          { $match: match },
          {
            $group: {
              _id: '$category',
              total: { $sum: '$value' },
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          {
            $project: {
              categoryId: '$_id',
              name: '$category.name',
              color: '$category.color',
              icon: '$category.icon',
              total: 1,
              _id: 0,
            },
          },
        ]);

      return summary;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch summary', {
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
