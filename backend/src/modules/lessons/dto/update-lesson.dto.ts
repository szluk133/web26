import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';

// Khóa course_id và chapter_id khi cập nhật bài học để đảm bảo tính toàn vẹn cấu trúc
export class UpdateLessonDto extends PartialType(
    OmitType(CreateLessonDto, ['course_id', 'chapter_id'] as const),
) {}