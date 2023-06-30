import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { MapboxController } from './mapbox.controller';
import { MapboxService } from './mapbox.service';
config();

@Module({
  controllers: [MapboxController],
  providers: [MapboxService]
})
export class MapboxModule {}
