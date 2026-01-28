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


    test('Login, spin once, and check that the balance has increased', async () => {
        let loginResponse = await loginService.login(randomDeviceId);
        validateLogin(loginResponse);
        expect(loginResponse.response.LoginResponse.AccountCreated).toBe(true);

        // Fetch and store the initial user balance
        let coinsBalanceAtFirstLogin = loginResponse.response.LoginResponse.UserBalance.Coins;
        let gemsBalanceAtFirstLogin = loginResponse.response.LoginResponse.UserBalance.Gems;
        let energyBalanceAtFirstLogin = loginResponse.response.LoginResponse.UserBalance.Energy;

        // Spin the wheel
        let spinResponse = await wheelService.spin(loginResponse.response.LoginResponse.AccessToken);
        validateWheelSpin(spinResponse);

        // Calculate the updated coin balance (after the coin reward from the spin)
        // Also validate the amount of the gems remain the same as the first login, and the amount of energy has decres by 1
        let calculatedCoinsBalanceAfterSpin;
        if (spinResponse.response.SpinResult.Rewards[0].RewardResourceType === 1 &&
            spinResponse.response.SpinResult.Rewards[0].RewardDefinitionType === 1) {
            calculatedCoinsBalanceAfterSpin = coinsBalanceAtFirstLogin + spinResponse.response.SpinResult.Rewards[0].Amount;
            expect(spinResponse.response.SpinResult.UserBalance.Coins).toEqual(calculatedCoinsBalanceAfterSpin);
            expect(spinResponse.response.SpinResult.UserBalance.Gems).toEqual(gemsBalanceAtFirstLogin);
            expect(spinResponse.response.SpinResult.UserBalance.Energy).toBeLessThan(energyBalanceAtFirstLogin);
        }

        // Sleep for 1 second because the automation is too fast, causing the second login to appear as the same timestamp as the first login
        new Promise(resolve => setTimeout(resolve, 1500));

        // Second time login
        let secondLoginResponse = await loginService.login(randomDeviceId);
        validateLogin(secondLoginResponse);

        // Validate that the user balance is the same as after the wheel has spun
        expect(secondLoginResponse.response.LoginResponse.UserBalance.Coins).toEqual(calculatedCoinsBalanceAfterSpin);
        expect(secondLoginResponse.response.LoginResponse.UserBalance.Gems).toEqual(spinResponse.response.SpinResult.UserBalance.Gems);
        expect(secondLoginResponse.response.LoginResponse.UserBalance.Energy).toEqual(spinResponse.response.SpinResult.UserBalance.Energy);
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