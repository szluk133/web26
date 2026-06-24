import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorator/customize';

// Chuẩn hóa định dạng Response trả về cho Frontend
export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        // Lấy status code từ Express v5 response
        statusCode: context.switchToHttp().getResponse().statusCode,
        // Đọc custom message từ decorator @ResponseMessage
        message:
          this.reflector.get<string>(
            RESPONSE_MESSAGE,
            context.getHandler(),
          ) || 'Success',
        // Dữ liệu payload trả về
        data: data,
      })),
    );
  }
}