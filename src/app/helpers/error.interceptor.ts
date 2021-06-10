import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthenticationService} from "../services/authentication.service";
import {combineLatest, Observable, throwError} from "rxjs";
import {catchError, take} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../store/state/app.state";
import {Router} from "@angular/router";
import {emptyCart} from "../store/actions/cart.actions";
import {Logout} from "../store/actions/auth.actions";
import {DeleteUser} from "../store/actions/user.actions";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    constructor(private authenticationService: AuthenticationService,
                private store: Store<IAppState>,
                private router: Router) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(
                err => {
                    if ([401, 403].indexOf(err.status) !== -1) {
                        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
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
                    }

                    const error = err.error.message || err.statusText;
                    return throwError(error);
                }
            )
        )
    }
}