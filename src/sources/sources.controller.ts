import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SourcesService } from './sources.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.findOne(id);
  }

  @Post(':id/sync')
  sync(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.sync(id);
  }

  @Post()
  create(@Body() data: CreateSourceDto) {
    return this.sourcesService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateSourceDto,
  ) {
    return this.sourcesService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.delete(id);
  }
}
