import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId, Min } from 'class-validator';

export class CreateCourseDto {
    @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
    @IsString()
    title: string;

    @IsNotEmpty({ message: 'Slug không được để trống' })
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty({ message: 'Category ID không được để trống' })
    @IsMongoId({ message: 'Category ID phải là một ObjectId hợp lệ' })
    category_id: string;

    @IsNotEmpty({ message: 'Giá tiền không được để trống' })
    @IsNumber({}, { message: 'Giá tiền phải là một con số' })
    @Min(0, { message: 'Giá tiền không được âm' })
    price: number;

    @IsOptional()
    @IsString()
    thumbnail?: string;
}