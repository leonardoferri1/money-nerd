import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import crypto from 'crypto';
import { TransactionType } from '../enums/transaction-type.enum';
import { CategoryDocument } from 'src/categories/entities/category.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { AccountDocument } from 'src/accounts/entities/account.entity';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  },
})
export class Transaction {
  @Prop({ default: () => crypto.randomUUID() })
  _id: string;

  @Prop({
    type: Number,
    enum: TransactionType,
    required: true,
    index: true,
  })
  type: TransactionType;

  @Prop({ nullable: true })
  description?: string;

  @Prop()
  date: Date;

  @Prop({ required: true })
  value: number;

  @Prop({ default: false })
  isCreditCard: boolean;

  @Prop({ default: true })
  wasPaid: boolean;

  @Prop({ type: String, ref: 'Category', nullable: true })
  category?: CategoryDocument | string;

  @Prop({ type: String, ref: 'Account', nullable: true })
  account?: AccountDocument | string;

  @Prop({ type: String, ref: User.name, required: true })
  user?: UserDocument | string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
