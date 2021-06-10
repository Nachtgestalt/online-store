import {createReducer, on} from "@ngrx/store";
import {ChangeErrorMessage, LoginFailure, LoginSuccess, Logout} from "../actions/auth.actions";
import {initialAuthState} from "../state/auth.state";

const _authReducer = createReducer(initialAuthState,
    on(LoginSuccess, (state, {user}) => {
        return {
            ...state,
            isAuthenticated: true,
            user: user,
            errorMessage: null,
            status: 1
        }
    }),
    on(LoginFailure, (state, {payload, hasError, status}) => {
        return {
            ...state,
            isAuthenticated: false,
            errorMessage: payload,
            hasError,
            status
        }
    }),
    on(ChangeErrorMessage, (state, {hasError}) => {
        return {
            ...state,
            hasError
        }
    }),
    on(Logout, () => initialAuthState),
);

export function authReducers(state, action) {
    return _authReducer(state, action);
}