import { HttpException, Injectable } from '@nestjs/common';
import { Polygon, Prisma, Zone } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZoneService {
    constructor(private prisma: PrismaService) {}
    async createZoneAndAssignPolygon(data: any): Promise<Zone> {

        return this.create({
            ...data,
            polygonId: data.polygonId
        });
    }

    async createPolygon(data: any): Promise<Polygon> {
        return this.prisma.polygon.create({
            data: {
                coordinates: data.coordinates
            }
        });
    }

    async create(data: any): Promise<Zone> {
        // Handle polygon coordinates from frontend
        let polygonId: string | null = null;
        
        if (data.coordinates && data.coordinates.length > 0) {
            // Create polygon with coordinates in the format expected by the frontend
            const polygon = await this.prisma.polygon.create({
                data: {
                    coordinates: data.coordinates // Array of {lat, lng} objects
                }
            });
            polygonId = polygon.id;
        }
        
        // Check if the zone with the same name and coordinates already exists
        const existingZone = await this.prisma.zone.findFirst({
            where: {
                name: data.name,
            },
        });
        
        if (existingZone) {
            throw new HttpException('Zone already exists', 400);
        }
        
        // Create zone with polygon relation if coordinates provided
        const createdZone = await this.prisma.zone.create({
            data: {
                name: data.name,
                description: data.description,
                risk_level: data.risk_level,
                is_under_premises: data.is_under_premises,
                population_density: data.population_density,
                ...(polygonId ? { polygonId: polygonId } : {})
            }
        });
        return createdZone;
    }

    async update(id: bigint, data: any): Promise<Zone> {
        // Get the current zone data
        const currentZone = await this.prisma.zone.findUnique({
            where: { id },
            include: { location: true }
        });
        
        if (!currentZone) {
            throw new HttpException('Zone not found', 404);
        }
        
        // Handle polygon coordinates update if provided
        if (data.coordinates) {
            if (data.coordinates.length > 0) {
                // If zone already has a polygon, update it
                if (currentZone.polygonId) {
                    await this.prisma.polygon.update({
                        where: { id: currentZone.polygonId },
                        data: { coordinates: data.coordinates }
                    });
                } else {
                    // Create new polygon if none exists
                    const polygon = await this.prisma.polygon.create({
                        data: { coordinates: data.coordinates }
                    });
                    // Add relation to the data update object
                    data.polygonId = polygon.id;
                }
            }
            // Remove coordinates from data before passing to prisma
            delete data.coordinates;
        }
        
        // If no conflicts, update the zone
        return this.prisma.zone.update({
            where: { id },
            data,
        });
    }

    async findOneById(id: bigint): Promise<Zone | null> {
        return this.prisma.zone.findUnique({
            where: {
                id,
            },
            include: {
                location: true
            }
        });
    }

    async findAll(): Promise<Zone[]> {
        return this.prisma.zone.findMany({
            include: {
                location: true
            }
        });
    }

    async delete(id: bigint): Promise<Zone> {
        // Get the zone with its polygon relation
        const zone = await this.prisma.zone.findUnique({
            where: { id },
            include: { location: true }
        });
        
        if (!zone) {
            throw new HttpException('Zone not found', 404);
        }
        
        // Delete the zone and get a reference to it
        const deletedZone = await this.prisma.zone.delete({
            where: { id },
        });
        
        // If zone had a polygon, delete it as well
        if (zone.polygonId) {
            await this.prisma.polygon.delete({
                where: { id: zone.polygonId }
            });
        }
        
        return deletedZone;
    }

    // Calculate distance between two points using Haversine formula
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km
        return distance;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI/180);
    }

}
