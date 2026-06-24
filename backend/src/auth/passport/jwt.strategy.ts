import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        // Hỗ trợ cả 2 phương thức theo tài liệu kỹ thuật:
        // 1. Lấy từ HttpOnly Cookie (Bảo mật Web chống XSS)
        // 2. Fallback lấy từ Header Bearer (Hỗ trợ Mobile App)
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request: Request) => {
            let data = request?.cookies?.['access_token'];
            if (!data) {
                data = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
            }
            return data;
            },
        ]),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET || 'your_super_secret_key', // Thay bằng biến môi trường thực tế
        });
    }

    async validate(payload: any) {
        // Payload trả về sẽ được gắn vào request.user
        return { _id: payload.sub, email: payload.email, role: payload.role };
    }
}