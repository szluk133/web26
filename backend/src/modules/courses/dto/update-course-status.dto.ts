import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateCourseStatusDto {
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    @IsString()
    @IsIn(['draft', 'reviewing', 'published'], { 
        message: 'Trạng thái phải là draft, reviewing hoặc published' 
    })
    status: string;
}