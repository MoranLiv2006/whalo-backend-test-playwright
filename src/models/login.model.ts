export interface Session {
    SessionStartTtlSec: number;
    SessionCounter: number;
}

export interface UserBalance {
    Coins: number;
    Gems: number;
    Energy: number;
    EnergyExpirationSeconds: number;
    MaxEnergyCapacity: number;
}

export interface LoginResponse {
    AccessToken: string;
    CoinsAmount: number;
    GemsAmount: number;
    EnergyAmount: number;
    UserBalance: UserBalance;
    AccountCreated: boolean;
    Session: Session;
    ExternalPlayerId: string;
    DisplayName: string;
    EnergyExpirationSeconds: number
}

export interface Login {
    status: number;
    response: {
        LoginStatus: number;
        LoginResponse: LoginResponse;
    }
}