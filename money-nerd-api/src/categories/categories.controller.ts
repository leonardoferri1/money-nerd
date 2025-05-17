import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryPresenter } from './category.presenter';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const category = await this.categoriesService.findOne(id, req.user._id);
    return new CategoryPresenter(category!);
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
