import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import crypto from 'crypto';
import { User, UserDocument } from 'src/users/entities/user.entity';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  },
})
export class Category {
  @Prop({ default: () => crypto.randomUUID() })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: User.name })
  user?: UserDocument | string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
