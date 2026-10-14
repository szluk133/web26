import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { Chapter, ChapterSchema } from './schemas/chapter.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService, MongooseModule],
})
export class ChaptersModule {}