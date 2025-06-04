import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
// import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { AccountPresenter } from './account.presenter';

@Throttle({ default: { limit: 10, ttl: 30000 } })
@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @Req() req: RequestWithUser,
  ) {
    const account = await this.accountsService.create(
      createAccountDto,
      req.user._id,
    );
    return new AccountPresenter(account);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const accounts = await this.accountsService.findAll(req.user._id);
    return accounts.map((account) => new AccountPresenter(account));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const account = await this.accountsService.findOne(id, req.user._id);
    return new AccountPresenter(account);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
  //   return this.accountsService.update(+id, updateAccountDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.accountsService.remove(id, req.user._id);
  }
}
