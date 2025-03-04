import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { User as UserModel, Zone as ZoneModel, Incident as IncidentModel, IncidentType, Polygon as PolygonModel } from '@prisma/client';
import { UserService } from './user/user.service';
import { ZoneService } from './zone/zone.service';
import { IncidentService } from './incident/incident.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly userService: UserService, private readonly zoneService: ZoneService, private readonly incidentService: IncidentService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string; username: string; password_hash: string },
  ): Promise<UserModel> {
    return this.userService.create(userData);
  }

  @Get('users')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }

  @Post('zone')
  async createZone(@Body() zoneData: { name: string; description: string; is_under_premises: boolean; population_density: number }): Promise<ZoneModel> {
    return this.zoneService.create(zoneData);
  }

  @Get('zones')
  async getZones(): Promise<ZoneModel[]> {
    return this.zoneService.findAll();
  }

  @Get('zones/:id')
  async getZoneById(@Param('id') id: bigint): Promise<ZoneModel> {
    const zone = await this.zoneService.findOneById(id);
    if (!zone) {
      throw new NotFoundException('Zone not found');
    }
    return zone;
  }

  @Put('zones/:id')
  async updateZone(@Param('id') id: bigint, @Body() zoneData: { name: string; description: string; latitude: number; longitude: number; radius: number; is_under_premises: boolean; population_density: number }): Promise<ZoneModel> {
    return this.zoneService.update(id, zoneData);
  }

  @Delete('zones/:id')
  async deleteZone(@Param('id') id: bigint): Promise<ZoneModel> {
    return this.zoneService.delete(id);
  }

  @Post('incident')
  async createIncident(@Body() incidentData: { zone: { connect: { id: bigint } }; description: string; severity: number; is_validated_by_authority: boolean; type: IncidentType; report_time: Date }): Promise<IncidentModel> {
    return this.incidentService.create(incidentData);
  }

  @Get('incidents')
  async getIncidents(): Promise<IncidentModel[]> {
    return this.incidentService.findAll();
  }

  @Get('incidents/:id')
  async getIncidentById(@Param('id') id: bigint): Promise<IncidentModel> {
    const incident = await this.incidentService.findOneById(id);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    return incident;
  }

  @Put('incidents/:id')
  async updateIncident(@Param('id') id: bigint, @Body() incidentData: { zone: { connect: { id: bigint } }; description: string; severity: number; is_validated_by_authority: boolean; type: IncidentType; report_time: Date }): Promise<IncidentModel> {
    return this.incidentService.update(id, incidentData);
  }

  @Delete('incidents/:id')
  async deleteIncident(@Param('id') id: bigint): Promise<IncidentModel> {
    return this.incidentService.delete(id);
  }

  @Put('incidents/:id/validate')
  async validateIncident(@Param('id') id: bigint): Promise<IncidentModel> {
    return this.incidentService.validateIncident(id);
  }

  @Get('incidents/zone/:zoneId')
  async getIncidentsByZone(@Param('zoneId') zoneId: bigint): Promise<IncidentModel[]> {
    return this.incidentService.findByZone(zoneId);
  }

  @Get('incidents/type/:type')
  async getIncidentsByType(@Param('type') type: IncidentType): Promise<IncidentModel[]> {
    return this.incidentService.findByType(type);
  }

  @Get('incidents/severity/:severity')
  async getIncidentsBySeverity(@Param('severity') severity: number): Promise<IncidentModel[]> {
    return this.incidentService.findBySeverity(severity);
  }
  
  @Post('polygon')
  async createPolygon(@Body() polygonData: { coordinates: number[][][] }): Promise<PolygonModel> {
    return this.zoneService.createPolygon(polygonData);
  }
}
