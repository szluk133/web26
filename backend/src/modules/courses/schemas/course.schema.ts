import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    instructor_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category_id: Types.ObjectId;

    @Prop({ required: true })
    price: number;

    @Prop()
    thumbnail: string;

    @Prop({ enum: ['draft', 'reviewing', 'published'], default: 'draft' })
    status: string;

    // Denormalized object đồng bộ từ collection reviews (theo đặc tả v3)
    @Prop({
        type: Object,
        default: { average_rating: 0, total_reviews: 0 },
    })
    rating_summary: {
        average_rating: number;
        total_reviews: number;
    };

    // Áp dụng soft-delete theo đặc tả hạ tầng vận hành (v3)
    @Prop({ default: false })
    is_deleted: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);