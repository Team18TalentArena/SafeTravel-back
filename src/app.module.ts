import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

import { ZoneModule } from './zone/zone.module';

import { IncidentsModule } from './incident/incident.module';
import { IncidentService } from './incident/incident.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ZoneModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, IncidentService],
})
export class AppModule {}
