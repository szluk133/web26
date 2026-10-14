import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument, LessonType } from './schemas/lesson.schema';
import { Chapter, ChapterDocument } from '../chapters/schemas/chapter.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Role } from '../../auth/role/roles.enum';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Chapter.name)
    private chapterModel: Model<ChapterDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Kiểm tra quyền sở hữu khóa học và tính hợp lệ của chương mục
   */
  private async verifyOwnershipAndChapter(
    courseId: string,
    chapterId: string,
    user: any,
  ): Promise<{ course: CourseDocument; chapter: ChapterDocument }> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(chapterId)) {
      throw new BadRequestException('ID khóa học hoặc ID chương học không hợp lệ');
    }

    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      is_deleted: false,
    });

    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại hoặc đã bị xóa');
    }

    if (user.role !== Role.ADMIN && course.instructor_id.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài liệu trong khóa học này');
    }

    const chapter = await this.chapterModel.findOne({
      _id: new Types.ObjectId(chapterId),
      course_id: new Types.ObjectId(courseId),
      is_deleted: false,
    });

    if (!chapter) {
      throw new NotFoundException('Chương học không tồn tại hoặc không thuộc về khóa học này');
    }

    return { course, chapter };
  }

  async create(createLessonDto: CreateLessonDto, user: any): Promise<Lesson> {
    const { course_id, chapter_id, title, order, lesson_type, is_free_preview, content } =
      createLessonDto;

    await this.verifyOwnershipAndChapter(course_id, chapter_id, user);

    // Kiểm tra tính tương thích nội dung theo lesson_type
    if (lesson_type === LessonType.VIDEO && !content.video_url) {
      throw new BadRequestException('Bài học dạng video bắt buộc phải có video_url');
    }
    if (lesson_type === LessonType.TEXT && !content.body_text) {
      throw new BadRequestException('Bài học dạng text bắt buộc phải có body_text');
    }
    if (lesson_type === LessonType.QUIZ && (!content.quiz_data || content.quiz_data.length === 0)) {
      throw new BadRequestException('Bài học dạng quiz bắt buộc phải có ít nhất 1 câu hỏi quiz_data');
    }

    let lessonOrder = order;
    if (!lessonOrder) {
      const highestOrderLesson = await this.lessonModel
        .findOne({
          chapter_id: new Types.ObjectId(chapter_id),
          is_deleted: false,
        })
        .sort({ order: -1 })
        .select('order')
        .lean();
      lessonOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    }

    const createdLesson = new this.lessonModel({
      course_id: new Types.ObjectId(course_id),
      chapter_id: new Types.ObjectId(chapter_id),
      title,
      order: lessonOrder,
      lesson_type,
      is_free_preview: is_free_preview ?? false,
      content,
    });

    return await createdLesson.save();
  }

  /**
   * Lấy danh sách bài học thuộc 1 chương (Public danh mục/syllabus)
   * Để chống rò rỉ nội dung theo v3 Choke-point: Không trả về video_url hoặc quiz_data đối với bài học không phải học thử
   */
  async findByChapter(chapterId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(chapterId)) {
      throw new BadRequestException('ID chương học không hợp lệ');
    }

    const lessons = await this.lessonModel
      .find({
        chapter_id: new Types.ObjectId(chapterId),
        is_deleted: false,
      })
      .select('_id course_id chapter_id title order lesson_type is_free_preview content.duration')
      .sort({ order: 1 })
      .lean();

    return lessons;
  }

  /**
   * Xem nội dung chi tiết bài học
   */
  async findOne(id: string, user?: any): Promise<Lesson> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID bài học không hợp lệ');
    }

    const lesson = await this.lessonModel
      .findOne({ _id: new Types.ObjectId(id), is_deleted: false })
      .lean();

    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    // Nếu là bài học thử miễn phí (is_free_preview === true), cho phép xem toàn bộ
    if (lesson.is_free_preview) {
      return lesson;
    }

    // Nếu không phải bài học thử: Phải đăng nhập và là tác giả hoặc admin
    // (Ở Giai đoạn 2 & 3 tiếp theo, sẽ bổ sung kiểm tra ghi danh trong collection enrollments)
    if (!user) {
      throw new ForbiddenException('Vui lòng đăng nhập và đăng ký khóa học để xem nội dung bài học này');
    }

    if (user.role === Role.ADMIN) {
      return lesson;
    }

    const course = await this.courseModel.findById(lesson.course_id).lean();
    if (course && course.instructor_id.toString() === user._id.toString()) {
      return lesson;
    }

    // Học viên thông thường nếu chưa học thử thì tạm thời chặn nếu chưa kích hoạt enrollment
    throw new ForbiddenException('Nội dung bài học trả phí. Bạn cần ghi danh để truy cập');
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: any): Promise<Lesson> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID bài học không hợp lệ');
    }

    const lesson = await this.lessonModel.findOne({
      _id: new Types.ObjectId(id),
      is_deleted: false,
    });

    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại');
    }

    // Kiểm tra quyền chỉnh sửa qua course sở hữu
    const course = await this.courseModel.findOne({
      _id: lesson.course_id,
      is_deleted: false,
    });

    if (!course) {
      throw new NotFoundException('Khóa học liên kết không tồn tại');
    }

    if (user.role !== Role.ADMIN && course.instructor_id.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài học này');
    }

    if (updateLessonDto.title !== undefined) lesson.title = updateLessonDto.title;
    if (updateLessonDto.order !== undefined) lesson.order = updateLessonDto.order;
    if (updateLessonDto.lesson_type !== undefined) lesson.lesson_type = updateLessonDto.lesson_type;
    if (updateLessonDto.is_free_preview !== undefined)
      lesson.is_free_preview = updateLessonDto.is_free_preview;
    if (updateLessonDto.content !== undefined) {
      lesson.content = { ...lesson.content, ...updateLessonDto.content };
    }

    return await lesson.save();
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID bài học không hợp lệ');
    }

    const lesson = await this.lessonModel.findOne({
      _id: new Types.ObjectId(id),
      is_deleted: false,
    });

    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại');
    }

    const course = await this.courseModel.findOne({
      _id: lesson.course_id,
      is_deleted: false,
    });

    if (user.role !== Role.ADMIN && course && course.instructor_id.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền xóa bài học này');
    }

    lesson.is_deleted = true;
    await lesson.save();

    return { message: 'Xóa bài học thành công (Soft-delete)' };
  }
}