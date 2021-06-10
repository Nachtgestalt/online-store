import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../../services/authentication.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {IAppState, selectAuthState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {ChangeErrorMessage, Login, LoginFailure} from "../../../store/actions/auth.actions";
import {Observable, Subscription} from "rxjs";
import {IAuthState} from "../../../store/state/auth.state";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    errorMessage = '';
    hasError = false;
    returnUrl: string;
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    getState: Observable<any>;
    subscription: Subscription;

    userNotConfirmed = false
    hide = true;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
                private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private router: Router,
                private authenticationService: AuthenticationService,
                private store: Store<IAppState>) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.getState = this.store.select(selectAuthState);
    }

    get f() {
        return this.loginForm.controls
    };

    ngOnInit(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '../';
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        this.subscription = this.getState.subscribe((state: IAuthState) => {
            let {user} = state;

            if (state.status === 0) {
                this.router.navigate(['../confirm-account', this.f.email.value], {relativeTo: this.route})
                    .then(() => this.store.dispatch(LoginFailure({hasError: false, status: 1})))
            }
            // if (state.status === 0) {
            //     this.loginForm.addControl('confirm', new FormControl())
            //     this.userNotConfirmed = true;
            //     return;
            // } else {
            //     this.userNotConfirmed = false;
            // }

            if (state.isAuthenticated) {
                this.router.navigate([this.returnUrl], {relativeTo: this.route});
            }
            this.hasError = state.hasError;
            this.errorMessage = state.errorMessage;
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.errorMessage = '';
        this.hasError = false;
        this.store.dispatch(ChangeErrorMessage({hasError: false}));
    }

    onSubmit() {
        this.markFormGroupTouched(this.loginForm);

        if (this.loginForm.invalid) {
            return;
        }

        let password = this.f.password.value;
        this.f.password.patchValue(password.trim());

        this.store.dispatch(Login({user: this.loginForm.value}));
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }

    goToRegister() {
        this.router.navigate(['../register'], {relativeTo: this.route})
    }

    goToForgotPassword() {
        this.router.navigate(['../forgot-password'], {relativeTo: this.route})
    }

    resetLogin() {
        this.loginForm.reset();
        this.store.dispatch(LoginFailure({hasError: false, status: 1}))
    }

    // TODO: Conectar servicio para confirmar cuenta
    confirmAccount() {

    }
}
