import ApiClient from "../core/api-client";
import {ApplicationUrls} from "../helpers/application-urls";

export default class WheelService {
    constructor(private api: ApiClient) {
    }

    async spin(accessToken: string) {
        const headers = {
            accessToken: accessToken
        };
        let data = {
            multiplier: 1
        }
        return this.api.post(ApplicationUrls.SPIN, data, headers);
    }

}