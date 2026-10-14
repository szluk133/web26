import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../../auth/role/roles.guard';
import { Roles } from '../../auth/role/roles.decorator';
import { Role } from '../../auth/role/roles.enum';
import { Public, ResponseMessage } from '../../decorator/customize';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tạo bài học mới thành công')
  create(@Body() createLessonDto: CreateLessonDto, @Req() req: any) {
    return this.lessonsService.create(createLessonDto, req.user);
  }

  @Get('chapter/:chapterId')
  @Public()
  @ResponseMessage('Lấy danh sách bài học thuộc chương')
  findByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonsService.findByChapter(chapterId);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy nội dung chi tiết bài học')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.lessonsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ResponseMessage('Cập nhật bài học thành công')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req: any,
  ) {
    return this.lessonsService.update(id, updateLessonDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ResponseMessage('Xóa bài học thành công')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.lessonsService.remove(id, req.user);
  }
}