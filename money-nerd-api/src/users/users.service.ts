import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userSchema: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.userSchema.create({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user', {
        cause: error,
      });
    }
  }

  async findAll() {
    try {
      return await this.userSchema.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userSchema.findOne({
        _id: id,
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch the user');
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: string) {
    try {
      const result = await this.userSchema.deleteOne({
        _id: id,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException('User not found or already deleted');
      }
      return { deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
