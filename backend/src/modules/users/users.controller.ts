import { Controller, Get, Body, Patch, Param, UseGuards, Request, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/role/roles.guard';
import { Roles } from '@/auth/role/roles.decorator';
import { Role } from '@/auth/role/roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy profile cá nhân (Bất kỳ user nào đăng nhập)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user._id);
  }

  // API ĐỔI ROLE (CỐT LÕI): Phân quyền chặt chẽ CHỈ ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // <--- Chốt chặn ở đây
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  // --- CÁC API CŨ ĐƯỢC GIỮ LẠI ---

  // Đổi thông tin cá nhân
  @UseGuards(JwtAuthGuard)
  @Patch('profile/update')
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user._id, updateData);
  }

  // Gửi lại mã kích hoạt
  @Post('retry-activate')
  async retryActivate(@Body('email') email: string) {
    return this.usersService.retryActivate(email);
  }

  // Yêu cầu quên mật khẩu
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.usersService.processForgotPassword(email);
  }
}