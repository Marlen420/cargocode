import { Injectable } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class OrdersService {
    constructor(
        private readonly redisService: RedisService
    ) {
        this.createOrder();
    }

    async createOrder() {
        let res = await this.redisService.set('test-key', undefined);
        console.log('Result of setting: ', res);
        return;
    }
}