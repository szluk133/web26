import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Slug không được để trống' })
    @IsString()
    slug: string;

    @IsOptional()
    @IsMongoId({ message: 'Parent ID phải là một ObjectId hợp lệ' })
    parent_id?: string;
}