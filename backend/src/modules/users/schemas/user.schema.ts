import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '@/auth/role/roles.enum';

export type UserDocument = User & Document;

// Định nghĩa sub-document cho profile
class UserProfile {
    @Prop({ type: String, text: true })
    full_name: string;

    @Prop({ type: String, default: '' })
    avatar: string;

    @Prop({ type: String, text: true, default: '' })
    bio: string;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string;

    // Mặc định luôn là student theo yêu cầu. Admin mới có quyền đổi.
    @Prop({ required: true, enum: Role, default: Role.STUDENT })
    role: string;

    @Prop({ type: UserProfile, default: () => ({}) })
    profile: UserProfile;

    @Prop({ required: true, enum: ['active', 'banned', 'inactive'], default: 'inactive' })
    status: string;

    // Các trường phục vụ các API cũ (kích hoạt, quên mật khẩu...)
    @Prop({ type: String, default: null })
    activationToken: string;

    @Prop({ type: String, default: null })
    resetPasswordToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);