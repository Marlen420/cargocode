import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from 'src/redis/redis.service';
import { TrimbleRegions } from './enums/trimbleRegions.enum';

@Injectable()
export class TrimbleService {
  private readonly baseUrl = 'https://api.trimblemaps.com/routing/v1';
  private readonly singleSearchUrl = 'https://singlesearch.alk.com';
  private readonly apiKey = process.env.TRIMBLE_KEY;
  constructor(private readonly redisService: RedisService) {}

  async getLocation(startAddress: string, endAddress: string): Promise<any> {
    const url = `${this.singleSearchUrl}/${TrimbleRegions.WW}/api/search?authToken=${this.apiKey}`;
    const startAddressParams = {
      authToken: this.apiKey,
      query: startAddress,
      maxResults: 1,
    };
    const endAddressParams = {
      authToken: this.apiKey,
      query: encodeURIComponent(endAddress),
      maxResults: 1,
    };
    try {
      const startLocation = await axios.get(url, {
        params: startAddressParams,
      });
      const endLocation = await axios.get(url, { params: endAddressParams });
      return {
        start: startLocation.data,
        end: endLocation.data,
      };
    } catch (err) {
      Logger.error('Failed to get route', err);
      throw new Error('Failed to get route');
    }
  }

  // function dictToParamString(obj) {
  //     var str = [];
  //     for (var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  //     return str.join("&");
  // }
}
