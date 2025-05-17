import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userSchema: Model<User>) {}

  create(createUserDto: CreateUserDto) {
    return this.userSchema.create({
      ...createUserDto,
      password: bcrypt.hashSync(createUserDto.password, 10),
    });
  }

  findAll() {
    return this.userSchema.find();
  }

  findOne(id: string) {
    return this.userSchema.findOne({ id });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: string) {
    return this.userSchema.deleteOne({ _id: id });
  }
}
