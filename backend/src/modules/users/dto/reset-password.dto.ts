import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Token không được để trống' })
    token: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(3, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
    password: string;
}