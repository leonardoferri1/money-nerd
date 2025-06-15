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

  @Prop()
  color: string;

  @Prop()
  icon: string;

  @Prop({ type: String, ref: User.name, required: true })
  user?: UserDocument | string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ name: 1, user: 1 }, { unique: true });
