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
  readonly _id: string;

  @Prop({ maxlength: 75 })
  readonly description?: string;

  @Prop({ maxlength: 25, required: true })
  readonly name?: string;

  @Prop({ type: String, ref: User.name, required: true })
  readonly user?: UserDocument | string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.index({ name: 1, user: 1 }, { unique: true });
