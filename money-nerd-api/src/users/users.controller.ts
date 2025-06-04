import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UserPresenter } from './user.presenter';
import { AuthGuard } from 'src/auth/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { RequestWithUser } from 'src/auth/types/request-with-user';

@Throttle({ default: { limit: 10, ttl: 30000 } })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserPresenter(user));
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async findOne(@Req() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user._id);
    return new UserPresenter(user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Patch('password-reset')
  async passwordReset(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.usersService.resetPassword(email, code, newPassword);
    return { message: 'Password updated successfully.' };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('password-reminder')
  async sendPasswordReminder(@Body('email') email: string) {
    await this.usersService.passwordResetCode(email);
    return { message: 'Password reset code has been sent.' };
  }

  @Post('resend-email')
  async resendEmail(@Body() body: { email: string }) {
    return await this.usersService.resendEmailVerification(body.email);
  }
}
