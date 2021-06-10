import {Injectable} from "@angular/core";
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectCartState} from "../store/state/app.state";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class CheckoutGuard implements CanActivate {
    getAuthState: Observable<any>;
    getCartState: Observable<any>;
    returnUrl: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getCartState = this.store.select(selectCartState);
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.store.pipe(
            map(store => {
                if (store.cart.ids.length === 0) {
                    this.router.navigate(['./cart'], {
                        relativeTo: this.route,
                        queryParams: {returnUrl: state.url}
                    });
                    return false
                } else if (!store.authState.isAuthenticated) {
                    let redirectUrl = `/${store.setup.companyAccount}/login`;
                    this.router.navigate([redirectUrl], {
                        relativeTo: this.route,
                        queryParams: {returnUrl: state.url}
                    });
                    return false
                } else {
                    return true
                }
                }
            ))
    }

}
