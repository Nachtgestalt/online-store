import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../../services/authentication.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-confirm-account',
    templateUrl: './confirm-account.component.html',
    styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit {

    verificationCodeInput: FormControl;
    registrationSuccess = false;
    error = '';
    email = '';

    constructor(private route: ActivatedRoute,
                private router: Router,
                private authService: AuthenticationService,
                private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.email = this.route.snapshot.paramMap.get('email');
        console.log(this.email);
        this.verificationCodeInput = new FormControl('', Validators.required);
    }

    onSubmit() {
        if (this.verificationCodeInput.invalid) {
            return;
        }
        this.authService.confirmAccount(this.email, this.verificationCodeInput.value)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    if (res.success) {
                        this.registrationSuccess = true;
                        setTimeout(() => {
                            this.router.navigate(['../../login'], {relativeTo: this.route});
                        }, 3000)
                    }
                },
                () => this.snackBar.open('Error al verificar cuenta', 'Aceptar', {panelClass: 'snack-danger'})
            )

    }

    resendVerificationCode() {
        this.authService.resendConfirmationCode(this.email)
            .subscribe(
                (res: any) => {
                    this.snackBar.open(res.message, 'Aceptar', {duration: 2000})
                },
                () => this.snackBar.open('Error al reenviar codigo', 'Aceptar', {panelClass: 'snack-danger'})
            );
    }

}
