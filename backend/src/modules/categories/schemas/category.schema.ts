import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    slug: string;

    // Liên kết danh mục cha phục vụ thiết lập cây đa cấp (Có thể Null nếu là gốc)
    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parent_id: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);