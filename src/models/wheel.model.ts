export interface Reward {
    RewardDefinitionType: number;
    RewardResourceType: number;
    Amount: number;
    Multiplier: number;
}

export interface UserBalance {
    Coins: number;
    Gems: number;
    Energy: number;
    EnergyExpirationTS: number;
    EnergyExpirationSeconds: number;
    LastUpdateTS: number;
    ShieldsAmount: number;
    MaxEnergyCapacity: number;
}

export interface SpinResult {
    Rewards: Reward[];
    UserBalance: UserBalance;
}

export interface Spin {
    status: number;
    response: {
        SelectedIndex: number;
        SpinResult: SpinResult;
        Metus_Rate: boolean;
        Metuzm_Zam: boolean;
    };

}
