import {APIRequestContext, expect} from '@playwright/test';


export default class ApiClient {
    constructor(private request: APIRequestContext) {
    }

    async post(url: string, data: unknown, headers?: Record<string, string>) {
        const response = await this.request.post(url, {data, headers});
        expect(response.status()).toBe(200);
        return await response.json();
    }
}