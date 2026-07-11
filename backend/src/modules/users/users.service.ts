import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '@/auth/role/roles.enum';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailerService: MailerService
  ) {}

  // Tạo user mới (Ép cứng role STUDENT)
  async create(createUserDto: any): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Sinh mã token kích hoạt ngẫu nhiên
    const activationToken = crypto.randomBytes(32).toString('hex');

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: Role.STUDENT, // ÉP CỨNG: Bất chấp client gửi role gì, luôn khởi tạo là student
      isActivate: false, // Mặc định tài khoản mới tạo là false
      activationToken: activationToken,
    });
    
    const savedUser = await createdUser.save();
    await this.mailerService.sendMail({
      to: savedUser.email,
      subject: 'Kích hoạt tài khoản @hoidanit',
      template: 'register',
      context: {
        name: savedUser.profile?.full_name || savedUser.email,
        activationCode: activationToken,
      },
    });    
    return savedUser;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
      return this.userModel.findById(id).select('email role profile isActivate').exec();
  }

  // API ĐỔI QUYỀN (CHỈ DÀNH CHO ADMIN)
  async updateRole(id: string, newRole: Role): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true }
    ).select('email role profile isActivate');

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
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User không tồn tại');
    if (user.isActivate || user.status === 'active') {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    user.activationToken = newToken;
    await user.save();

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Mã kích hoạt tài khoản mới',
      template: 'register',
      context: {
        name: user.profile?.full_name || user.email,
        activationCode: newToken,
      },
    });

    return {
      message: 'Đã gửi lại mã kích hoạt thành công. Vui lòng kiểm tra email.',
    };
  }

  // API Kích hoạt tài khoản (bổ sung để hoàn thiện luồng verify)
  async activateAccount(token: string): Promise<any> {
    const user = await this.userModel.findOne({ activationToken: token }).exec();
    if (!user) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn.');
    }
    if (user.isActivate) {
      throw new BadRequestException('Tài khoản đã được kích hoạt từ trước.');
    }

    user.isActivate = true;
    user.activationToken = null; // Xóa token sau khi dùng xong để bảo mật
    user.status = 'active'; // Đồng bộ với trường status cũ của DB
    await user.save();

    return { message: 'Kích hoạt tài khoản thành công. Bạn có thể đăng nhập.' };
  }

  async processForgotPassword(email: string): Promise<any> {
      const user = await this.findByEmail(email);
      if (!user) throw new NotFoundException('Email không tồn tại trong hệ thống');

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      await user.save();

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu @hoidanit',
        template: 'reset-password',  // ✅ Sử dụng template
        context: {
          name: user.profile?.full_name || user.email,
          resetToken: resetToken,
        },
      });

      return {
        message: 'Vui lòng kiểm tra email để đặt lại mật khẩu.',
      };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<any> {
    const user = await this.userModel.findOne({ resetPasswordToken: resetToken }).exec();
    if (!user) {
      throw new BadRequestException('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null; // Xóa token sau khi dùng xong
    await user.save();

    return { message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.' };
  }
}