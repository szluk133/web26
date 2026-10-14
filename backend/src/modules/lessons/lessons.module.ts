import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Chapter, ChapterSchema } from '../chapters/schemas/chapter.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService, MongooseModule],
})
export class LessonsModule {}