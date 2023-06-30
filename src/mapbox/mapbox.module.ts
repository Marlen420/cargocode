import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { MapboxService } from './mapbox.service';
config();

@Module({
  providers: [MapboxService],
})
export class MapboxModule {}
