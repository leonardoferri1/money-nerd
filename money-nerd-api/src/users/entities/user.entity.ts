import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import crypto from 'crypto';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  },
})
export class User {
  @Prop({ default: () => crypto.randomUUID() })
  _id: string;

  @Prop()
  name: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop({ maxlength: 300 })
  password: string;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
