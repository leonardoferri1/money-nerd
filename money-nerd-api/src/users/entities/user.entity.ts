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
  name?: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop({ maxlength: 300 })
  password: string;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ unique: true, sparse: true })
  githubId?: string;

  @Prop({ default: false })
  canLoginWithPassword?: boolean;

  @Prop()
  picture?: string;

  @Prop({ default: 'local' })
  provider?: 'local' | 'google' | 'github';

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  emailVerificationCodeExpires?: Date;

  @Prop()
  passwordResetCode?: string;

  @Prop()
  passwordResetCodeExpires?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
