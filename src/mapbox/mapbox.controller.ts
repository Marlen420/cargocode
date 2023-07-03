import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DistanceUnit } from "./enums/distanceUnit.enum";
import { MapboxService } from "./mapbox.service";

@ApiTags('Mapbox')
@Controller('mapbox')
export class MapboxController {
    constructor(
        private readonly mapboxService: MapboxService
    ) {}

    @Get('distance')
    async getDistance(@Query('start') startAddress: string, @Query('end') endAddress: string, @Query('unit') unit: DistanceUnit): Promise<any> {
        return this.mapboxService.getDistance(startAddress, endAddress, unit);
    }

    @Get('truck-route')
    async getTruckRoute(@Query('start') startAddress: string, @Query('end') endAddress: string) {
        return this.mapboxService.calculateTruckRoute(startAddress, endAddress);
    }
}