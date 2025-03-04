import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IncidentService],
  exports: [IncidentService],
})
export class IncidentsModule {}
