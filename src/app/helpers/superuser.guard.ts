import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../store/state/app.state";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SuperuserGuard implements CanActivate {
    getState: Observable<any>;

    constructor(private router: Router,
                private store: Store<IAppState>) {
        this.getState = this.store.select(selectAuthState);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.getState.pipe(
            map(authState => {
                if (authState.user.isRoot) {
                    return true
                } else {
                    this.router.navigate(['/']);
                    return false;
                }
            }))
    }

}
