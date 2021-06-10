import {IUser} from "../../models/user.interface";

export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    errorMessage: string | null;
    hasError: boolean;
    status: number
}

export const initialAuthState: IAuthState = {
    user: null,
    isAuthenticated: false,
    errorMessage: null,
    hasError: false,
    status: 1
}