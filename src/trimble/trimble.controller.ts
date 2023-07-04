import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { TrimbleService } from "./trimble.service";

@ApiTags('Trimble')
@Controller('trimble')
export class TrimbleController {
    constructor(
        private readonly trimbleService: TrimbleService
    ) {}

    @ApiQuery({name: 'start'})
    @ApiQuery({name: 'end'})
    @Get('truck-route')
    async getTruckRoute(@Query('start') startAddress: string, @Query('end') endAddress: string) {
        return this.trimbleService.getTruckRoute(startAddress, endAddress);
    }
}