import { Controller, Get, Post, Body, Patch, Param, Request, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Roles } from '@/auth/role/roles.decorator'; // Đường dẫn import có thể thay đổi tùy project của bạn
import { Public } from '@/decorator/customize';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';
@Controller('courses')
// --- BỔ SUNG QUAN TRỌNG: Kích hoạt Guard bảo vệ phân quyền ---
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // API công khai để trang chủ lấy danh sách khóa học (chỉ khóa học đã duyệt)
  @Public()
  @Get()
  findAllPublished() {
    return this.coursesService.findAllPublished();
  }

  // Giảng viên tạo khóa học mới
  @Roles('instructor')
  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(createCourseDto, req.user._id);
  }

  @Roles('admin')
  @Patch(':id/status')
  // Thay đổi ở đây: Dùng UpdateCourseStatusDto thay vì kiểu string thuần
  updateStatus(@Param('id') id: string, @Body() updateCourseStatusDto: UpdateCourseStatusDto) {
    return this.coursesService.updateStatus(id, updateCourseStatusDto.status);
  }

  @Roles('instructor')
  @Patch(':id')
  // --- MỚI BỔ SUNG: Áp dụng UpdateCourseDto thay cho any ---
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, updateCourseDto, req.user._id);
  }

  // --- MỚI BỔ SUNG: Instructor xóa (Soft-delete) khóa học ---
  @Roles('instructor')
  @Delete(':id')
  softDelete(@Param('id') id: string, @Request() req) {
    return this.coursesService.softDelete(id, req.user._id);
  }
}