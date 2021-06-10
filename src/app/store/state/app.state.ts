import {ICartState, initialCartState} from "./cart.state";
import {IAuthState, initialAuthState} from "./auth.state";
import {createFeatureSelector} from "@ngrx/store";
import {initialUserState, IUserState} from "./user.state";
import {initialSetupState, ISetupState} from "./setup.state";

export interface IAppState {
    authState: IAuthState;
    cart: ICartState;
    user: IUserState;
    setup: ISetupState;
}

export const initialAppState: IAppState = {
    authState: initialAuthState,
    cart: initialCartState,
    user: initialUserState,
    setup: initialSetupState
}

export function getInitialState(): IAppState {
    return initialAppState
}

export const selectAuthState = createFeatureSelector<IAppState>('authState');
export const selectCartState = createFeatureSelector<IAppState>('cart');
export const selectUserState = createFeatureSelector<IAppState>('user');
export const selectSetupState = createFeatureSelector<IAppState>('setup');
