import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../services/authentication.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {first} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    resetPasswordSucces = false;
    forgotPasswordForm: FormGroup;

    error = '';

    constructor(private authService: AuthenticationService,
                private snackBar: MatSnackBar,
                private router: Router,
                private route: ActivatedRoute) {
    }

    get f() {
        return this.forgotPasswordForm.controls
    };

    ngOnInit(): void {
        this.forgotPasswordForm = new FormGroup({
            'email': new FormControl('', Validators.compose([Validators.required, Validators.email]))
        })
    }

    onSubmit() {
        let email = this.forgotPasswordForm.get('email').value;
        this.markFormGroupTouched(this.forgotPasswordForm);
        if (this.forgotPasswordForm.invalid) {
            return;
        }

        this.authService.resetPassword(email)
            .pipe(first())
            .subscribe(
                (res: any) => {
                    let {message} = res;
                    this.resetPasswordSucces = true;
                    setTimeout(() => {
                        this.router.navigate(['../login'], {relativeTo: this.route});
                    }, 5000)

                },
                ({error}) => {
                    let {message} = error
                    this.snackBar.open(message, 'Aceptar', {panelClass: 'snack-danger'})
                }
            )
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }


}
