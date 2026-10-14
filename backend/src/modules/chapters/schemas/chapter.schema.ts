import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema({ timestamps: true })
export class Chapter {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    course_id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, default: 1 })
    order: number;

    @Prop({ default: false })
    is_deleted: boolean;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

// Compound Index tối ưu hóa việc truy vấn danh sách chương theo thứ tự
ChapterSchema.index({ course_id: 1, order: 1 });