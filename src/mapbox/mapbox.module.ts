import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { RedisModule } from 'src/redis/redis.module';
import { MapboxController } from './mapbox.controller';
import { MapboxService } from './mapbox.service';
config();

@Module({
  imports: [RedisModule],
  controllers: [MapboxController],
  providers: [MapboxService],
  exports: [MapboxService],
})
export class MapboxModule {}
