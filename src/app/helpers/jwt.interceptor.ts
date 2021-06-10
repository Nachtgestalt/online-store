import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthenticationService} from "../services/authentication.service";
import {BehaviorSubject, combineLatest, Observable, throwError} from "rxjs";
import {catchError, filter, switchMap, take} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../store/state/app.state";
import {emptyCart} from "../store/actions/cart.actions";
import {Logout} from "../store/actions/auth.actions";
import {DeleteUser} from "../store/actions/user.actions";
import {Router} from "@angular/router";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    getAuthState: Observable<any>;
    getSetupState: Observable<any>;
    private refreshingInProgress: boolean;
    private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(private authenticationService: AuthenticationService,
                private store: Store<IAppState>,
                private router: Router) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const accessToken: string = this.authenticationService.getToken();
        const isLoggedIn = accessToken;
        // const isApiUrl = request.url.startsWith(environment.BASE_URL);
        // if (isLoggedIn && isApiUrl) {
        //     request = request.clone({
        //         setHeaders: {
        //             Authorization: `Bearer ${token}`
        //         }
        //     });
        // }
        //
        return next.handle(this.addAuthorizationHeader(request, accessToken))
            .pipe(
                catchError(err => {
                    // in case of 401 http error
                    if (err instanceof HttpErrorResponse && err.status === 401) {
                        // get refresh tokens
                        const refreshToken = localStorage.getItem('refreshToken');    // if there are tokens then send refresh token request
                        if (refreshToken && accessToken) {
                            return this.refreshToken(request, next);
                        }    // otherwise logout and redirect to login page
                        return this.logoutAndRedirect(err);
                    }   // in case of 403 http error (refresh token failed)
                    if (err instanceof HttpErrorResponse && err.status === 403) {
                        // logout and redirect to login page
                        return this.logoutAndRedirect(err);
                    }
                    // if error has status neither 401 nor 403 then just return this error
                    return throwError(err);
                })
            );
    }

    private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
        // If there is token then add Authorization header otherwise don't change    request
        if (token) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return request;
    }

    private refreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.refreshingInProgress) {
            this.refreshingInProgress = true;
            this.accessTokenSubject.next(null);
            return this.authenticationService.refreshToken()
                .pipe(
                    switchMap((res) => {
                        this.refreshingInProgress = false;
                        this.accessTokenSubject.next(res.accessToken);
                        // repeat failed request with new token
                        return next.handle(this.addAuthorizationHeader(request, res.accessToken));
                    })
                );
        } else {
            // wait while getting new token
            return this.accessTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => {
                    // repeat failed request with new token
                    return next.handle(this.addAuthorizationHeader(request, token));
                }));
        }
    }

    private logoutAndRedirect(err): Observable<HttpEvent<any>> {
        combineLatest([this.getAuthState, this.getSetupState])
            .pipe(take(1))
            .subscribe(
                (res) => {
                    let [authState, setupState] = res;
                    let redirectUrl = `/${setupState.companyAccount}`
                    this.router.navigate([redirectUrl]);
                    this.store.dispatch(emptyCart());
                    this.store.dispatch(Logout(authState.user));
                    this.store.dispatch(DeleteUser());
                }
            );
        const error = err.error.message || err.statusText;

        return throwError(error);
    }
}
