import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Tạo khóa học mới (Gán instructor_id từ Token người tạo)
  // --- MỚI BỔ SUNG: Áp dụng DTO thay cho any ---
  async create(createCourseDto: CreateCourseDto, instructorId: string): Promise<Course> {
    const createdCourse = new this.courseModel({
      ...createCourseDto,
      instructor_id: new Types.ObjectId(instructorId),
      status: 'draft', // Mặc định khóa học luôn là bản nháp
    });
    return createdCourse.save();
  }

  // Học viên xem tất cả khóa học public
  async findAllPublished(): Promise<Course[]> {
    return this.courseModel
      .find({ status: 'published', is_deleted: false })
      // --- BỔ SUNG QUAN TRỌNG: Chỉ select các trường cần thiết phục vụ UI trang chủ / danh sách ---
      .select('title slug price thumbnail rating_summary instructor_id category_id createdAt')
      .populate('instructor_id', 'profile.full_name profile.avatar') // Chỉ lấy tên và avatar giảng viên
      .populate('category_id', 'name slug') // Chỉ lấy tên và slug của danh mục
      .exec();
  }

  // Admin thay đổi trạng thái kiểm duyệt (Ví dụ: duyệt sang published)
  async updateStatus(courseId: string, status: string): Promise<Course> {
    const course = await this.courseModel.findByIdAndUpdate(
      courseId,
      { status },
      { new: true },
    );
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    return course;
  }
  // Giảng viên sửa thông tin khóa học (chỉ khóa học của họ)
  // --- MỚI BỔ SUNG: Áp dụng DTO thay cho any ---
  async update(courseId: string, updateCourseDto: UpdateCourseDto, instructorId: string): Promise<Course> {
    // Ép kiểu tường minh sang ObjectId để MongoDB so khớp chuẩn xác
    const course = await this.courseModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(courseId), 
        instructor_id: new Types.ObjectId(instructorId), 
        is_deleted: false 
      },
      updateCourseDto,
      { new: true },
    );
    
    if (!course) {
      throw new NotFoundException(`Course not found or you don't have permission to edit`);
    }
    return course;
  }

  // --- MỚI BỔ SUNG: Soft-Delete theo đặc tả vận hành V3 ---
  async softDelete(courseId: string, instructorId: string): Promise<any> {
    const course = await this.courseModel.findOneAndUpdate(
      { _id: new Types.ObjectId(courseId), instructor_id: new Types.ObjectId(instructorId) },
      { is_deleted: true },
      { new: true }
    );
    if (!course) {
        throw new NotFoundException(`Course not found or permission denied`);
    }
    return { message: 'Course has been soft-deleted successfully' };
  }
}