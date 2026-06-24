import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '@/auth/role/roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Tạo user mới (Ép cứng role STUDENT)
  async create(createUserDto: any): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: Role.STUDENT, // ÉP CỨNG: Bất chấp client gửi role gì, luôn khởi tạo là student
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).select('-password').exec();
  }

  // API ĐỔI QUYỀN (CHỈ DÀNH CHO ADMIN)
  async updateRole(id: string, newRole: Role): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }
    return user;
  }

  // --- GIỮ LẠI CÁC API CŨ NHƯ YÊU CẦU ---

  async updateProfile(id: string, updateData: any): Promise<User> {
    // Chỉ cập nhật object profile bên trong
    return this.userModel.findByIdAndUpdate(
      id, 
      { $set: { profile: updateData } }, 
      { new: true }
    ).select('-password');
  }

  async retryActivate(email: string): Promise<any> {
    // Logic tạo lại token kích hoạt và gửi email
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User không tồn tại');
    if (user.status === 'active') throw new BadRequestException('Tài khoản đã được kích hoạt');
    
    // Todo: Tạo token mới, save DB, bắn Email
    return { message: 'Đã gửi lại email kích hoạt thành công.' };
  }

  async processForgotPassword(email: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại trong hệ thống');
    
    // Todo: Sinh token quên mật khẩu, save DB, bắn Email
    return { message: 'Vui lòng kiểm tra email để đặt lại mật khẩu.' };
  }
}