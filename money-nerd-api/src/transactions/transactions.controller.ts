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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionPresenter } from './transaction.presenter';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetYearlySummaryDto } from './dto/get-yearly-summary.dto';
import { TransactionsSummaryService } from './transactions-summary.service';
import { TransactionsFileHandlerService } from './transactions-file-handler.service';
import { WealthGrowthSummaryDto } from './dto/monthly-balance.dto';
@SkipThrottle()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsSummaryService: TransactionsSummaryService,
    private readonly transactionsFileHandlerService: TransactionsFileHandlerService,
  ) {}

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

  @Post('importar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importarExtrato(@UploadedFile() file: Express.Multer.File) {
    const transactions =
      await this.transactionsFileHandlerService.processFile(file);
    return transactions;
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

  @Get('yearly-summary')
  async getYearlySummary(
    @Query() query: GetYearlySummaryDto,
    @Req() req: RequestWithUser,
  ) {
    const result = await this.transactionsSummaryService.getYearlySummary(
      req.user._id,
      query.year,
      query.accountId,
    );
    return result;
  }

  @Get('wealth-growth-summary')
  async getWealthGrowth(
    @Query() query: GetYearlySummaryDto,
    @Req() req: RequestWithUser,
  ): Promise<WealthGrowthSummaryDto> {
    return this.transactionsSummaryService.getWealthGrowth(
      req.user._id,
      query.year,
      query.accountId,
    );
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
