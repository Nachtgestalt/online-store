export interface IUser {
    id?: number;
    email?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
    status: number;
}
