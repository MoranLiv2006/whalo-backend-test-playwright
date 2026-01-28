import ApiClient from '../core/api-client';
import {ApplicationUrls} from "../helpers/application-urls";


export default class LoginService {
    constructor(private api: ApiClient) {
    }

    async login(device_id: string, loginSource: string = `test_moran_${process.env.CANDIDATE_PHONE_NUMBER}`) {
        let data = {
            DeviceId: `candidate_test_${device_id}`,
            LoginSource: loginSource
        }
        return this.api.post(ApplicationUrls.LOGIN, data);
    }
}