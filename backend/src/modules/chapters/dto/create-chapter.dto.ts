import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateChapterDto {
    @IsNotEmpty({ message: 'course_id không được để trống' })
    @IsMongoId({ message: 'course_id phải đúng định dạng MongoDB ObjectId' })
    course_id: string;

    @IsNotEmpty({ message: 'Tiêu đề chương không được để trống' })
    @IsString({ message: 'Tiêu đề chương phải là chuỗi ký tự' })
    @MinLength(3, { message: 'Tiêu đề chương phải có ít nhất 3 ký tự' })
    title: string;

    @IsOptional()
    @IsNumber({}, { message: 'Thứ tự chương phải là số' })
    @IsPositive({ message: 'Thứ tự chương phải lớn hơn 0' })
    order?: number;
}