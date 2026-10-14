import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateChapterDto } from './create-chapter.dto';

// Không cho phép thay đổi course_id của chương đã tạo
export class UpdateChapterDto extends PartialType(
    OmitType(CreateChapterDto, ['course_id'] as const),
) {}