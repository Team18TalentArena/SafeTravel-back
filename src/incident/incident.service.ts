import { Injectable } from '@nestjs/common';
import { Prisma, Incident, IncidentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentService {
    constructor(private prisma: PrismaService) {}
    
    async create(data: Prisma.IncidentCreateInput): Promise<Incident> {
        const createdIncident = await this.prisma.incident.create({
            data: {
                zone: {
                    connect: { id: data.zone.connect?.id }
                },
                description: data.description,
                severity: data.severity,
                is_validated_by_authority: data.is_validated_by_authority || false,
                type: data.type,
                report_time: data.report_time || new Date(),
            }
        });
        return createdIncident;
    }

    async update(id: bigint, data: Prisma.IncidentUpdateInput): Promise<Incident> {
        return this.prisma.incident.update({
            where: { id },
            data,
        });
    }

    async findOneById(id: bigint): Promise<Incident | null> {
        return this.prisma.incident.findUnique({
            where: {
                id,
            },
            include: {
                zone: true,
            },
        });
    }

    async findAll(): Promise<Incident[]> {
        return this.prisma.incident.findMany({
            include: {
                zone: true,
            },
        });
    }

    async delete(id: bigint): Promise<Incident> {
        return this.prisma.incident.delete({
            where: { id },
        });
    }

    async findByZone(zoneId: bigint): Promise<Incident[]> {
        return this.prisma.incident.findMany({
            where: {
                zone_id: zoneId,
            },
            include: {
                zone: true,
            },
        });
    }

    async findByType(type: IncidentType): Promise<Incident[]> {
        return this.prisma.incident.findMany({
            where: {
                type,
            },
            include: {
                zone: true,
            },
        });
    }

    async findBySeverity(minSeverity: number): Promise<Incident[]> {
        return this.prisma.incident.findMany({
            where: {
                severity: {
                    gte: minSeverity,
                },
            },
            include: {
                zone: true,
            },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Incident[]> {
        return this.prisma.incident.findMany({
            where: {
                report_time: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                zone: true,
            },
        });
    }

    async validateIncident(id: bigint): Promise<Incident> {
        return this.prisma.incident.update({
            where: { id },
            data: {
                is_validated_by_authority: true,
            },
        });
    }
}
