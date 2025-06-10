import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import crypto from 'crypto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { TransactionDocument } from 'src/transactions/entities/transaction.entity';

export type RecurringTransactionDocument =
  HydratedDocument<RecurringTransaction>;

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  },
})
export class RecurringTransaction {
  @Prop({ default: () => crypto.randomUUID() })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: 'Transaction', nullable: true })
  transaction?: TransactionDocument | string;

  @Prop({ type: String, ref: User.name, required: true })
  user?: UserDocument | string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RecurringTransactionSchema =
  SchemaFactory.createForClass(RecurringTransaction);

RecurringTransactionSchema.index({ name: 1, user: 1 }, { unique: true });
