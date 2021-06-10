import {ActionReducerMap} from "@ngrx/store";
import {IAppState} from "../state/app.state";
import {cartReducers} from "./cart.reducers";
import {authReducers} from "./auth.reducers";
import {userReducer} from "./user.reducer";
import {setupReducer} from "./setup.reducers";

export const appReducers: ActionReducerMap<IAppState, any> = {
    cart: cartReducers,
    authState: authReducers,
    user: userReducer,
    setup: setupReducer
};
