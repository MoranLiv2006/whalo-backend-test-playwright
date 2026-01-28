import {expect} from "@playwright/test";
import {Login} from "../models/login.model";

export async function validateSessionsPersist(secondLoginResponse: Login, firstLoginResponse: Login) {
    // Since the first login created the account, the second login shouldn't create account again (user session persist)
    expect(secondLoginResponse.response.LoginResponse.AccountCreated).toBe(false)
    expect(secondLoginResponse.response.LoginResponse.AccessToken).not.toBe(firstLoginResponse.response.LoginResponse.AccessToken)

    expect(secondLoginResponse.response.LoginResponse.Session.SessionCounter).toEqual(firstLoginResponse.response.LoginResponse.Session.SessionCounter)
    expect(secondLoginResponse.response.LoginResponse.Session.SessionStartTtlSec).toBeGreaterThan(firstLoginResponse.response.LoginResponse.Session.SessionStartTtlSec)
}