import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

export enum LessonType {
    VIDEO = 'video',
    TEXT = 'text',
    QUIZ = 'quiz',
}

export enum QuizQuestionType {
    SINGLE = 'single',
    MULTIPLE = 'multiple',
}

@Schema({ _id: false })
export class QuizItem {
    @Prop({ required: true, trim: true })
    question: string;

    @Prop({ required: true, enum: QuizQuestionType, default: QuizQuestionType.SINGLE })
    type: QuizQuestionType;

    @Prop({ type: [String], required: true })
    options: string[];

    @Prop({ type: [Number], required: true })
    correct_answer: number[];

    @Prop({ trim: true, default: '' })
    explanation?: string;
}

export const QuizItemSchema = SchemaFactory.createForClass(QuizItem);

@Schema({ _id: false })
export class LessonContent {
    @Prop({ trim: true })
    video_url?: string;

    @Prop({ default: 0 })
    duration?: number; // Đơn vị: giây

    @Prop({ trim: true })
    body_text?: string;

    @Prop({ type: [QuizItemSchema], default: [] })
    quiz_data?: QuizItem[];
}

export const LessonContentSchema = SchemaFactory.createForClass(LessonContent);

@Schema({ timestamps: true })
export class Lesson {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    course_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Chapter', required: true, index: true })
    chapter_id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, default: 1 })
    order: number;

    @Prop({ required: true, enum: LessonType })
    lesson_type: LessonType;

    @Prop({ default: false })
    is_free_preview: boolean;

    @Prop({ type: LessonContentSchema, required: true })
    content: LessonContent;

    @Prop({ default: false })
    is_deleted: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Compound Index theo đặc tả kỹ thuật v3: tối ưu hóa truy xuất và xếp thứ tự bài học trong chương
LessonSchema.index({ course_id: 1, chapter_id: 1, order: 1 });