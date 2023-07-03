import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import axios from 'axios';
import { DistanceUnit } from "./enums/distanceUnit.enum";
import { METER_CONVERT_VALUES } from "src/constants/meterConvertValues";
import CONFIG from "src/config";
import { RedisService } from "src/redis/redis.service";

const directionsService = require('@mapbox/mapbox-sdk/services/directions');
// const polyline = require('@mapbox/polyline');

config();

/**
 * Service that is responsible for all Mapbox service methods
 * @property {string} accessToken access token for Mapbox service
 * @property {string} locationFromAddressUrl url of Mapbox service to get lines of longitude from address
 * @property {string} calculateDistanceUrl url of Mapbox service to calculate distance bewteen two provided locations
 */
@Injectable()
export class MapboxService {
    private readonly accessToken: string = process.env.MAPBOX_KEY;
    private readonly locationFromAddressUrl: string = CONFIG.mapboxGeocodeUrl;
    private readonly calculateDistanceUrl: string = CONFIG.mapboxDistanceCalculationurl;
    private readonly truckProfile: string = 'driving';
    private readonly directionsClient: any;
    
    /**
     * Constructs mapbox service
     * @param {Redis} redisService service responsible for redis methods
     */
    constructor(
        private readonly redisService: RedisService
    ) {
        this.directionsClient = directionsService({ accessToken: this.accessToken });
    }

    /**
     * Returns location of provided address
     * @param {string} address the address whose location need to get
     * @returns {Promise<string>} location, longitude and latitude divided by coma
     */
    async getGeocodeAddress(address: string, type: 'array' | 'string'): Promise<any> {
        const response = await axios.get(`${this.locationFromAddressUrl}${encodeURIComponent(address)}.json?access_token=${this.accessToken}`);
        const features = response.data.features;
        if (features.length > 0) {
            const location = features[0].center; // [longitude, latitude]
            if (type === 'string') {
                return `${location[0]}, ${location[1]}`;
            }
            return [location[0], location[1]];
        } 
        throw new Error();
    }

    /**
     * Returns distance in provided unit between two provided addresses
     * @param {string} startAddress address where starts the route
     * @param {string} endAddress address where ends the route
     * @param {DistanceUnit} unit unit to convert answer
     */
    async getDistance(startAddress: string, endAddress: string, unit: DistanceUnit): Promise<any> {
        const DISTANCE_IN_METER_KEY = `mapbox:getDistance:from=${startAddress};to=${endAddress}`;
        let distanceInMeter = await this.redisService.get(DISTANCE_IN_METER_KEY);
        if (distanceInMeter) {
            return Math.ceil(distanceInMeter/METER_CONVERT_VALUES[unit]);;
        }
        try {
            const startResponse = await this.getGeocodeAddress(startAddress, 'string');
            const endResponse = await this.getGeocodeAddress(endAddress, 'string');

            const response = await axios.get(`${this.calculateDistanceUrl}${startResponse};${endResponse}?access_token=${this.accessToken}`);
            
            distanceInMeter = response.data.routes[0].distance;
            await this.redisService.set(DISTANCE_IN_METER_KEY, distanceInMeter);
            const distanceInUnit = Math.ceil(distanceInMeter/METER_CONVERT_VALUES[unit]);
            return distanceInUnit;
        } catch (error) {
            throw new Error('Error getting distance');
        }
    }

    async calculateTruckRoute(startAddress: string, endAddress: string) {
        const request = {
            waypoints: [
              { coordinates: await this.getGeocodeAddress(startAddress, 'array') },
              { coordinates: await this.getGeocodeAddress(endAddress, 'array') },
            ],
            profile: this.truckProfile,
            maxHeight: 4.2, // Truck height in meters
            maxWeight: 2.5, // Truck weight in kilograms
            maxWidth: 2.6, // Truck width in meters
        };
        
        return this.directionsClient
            .getDirections(request)
            .send()
            .then(response => response.body);
    }
}