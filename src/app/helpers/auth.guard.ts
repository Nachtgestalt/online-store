import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {IAppState, selectAuthState} from "../store/state/app.state";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    getState: Observable<any>;

    constructor(private router: Router,
                private store: Store<IAppState>) {
        this.getState = this.store.select(selectAuthState);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.getState.pipe(map(authState => {
            if (authState.isAuthenticated) {
                return true;
            } else {
                this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
                return false;
            }
        }))
    }
}