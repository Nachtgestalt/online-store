import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {first} from "rxjs/operators";
import {AuthenticationService} from "../../../services/authentication.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    error = '';
    registrationSuccess = false;
    hide = true;

    constructor(private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    get f() {
        return this.registerForm.controls
    };

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        })
    }

    onSubmit() {
        this.markFormGroupTouched(this.registerForm);
        if (this.registerForm.invalid) {
            return;
        }

        this.authenticationService.register(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['../confirm-account', this.f.email.value], {relativeTo: this.route});

                    // setTimeout(() => {
                    //     this.router.navigate(['../login'], {relativeTo: this.route});
                    // }, 3000)
                },
                ({error}) => {
                    console.log(error)
                    this.error = error.message;
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

    goToLogin() {
        this.router.navigate(['../login'], {relativeTo: this.route})
    }

    goToForgotPassword() {
        this.router.navigate(['../forgot-password'], {relativeTo: this.route})
    }

}
