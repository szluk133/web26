import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from './schemas/chapter.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Role } from '../../auth/role/roles.enum';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name)
    private chapterModel: Model<ChapterDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Kiểm tra quyền sở hữu khóa học:
   * Giảng viên chỉ được quản lý giáo trình khóa học do chính mình tạo ra.
   * Quản trị viên (Admin) có toàn quyền.
   */
  private async verifyCourseOwnership(courseId: string, user: any): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID khóa học không hợp lệ');
    }

    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      is_deleted: false,
    });

    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại hoặc đã bị xóa');
    }

    if (user.role !== Role.ADMIN && course.instructor_id.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền quản lý giáo trình của khóa học này');
    }

    return course;
  }

  async create(createChapterDto: CreateChapterDto, user: any): Promise<Chapter> {
    const { course_id, title, order } = createChapterDto;
    await this.verifyCourseOwnership(course_id, user);

    let chapterOrder = order;
    if (!chapterOrder) {
      const highestOrderChapter = await this.chapterModel
        .findOne({ course_id: new Types.ObjectId(course_id), is_deleted: false })
        .sort({ order: -1 })
        .select('order')
        .lean();
      chapterOrder = highestOrderChapter ? highestOrderChapter.order + 1 : 1;
    }

    const createdChapter = new this.chapterModel({
      course_id: new Types.ObjectId(course_id),
      title,
      order: chapterOrder,
    });

    return await createdChapter.save();
  }

  async findByCourse(courseId: string): Promise<Chapter[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID khóa học không hợp lệ');
    }

    return await this.chapterModel
      .find({
        course_id: new Types.ObjectId(courseId),
        is_deleted: false,
      })
      .select('_id course_id title order createdAt')
      .sort({ order: 1 })
      .lean();
  }

  async findOne(id: string): Promise<Chapter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID chương học không hợp lệ');
    }

    const chapter = await this.chapterModel
      .findOne({ _id: new Types.ObjectId(id), is_deleted: false })
      .select('_id course_id title order createdAt updatedAt')
      .lean();

    if (!chapter) {
      throw new NotFoundException('Không tìm thấy chương học');
    }

    return chapter;
  }

  async update(id: string, updateChapterDto: UpdateChapterDto, user: any): Promise<Chapter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID chương học không hợp lệ');
    }

    const chapter = await this.chapterModel.findOne({
      _id: new Types.ObjectId(id),
      is_deleted: false,
    });

    if (!chapter) {
      throw new NotFoundException('Chương học không tồn tại');
    }

    await this.verifyCourseOwnership(chapter.course_id.toString(), user);

    if (updateChapterDto.title !== undefined) {
      chapter.title = updateChapterDto.title;
    }
    if (updateChapterDto.order !== undefined) {
      chapter.order = updateChapterDto.order;
    }

    return await chapter.save();
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID chương học không hợp lệ');
    }

    const chapter = await this.chapterModel.findOne({
      _id: new Types.ObjectId(id),
      is_deleted: false,
    });

    if (!chapter) {
      throw new NotFoundException('Chương học không tồn tại');
    }

    await this.verifyCourseOwnership(chapter.course_id.toString(), user);

    chapter.is_deleted = true;
    await chapter.save();

    return { message: 'Xóa chương học thành công (Soft-delete)' };
  }
}