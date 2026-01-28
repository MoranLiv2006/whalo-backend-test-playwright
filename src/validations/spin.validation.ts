import {expect} from '@playwright/test';
import {Spin} from "../models/wheel.model";

export function validateWheelSpin(spinResponse: Spin) {
    expect(spinResponse.status).toBe(0);

    let rewards = spinResponse.response.SpinResult.Rewards;
    expect(Array.isArray(rewards)).toBe(true);
    expect(rewards[0].RewardDefinitionType).toBeTruthy();
    expect(rewards[0].RewardDefinitionType).toBeGreaterThanOrEqual(1);
    expect(rewards[0].RewardResourceType).toBeGreaterThanOrEqual(0);
    expect(rewards.length).toBeGreaterThan(0);
    expect(rewards[0].Amount).toBeGreaterThan(0);
    expect(rewards[0].Multiplier).toEqual(1);

    let userBalance = spinResponse.response.SpinResult.UserBalance;

    expect(userBalance.Coins).toBeGreaterThanOrEqual(0);
    expect(userBalance.Gems).toBeGreaterThanOrEqual(0);
    expect(userBalance.Energy).toBeGreaterThanOrEqual(0);
    expect(userBalance.EnergyExpirationTS).toBeGreaterThanOrEqual(0);
    expect(userBalance.EnergyExpirationSeconds).toBeGreaterThanOrEqual(0);
    expect(userBalance.ShieldsAmount).toBeGreaterThanOrEqual(0);
    expect(userBalance.Energy).toBeLessThanOrEqual(userBalance.MaxEnergyCapacity);

    expect(spinResponse.response.Metus_Rate).toBe(true);
    expect(spinResponse.response.Metuzm_Zam).toBe(false);
}
