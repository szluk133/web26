import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Roles } from '@/auth/role/roles.decorator'; // Đường dẫn import có thể thay đổi tùy project của bạn
import { Public } from '@/decorator/customize';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Roles('admin')
  @Post()
  // --- MỚI BỔ SUNG: Áp dụng CreateCategoryDto thay cho any ---
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Roles('admin')
  @Patch(':id')
  // --- MỚI BỔ SUNG: Áp dụng UpdateCategoryDto thay cho any ---
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}