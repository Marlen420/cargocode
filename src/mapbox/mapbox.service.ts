import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import axios from 'axios';
import { DistanceUnit } from "./enums/distanceUnit.enum";
import { METER_CONVERT_VALUES } from "src/constants/meterConvertValues";
import CONFIG from "src/config";

const directionsService = require('@mapbox/mapbox-sdk/services/directions');
const polyline = require('@mapbox/polyline');

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
    constructor() {
        this.directionsClient = directionsService({ accessToken: this.accessToken });
        const geo = "udrwFtoqbMcDdKh}Apm@thB{{@kDvBIzImGGcErQ^pIlAgCrAbChqElRnkC|_CftDjx@_]n{ZeaCfkF`H|JcRg]suI{hHo_@iVia@}Mr@bl@qVtq^qoQdtWk_J}pD{sFfoz@mwCpzeAKvOzOvW~MwAnSf]qF{BgtKpxHkd@mIdg@fnMwrOpw`@viCrfxG|cSrbnDy`o@~uaHnaK|djHxmBpzNuJbu@s~r@ze`Fj|I`myBofs@t`gE_rFzzxEovWxgkIdb_@hnuCtQp[bHj@hw@|htAn~e@rovCq`KlimJu`]|vIonRdmnFvyQ~wgLh`@`uCpfQjlzIlcs@ptp@ldpA||sDol@jc`Ix~\\j}vBckFn{|BsjrAhkyFnfRfqgFhgv@tscDrf|AjvrBvsTfmiDlh|@jw{AxkMrpj@rgBdlbBbqq@pccBiah@tsgBlmd@le_FromAd{|AqkU`qpBnny@fmcBujJdksChcm@lujFcxa@zkzAxadAbpqAZz`}@dbtAtgBdcxE`u_Ep}lBv{mFdly@p_`Azb|Bd_s@zhAxc@jAP~{zBdv}Hvh}BvxeAxkQbpKb{@pbyAzuJdqHpPpEjbB~nl@aHha@lVfSkCdEkF{E";
        console.log(polyline.decode(geo));
        // this.getDistance('1600 Amphitheatre Parkway, Mountain View, CA', 'New work, central park', DistanceUnit.km);
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
        try {
            const startResponse = await this.getGeocodeAddress(startAddress, 'string');
            const endResponse = await this.getGeocodeAddress(endAddress, 'string');

            const response = await axios.get(`${this.calculateDistanceUrl}${startResponse};${endResponse}?access_token=${this.accessToken}`);
            
            const distanceInMeter = response.data.routes[0].distance;
            const distanceInUnit = Math.ceil(distanceInMeter/METER_CONVERT_VALUES[unit]);
            console.log(distanceInUnit + ` ${unit}`);
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