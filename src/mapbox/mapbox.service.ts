import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import axios from 'axios';
import { DistanceUnit } from "./enums/distanceUnit.enum";
import { METER_CONVERT_VALUES } from "src/constants/meterConvertValues";

config();

@Injectable()
export class MapboxService {
    private readonly accessToken: any = process.env.MAPBOX_KEY;
    private readonly locationFromAddressUrl: string = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    private readonly calculateDistanceUrl: string = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
    constructor() {
        this.getDistance('1600 Amphitheatre Parkway, Mountain View, CA', 'New work, central park', DistanceUnit.km);
    }

    async getGeocodeAddress(address: string): Promise<any> {
        const response = await axios.get(`${this.locationFromAddressUrl}${encodeURIComponent(address)}.json?access_token=${this.accessToken}`);
        const features = response.data.features;
        if (features.length > 0) {
            const location = features[0].center; // [longitude, latitude]
            return `${location[0]}, ${location[1]}`;
        } 
        return null;
    }

    async getDistance(startAddress: string, endAddress: string, unit: DistanceUnit): Promise<any> {
        try {
            const startResponse = await this.getGeocodeAddress(startAddress);
            const endResponse = await this.getGeocodeAddress(endAddress);

            const response = await axios.get(`${this.calculateDistanceUrl}${startResponse};${endResponse}?access_token=${this.accessToken}`);
            const distanceInMeter = response.data.routes[0].distance;
            const distanceInUnit = Math.ceil(distanceInMeter/METER_CONVERT_VALUES[unit])
            console.log(distanceInUnit + ` ${unit}`);
        } catch (error) {
            throw new Error('Error getting distance');
        }
    }
}