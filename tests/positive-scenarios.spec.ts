import {test, expect} from '@playwright/test';
import ApiClient from '../src/core/api-client';
import LoginService from "../src/services/login.service";
import WheelService from "../src/services/wheel.service";
import {randomBytes} from "node:crypto";
import {ErrorMessages} from "../src/helpers/error-messages";
import {validateLogin} from "../src/validations/login.validation";
import {validateSessionsPersist} from "../src/validations/session.validation";
import path = require("node:path");
import * as fs from "node:fs";
import {validateWheelSpin} from "../src/validations/spin.validation";

export function generateRandomDeviceId(length: number = 32): string {
    return randomBytes(length / 2).toString('hex');
}


test.describe("Positive Test Scenarios", () => {
    let apiClient: ApiClient;
    let loginService: LoginService;
    let wheelService: WheelService;
    let randomDeviceId: string;

    test.beforeEach(async ({request}) => {
        apiClient = new ApiClient(request);
        loginService = new LoginService(apiClient);
        wheelService = new WheelService(apiClient);
        randomDeviceId = generateRandomDeviceId();
    });


    test('Login, spin once, and check that the coin balance has increased', async () => {
        let loginResponse = await loginService.login(randomDeviceId);
        validateLogin(loginResponse);
        expect(loginResponse.response.LoginResponse.AccountCreated).toBe(true);

        let userBalanceAtFirstLogin = loginResponse.response.LoginResponse.UserBalance.Coins;
        let spinResponse = await wheelService.spin(loginResponse.response.LoginResponse.AccessToken);
        validateWheelSpin(spinResponse);

        let calculatedBalanceAfterSpin;
        if (spinResponse.response.SpinResult.Rewards[0].RewardResourceType === 1 &&
            spinResponse.response.SpinResult.Rewards[0].RewardDefinitionType === 1) {
            calculatedBalanceAfterSpin = userBalanceAtFirstLogin + spinResponse.response.SpinResult.Rewards[0].Amount;
            expect(spinResponse.response.SpinResult.UserBalance.Coins).toEqual(calculatedBalanceAfterSpin);
        }


        let secondLoginResponse = await loginService.login(randomDeviceId);
        validateLogin(secondLoginResponse);
        expect(secondLoginResponse.response.LoginResponse.UserBalance.Coins).toEqual(calculatedBalanceAfterSpin);
        await validateSessionsPersist(secondLoginResponse, loginResponse);
    });

    test('Spin the wheel until energy runs out and validate', async () => {
        let loginResponse = await loginService.login(randomDeviceId);
        validateLogin(loginResponse);
        expect(loginResponse.response.LoginResponse.AccountCreated).toBe(true);
        let accessToken = loginResponse.response.LoginResponse.AccessToken;
        let spinResponse;
        do {
            spinResponse = await wheelService.spin(accessToken);
            validateWheelSpin(spinResponse);
        } while (spinResponse.response.SpinResult.UserBalance.Energy !== 0);

        // verify response is as expected when there's no energy left
        spinResponse = await wheelService.spin(accessToken);
        expect(spinResponse.response).toBe(ErrorMessages.NOT_ENOUGH_RESOURCES);

        let secondLoginResponse = await loginService.login(randomDeviceId)
        validateLogin(secondLoginResponse);
        expect(secondLoginResponse.response.LoginResponse.UserBalance.Coins).toBeGreaterThan(loginResponse.response.LoginResponse.UserBalance.Coins)
        await validateSessionsPersist(secondLoginResponse, loginResponse)
    })

    test('Validate that the reward wedges are as expected', async () => {
        let loginResponse = await loginService.login(randomDeviceId);
        validateLogin(loginResponse);
        expect(loginResponse.response.LoginResponse.AccountCreated).toBe(true);
        let accessToken = loginResponse.response.LoginResponse.AccessToken;
        let spinResponse;
        do {
            spinResponse = await wheelService.spin(accessToken);
            let selectedIndex = spinResponse.response.SelectedIndex;

            const filePath = path.resolve(__dirname, '../src/helpers/rewards-wedges.json');
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const rewardsWedges = JSON.parse(rawData);

            expect(spinResponse.response.SpinResult.Rewards[0].RewardDefinitionType).toEqual(rewardsWedges[selectedIndex].RewardDefinitionType);
            expect(spinResponse.response.SpinResult.Rewards[0].RewardResourceType).toEqual(rewardsWedges[selectedIndex].RewardResourceType);
            expect(spinResponse.response.SpinResult.Rewards[0].Amount).toEqual(rewardsWedges[selectedIndex].Amount);

            validateWheelSpin(spinResponse);
        } while (spinResponse.response.SpinResult.UserBalance.Energy !== 0);
    });

    test('Validate that one of the wedges rewards gives energy', async () => {
        let loginResponse = await loginService.login(randomDeviceId);
        validateLogin(loginResponse);
        expect(loginResponse.response.LoginResponse.AccountCreated).toBe(true);
        let accessToken = loginResponse.response.LoginResponse.AccessToken;
        let spinResponse;
        let energyAtTheFirstLogin = loginResponse.response.LoginResponse.UserBalance.Energy;
        let iterator: number = 0;
        do {
            spinResponse = await wheelService.spin(accessToken);
            validateWheelSpin(spinResponse);
            iterator++;
        } while (spinResponse.response.SpinResult.UserBalance.Energy !== 0);
        expect(iterator).toBeGreaterThan(energyAtTheFirstLogin)
    });

});