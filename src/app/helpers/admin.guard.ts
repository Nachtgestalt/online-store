import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, zip} from 'rxjs';
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../store/state/app.state";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    getState: Observable<any>;
    getSetupState: Observable<any>;

    constructor(private router: Router,
                private store: Store<IAppState>) {
        this.getState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return zip(this.getState, this.getSetupState).pipe(
            map(res => {
                let [authState, setupState] = res
                if (authState.user.setup.length > 0) {
                    let isUserOfSetup = authState.user.setup.filter(setup => {
                        if (setup.setupId === setupState.id && setup.isRoot) {
                            return true
                        }
                    })
                    if (isUserOfSetup.length > 0) {
                        return true;
                    } else {
                        this.router.navigate([`./${setupState.companyAccount}`])
                        return false
                    }
                } else {
                    this.router.navigate(['./'])
                    return false;
                }
            }));
    }

}
