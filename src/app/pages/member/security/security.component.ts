import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../services/authentication.service";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../../../store/state/app.state";
import {Observable} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-security',
    templateUrl: './security.component.html',
    styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

    @ViewChild('myForm') myForm: NgForm;

    hide = true;
    changePasswordForm: FormGroup;
    getAuthState: Observable<any>;

    listRefreshTokens$: Observable<{ currentSession, otherSessions }>;
    currentSession;
    otherSessions: Array<any>

    constructor(private authService: AuthenticationService,
                private store: Store<IAppState>,
                private snackBar: MatSnackBar,
                private cd: ChangeDetectorRef) {
        this.getAuthState = store.select(selectAuthState);
    }

    get f() {
        return this.changePasswordForm.controls;
    }

    /* Shorthands for form controls (used from within template) */
    get newPassword() {
        return this.changePasswordForm.get('newPassword');
    }

    get confirmNewPassword() {
        return this.changePasswordForm.get('confirmNewPassword');
    }

    ngOnInit(): void {
        this.createFormGroup();

        this.fetchRefreshTokens();
    }

    fetchRefreshTokens() {
        this.listRefreshTokens$ = this.getAuthState
            .pipe(
                switchMap(({user}) =>
                    this.authService.fetchRefreshTokens(user.id)
                        .pipe(
                            map((refreshTokens: Array<any>) => {
                                let otherSessions = refreshTokens.filter(x => x.refreshToken !== user.refreshToken);
                                let currentSession = refreshTokens.find(x => x.refreshToken === user.refreshToken)
                                return {
                                    currentSession,
                                    otherSessions
                                }
                            })
                        )
                )
            );

        this.listRefreshTokens$
            .pipe(take(1))
            .subscribe(result => {
                console.log(result);
                this.currentSession = result.currentSession;
                this.otherSessions = result.otherSessions;
                console.log(this.otherSessions.length)
                this.cd.detectChanges();
            })
    }

    createFormGroup() {
        this.changePasswordForm = new FormGroup({
            'currentPassword': new FormControl('', Validators.required),
            'newPassword': new FormControl('', Validators.required),
            'confirmNewPassword': new FormControl('', Validators.required)
        }, {validators: this.mustMatch('newPassword', 'confirmNewPassword')})
    }

    onSubmitChangePassword() {
        this.markFormGroupTouched(this.changePasswordForm);
        if (this.changePasswordForm.invalid) {
            return;
        }

        let changePassword$ = this.getAuthState
            .pipe(
                switchMap(({user}) => this.authService.changePassword(this.changePasswordForm.value, user.id))
            );

        changePassword$.subscribe(
            (res: any) => {
                if (res.success) {
                    this.snackBar.open('Contraseña actualizada', 'Aceptar', {
                        duration: 2000,
                    });
                    this.changePasswordForm.reset();
                    this.myForm.resetForm();
                }
            },
            error => this.snackBar.open(error, 'Aceptar', {
                panelClass: 'snack-danger'
            })
        );
    }

    onPasswordInput() {
        if (this.changePasswordForm.hasError('mustMatch'))
            this.confirmNewPassword.setErrors([{'mustMatch': true}]);
        else
            this.confirmNewPassword.setErrors(null);
    }

    mustMatch(controlName: string, matchingControlName: string) {
        return (group: FormGroup) => {
            let control = group.controls[controlName].value;
            let matchingControl = group.controls[matchingControlName].value

            if (control === matchingControl) {
                return null;
            }

            return {
                mustMatch: true
            }
        };
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }

    revokeRefreshTokens() {
        if (!this.otherSessions || !this.otherSessions.length) {
            return;
        }
        this.authService.revokeRefreshTokens(this.otherSessions)
            .subscribe(res => {
                console.log(res);
                this.fetchRefreshTokens();
            })
    }


}
