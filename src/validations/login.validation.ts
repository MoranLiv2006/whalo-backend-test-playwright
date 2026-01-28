import {expect} from '@playwright/test';
import {Login} from '../models/login.model';

export function validateLogin(loginResponse: Login) {
    expect(loginResponse.status).toBe(0);
    expect(loginResponse.response.LoginStatus).toBe(1);

    let loginResponseData = loginResponse.response.LoginResponse;

    expect(loginResponseData.ExternalPlayerId).toBeTruthy();
    expect(loginResponseData.AccessToken).toBeTruthy();
    expect(loginResponseData.DisplayName).toContain("Guest_");

    expect(loginResponseData.CoinsAmount).toBe(loginResponseData.UserBalance.Coins);
    expect(loginResponseData.EnergyAmount).toBe(loginResponseData.UserBalance.Energy);
    expect(loginResponseData.GemsAmount).toBe(loginResponseData.UserBalance.Gems);
    expect(loginResponseData.EnergyExpirationSeconds).toBe(loginResponseData.UserBalance.EnergyExpirationSeconds);

    expect(loginResponseData.UserBalance.Coins).toBeGreaterThanOrEqual(80000);
    expect(loginResponseData.UserBalance.Energy).toBeGreaterThanOrEqual(0);
    expect(loginResponseData.UserBalance.Energy).toBeLessThanOrEqual(loginResponseData.UserBalance.MaxEnergyCapacity);
    expect(loginResponseData.EnergyExpirationSeconds).toBeLessThan(3600);

    expect(loginResponseData.Session.SessionCounter).toBeGreaterThan(0);
    expect(loginResponseData.Session.SessionStartTtlSec).toBeGreaterThanOrEqual(0);
}
