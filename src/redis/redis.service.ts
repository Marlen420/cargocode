import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import Redis from 'ioredis';

config();

/**
 * Service that provides redis methods
 * @property {Redis} clinet client of redis service
 */
@Injectable()
export class RedisService {
    private readonly client: Redis;
    constructor() {
        this.client = new Redis(process.env.REDIS_HOST);
    }

    /**
     * Returns value of provided key in redis hash table
     * @param {string} key key of value to get
     * @returns {Promise<any>} a value of key in redis hash table
     */
    async get(key: string): Promise<any> {
        return this.client.get(key);
    }

    /**
     * Sets provided value to key in redis hash table
     * @param {string} key key of value in hash table
     * @param {any} value value in hash table
     * @param {number | string} ttl Expire time of value in table
     * @returns {Promise<string>} Returns promise of OK or undefined
     */
    async set(key: string, value: any, ttl: number = 1800): Promise<string> {
        return this.client.set(key, JSON.stringify(value));
    }

    /**
     * Deletes value of provided key in redis hash table
     * @param {string} key key of value to delete from redis hash table
     * @returns {Promise<number>} number of key
     */
    async delete(key: string): Promise<number> {
        return this.client.del(key);
    }
}