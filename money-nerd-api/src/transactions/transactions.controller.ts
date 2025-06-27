import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionPresenter } from './transaction.presenter';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
@SkipThrottle()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() createTransactionsDto: CreateTransactionDto[],
    @Req() req: RequestWithUser,
  ) {
    const transactions = await this.transactionsService.create(
      createTransactionsDto,
      req.user._id,
    );
    return transactions.map((t) => new TransactionPresenter(t));
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: FilterTransactionsDto,
  ) {
    const { transactions, summary } = await this.transactionsService.findAll(
      req.user._id,
      query,
    );

    const presentedTransactions = transactions.map(
      (transaction) => new TransactionPresenter(transaction),
    );

    return {
      transactions: presentedTransactions,
      summary,
    };
  }

  @Get('recurring')
  async findRecurring(@Req() req: RequestWithUser) {
    const transactions = await this.transactionsService.findRecurring(
      req.user._id,
    );
    return transactions.map(
      (transaction) => new TransactionPresenter(transaction),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const transaction = await this.transactionsService.findOne(
      id,
      req.user._id,
    );
    return new TransactionPresenter(transaction);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Req() req: RequestWithUser,
  ) {
    const transaction = await this.transactionsService.update(
      id,
      dto,
      req.user._id,
    );
    return new TransactionPresenter(transaction);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.remove(id, req.user._id);
  }
}
