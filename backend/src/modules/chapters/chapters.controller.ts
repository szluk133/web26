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
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../../auth/role/roles.guard';
import { Roles } from '../../auth/role/roles.decorator';
import { Role } from '../../auth/role/roles.enum';
import { Public, ResponseMessage } from '../../decorator/customize';

@Controller('chapters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tạo mới chương học thành công')
  create(@Body() createChapterDto: CreateChapterDto, @Req() req: any) {
    return this.chaptersService.create(createChapterDto, req.user);
  }

  @Get('course/:courseId')
  @Public()
  @ResponseMessage('Lấy danh sách chương học theo khóa học')
  findByCourse(@Param('courseId') courseId: string) {
    return this.chaptersService.findByCourse(courseId);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin chi tiết chương học')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ResponseMessage('Cập nhật chương học thành công')
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Req() req: any,
  ) {
    return this.chaptersService.update(id, updateChapterDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ResponseMessage('Xóa chương học thành công')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.chaptersService.remove(id, req.user);
  }
}