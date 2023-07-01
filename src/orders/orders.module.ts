import { Module } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { OrdersService } from "./orders.service";

@Module({
    imports: [],
    providers: [RedisService, OrdersService]
})
export class OrdersModule {}