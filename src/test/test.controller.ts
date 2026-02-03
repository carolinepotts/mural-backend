import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  async getItems() {
    return this.testService.findAll();
  }

  @Post()
  async createItem(@Body() body: { name: string }) {
    const { name } = body;
    if (!name || typeof name !== 'string') {
      throw new BadRequestException('name is required and must be a string');
    }
    return this.testService.create(name);
  }
}
