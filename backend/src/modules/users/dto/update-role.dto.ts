import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@/auth/role/roles.enum';

export class UpdateRoleDto {
    @IsEnum(Role, { message: 'Role phải là: student, instructor hoặc admin' })
    @IsNotEmpty({ message: 'Role không được để trống' })
    role: Role;
}