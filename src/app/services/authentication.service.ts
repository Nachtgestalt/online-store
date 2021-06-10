import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {IChangePasswordForm} from "../models/changePasswordForm.interface";
import {tap} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    public currentUser: Observable<any>;
    private currentUserSubject: BehaviorSubject<any>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('token'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    getToken(): string {
        return localStorage.getItem('token');
    }

    register(email: string, password: string) {
        return this.http.post<any>(`${environment.BASE_URL}/auth/register`, {email, password});
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.BASE_URL}/auth/login`, {email, password})
        // .pipe(
        //     tap(user => {
        //         if (user && user.accessToken) {
        //             localStorage.setItem('authState', JSON.stringify(user));
        //             this.currentUserSubject.next(user);
        //         }
        //     })
        // )
    }

    logout(user) {
        let {id, refreshToken} = user
        localStorage.removeItem('currentUser');
        return this.http.post(`${environment.BASE_URL}/auth/logout`, {id, refreshToken})
    }

    changePassword(changePasswordForm: IChangePasswordForm, userId: number) {
        return this.http.post(`${environment.BASE_URL}/auth/changePassword/${userId}`, changePasswordForm)
    }

    refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        return this.http.post<{ accessToken: string; refreshToken: string }>(`${environment.BASE_URL}/auth/refresh-token`, {refreshToken})
            .pipe(
                tap(response => {
                    this.setToken('token', response.accessToken);
                    this.setToken('refreshToken', response.refreshToken);
                })
            );
    }

    fetchRefreshTokens(userId: number) {
        return this.http.get(`${environment.BASE_URL}/auth/list-refresh-tokens/${userId}`);
    }

    revokeRefreshTokens(refreshTokens) {
        return this.http.post(`${environment.BASE_URL}/auth/revoke-refresh-tokens`, refreshTokens);
    }

    setToken(key: string, token: string): void {
        localStorage.setItem(key, token);
    }

    resetPassword(email) {
        return this.http.get(`${environment.BASE_URL}/auth/forgot-password/${email}`);
    }

    confirmAccount(email, verificationCode) {
        return this.http.post(`${environment.BASE_URL}/auth/confirm-account/${email}`, {verificationCode});
    }

    resendConfirmationCode(email) {
        return this.http.get(`${environment.BASE_URL}/auth/resend-confirm-code/${email}`);
    }
}
