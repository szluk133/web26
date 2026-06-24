import { Controller, Post, Body, Res, UseGuards, Request, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  @Post('login')
  async login(@Body() loginDto: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    
    // Tạo token
    const tokenData = await this.authService.login(user);

    // XỬ LÝ THEO TÀI LIỆU KỸ THUẬT: TRẢ VỀ HTTP ONLY COOKIE CHỐNG XSS
    res.cookie('access_token', tokenData.access_token, {
      httpOnly: true, // Trình duyệt không thể truy cập bằng JavaScript
      secure: process.env.NODE_ENV === 'production', // True nếu chạy trên HTTPS
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      message: 'Đăng nhập thành công',
      user: tokenData.user,
      // Vẫn có thể trả về token ở body để dự phòng cho Mobile App tự lưu (nếu cần)
      access_token: tokenData.access_token 
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Xóa cookie khi đăng xuất
    res.clearCookie('access_token');
    return { message: 'Đăng xuất thành công' };
  }
}