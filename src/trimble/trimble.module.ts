import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { TrimbleController } from './trimble.controller';
import { TrimbleService } from './trimble.service';

@Module({
  imports: [RedisModule],
  providers: [TrimbleService],
  controllers: [TrimbleController],
  exports: [TrimbleService]
})
export class TrimbleModule {}
