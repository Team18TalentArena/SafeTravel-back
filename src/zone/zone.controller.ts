import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { Zone } from '@prisma/client';

@Controller('zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  async create(@Body() data: any): Promise<Zone> {
    return this.zoneService.create(data);
  }

  @Get()
  async findAll(): Promise<Zone[]> {
    return this.zoneService.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Zone> {
    return this.zoneService.update(BigInt(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Zone> {
    return this.zoneService.delete(BigInt(id));
  }
}