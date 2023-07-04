import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { MapboxController } from './mapbox.controller';
import { MapboxService } from './mapbox.service';
config();

@Module({
  imports: [RedisModule],
  controllers: [MapboxController],
  providers: [MapboxService, RedisService],
  exports: [MapboxService],
})
export class MapboxModule {}
