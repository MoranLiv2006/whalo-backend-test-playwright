import {expect, test} from "@playwright/test";
import ApiClient from "../src/core/api-client";
import LoginService from "../src/services/login.service";
import WheelService from "../src/services/wheel.service";
import {ErrorMessages} from "../src/helpers/error-messages";

test.describe("Positive Scenarios", () => {
    let apiClient: ApiClient;
    let loginService: LoginService;
    let wheelService: WheelService;

    test.beforeEach(async ({request}) => {
        apiClient = new ApiClient(request);
        loginService = new LoginService(apiClient);
        wheelService = new WheelService(apiClient);
    });

    test("Try to loing with empty LoginSource", async () => {
        let loginResponse = await loginService.login(Date.now().toString(), "")
        expect(loginResponse.response).toBe(ErrorMessages.LOGINSOURCE_NOT_RECEIVED)
    })

    test("Try to spin without accessToken", async () => {
        let spinResponse = await wheelService.spin("")
        expect(spinResponse.response).toBe(ErrorMessages.GENERAL_ACCESS_TOKEN_ISSUES)
    })

    test("Try to spin with invalid accessToken", async () => {
        let name = "Moran Liv"
        let spinResponse = await wheelService.spin(name)
        expect(spinResponse.response).toBe(ErrorMessages.GENERAL_ACCESS_TOKEN_ISSUES.concat(name))
    })
});
