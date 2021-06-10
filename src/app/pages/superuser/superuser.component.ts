import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MediaMatcher} from "@angular/cdk/layout";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../../store/state/app.state";
import {MatSidenav} from "@angular/material/sidenav";
import {Observable} from "rxjs";
import {emptyCart} from "../../store/actions/cart.actions";
import {Logout} from "../../store/actions/auth.actions";
import {DeleteUser} from "../../store/actions/user.actions";

@Component({
    selector: 'app-admin',
    templateUrl: './superuser.component.html',
    styleUrls: ['./superuser.component.scss']
})
export class SuperuserComponent implements OnInit, OnDestroy {
    isAuthenticated: boolean = false;

    dashboardAdminOptions = [
        {
            label: 'Administrar empresas',
            url: './companies',
        },
        {
            label: 'Administrar usuarios',
            url: './users',
        },
        {
            label: 'Administrar privilegios',
            url: './privileges',
        }
    ];

    mobileQuery: MediaQueryList;
    @ViewChild('snav') sidenav: MatSidenav;
    user = null;
    getAuthState: Observable<any>;
    private _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
                iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
                private authenticationService: AuthenticationService,
                private route: ActivatedRoute,
                private router: Router,
                private store: Store<IAppState>) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.getAuthState = this.store.select(selectAuthState);
    }

    ngOnInit(): void {
        this.getAuthState.subscribe((state) => {
            this.isAuthenticated = state.isAuthenticated;
            this.user = state.user;
        });
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    logout() {
        this.router.navigate(['/']);
        this.store.dispatch(emptyCart());
        this.store.dispatch(Logout(this.user));
        this.store.dispatch(DeleteUser());
    }

}
