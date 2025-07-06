import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryPresenter } from './category.presenter';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { AuthGuard } from 'src/auth/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ExpenseCategorySummary } from './interfaces/category-summary.type';

@Throttle({ default: { limit: 10, ttl: 30000 } })
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const category = await this.categoriesService.create(
      createCategoryDto,
      req.user._id,
    );
    return new CategoryPresenter(category);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const categories = await this.categoriesService.findAll(req.user._id);
    return categories.map((category) => new CategoryPresenter(category));
  }

  @Get('summary')
  async getSummary(
    @Req() req: RequestWithUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<ExpenseCategorySummary[]> {
    const summary = await this.categoriesService.getExpenseSummary(
      req.user._id,
      month,
      year,
    );
    return summary;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const category = await this.categoriesService.findOne(id, req.user._id);
    return new CategoryPresenter(category);
  }

  //   @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return this.categoryService.update(+id, updateCategoryDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.categoriesService.remove(id, req.user._id);
  }
}
