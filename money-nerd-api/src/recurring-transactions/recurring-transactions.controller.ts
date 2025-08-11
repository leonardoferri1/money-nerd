import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { SkipThrottle } from '@nestjs/throttler';
import { RecurringTransactionPresenter } from './recurring-transaction.presenter';

@SkipThrottle()
@UseGuards(AuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  async create(
    @Body() createRecurringTransactionDto: CreateRecurringTransactionDto,
    @Req() req: RequestWithUser,
  ) {
    const recurringTransaction = await this.recurringTransactionsService.create(
      createRecurringTransactionDto,
      req.user._id,
    );
    return new RecurringTransactionPresenter(recurringTransaction);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const recurringTransactions =
      await this.recurringTransactionsService.findAll(req.user._id);
    return recurringTransactions.map(
      (recurringTransaction) =>
        new RecurringTransactionPresenter(recurringTransaction),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const recurringTransaction =
      await this.recurringTransactionsService.findOne(id, req.user._id);
    return new RecurringTransactionPresenter(recurringTransaction);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  // ) {
  //   return this.recurringTransactionsService.update(
  //     +id,
  //     updateRecurringTransactionDto,
  //   );
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.recurringTransactionsService.remove(id, req.user._id);
  }
}
