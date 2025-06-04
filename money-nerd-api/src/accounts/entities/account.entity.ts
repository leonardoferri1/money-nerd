import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import crypto from 'crypto';
import { User, UserDocument } from 'src/users/entities/user.entity';

export type AccountDocument = HydratedDocument<Account>;

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  },
})
export class Account {
  @Prop({ default: () => crypto.randomUUID() })
  _id: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop({ nullable: false, unique: true })
  name?: string;

  @Prop({ type: String, ref: User.name })
  user?: UserDocument | string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
