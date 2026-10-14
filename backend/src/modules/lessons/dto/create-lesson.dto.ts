import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsIn,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LessonType, QuizQuestionType } from '../schemas/lesson.schema';

export class QuizItemDto {
    @IsNotEmpty({ message: 'Câu hỏi quiz không được để trống' })
    @IsString({ message: 'Câu hỏi quiz phải là chuỗi' })
    question: string;

    @IsNotEmpty({ message: 'Loại câu hỏi không được để trống' })
    @IsEnum(QuizQuestionType, { message: 'type phải là single hoặc multiple' })
    type: QuizQuestionType;

    @IsArray({ message: 'options phải là một mảng' })
    @IsString({ each: true, message: 'Mỗi phương án lựa chọn phải là chuỗi' })
    options: string[];

    @IsArray({ message: 'correct_answer phải là một mảng chỉ số đáp án đúng' })
    @IsInt({ each: true, message: 'Chỉ số đáp án đúng phải là số nguyên' })
    correct_answer: number[];

    @IsOptional()
    @IsString({ message: 'Lời giải thích phải là chuỗi' })
    explanation?: string;
}

export class LessonContentDto {
    @IsOptional()
    @IsString({ message: 'video_url phải là chuỗi URL' })
    video_url?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Thời lượng (duration) phải là số' })
    @Min(0, { message: 'Thời lượng không được là số âm' })
    duration?: number;

    @IsOptional()
    @IsString({ message: 'Nội dung body_text phải là chuỗi' })
    body_text?: string;

    @IsOptional()
    @IsArray({ message: 'quiz_data phải là mảng câu hỏi' })
    @ValidateNested({ each: true })
    @Type(() => QuizItemDto)
    quiz_data?: QuizItemDto[];
}

export class CreateLessonDto {
    @IsNotEmpty({ message: 'course_id không được để trống' })
    @IsMongoId({ message: 'course_id không đúng định dạng ObjectId' })
    course_id: string;

    @IsNotEmpty({ message: 'chapter_id không được để trống' })
    @IsMongoId({ message: 'chapter_id không đúng định dạng ObjectId' })
    chapter_id: string;

    @IsNotEmpty({ message: 'Tiêu đề bài học không được để trống' })
    @IsString({ message: 'Tiêu đề bài học phải là chuỗi' })
    @MinLength(3, { message: 'Tiêu đề bài học phải có tối thiểu 3 ký tự' })
    title: string;

    @IsOptional()
    @IsNumber({}, { message: 'Thứ tự bài học phải là số' })
    @IsPositive({ message: 'Thứ tự bài học phải là số dương' })
    order?: number;

    @IsNotEmpty({ message: 'lesson_type không được để trống' })
    @IsEnum(LessonType, { message: 'lesson_type phải là video, text hoặc quiz' })
    lesson_type: LessonType;

    @IsOptional()
    @IsBoolean({ message: 'is_free_preview phải là true hoặc false' })
    is_free_preview?: boolean;

    @IsNotEmpty({ message: 'content không được để trống' })
    @ValidateNested()
    @Type(() => LessonContentDto)
    content: LessonContentDto;
}