import { Module } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";
import { TrimbleController } from "./trimble.controller";
import { TrimbleService } from "./trimble.service";

@Module({
    imports: [RedisModule],
    providers: [
        RedisService,
        TrimbleService
    ],
    controllers: [TrimbleController]
})
export class TrimbleModule {}