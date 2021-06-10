import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {IAppState, selectSetupState} from "../../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {take} from "rxjs/operators";
import {BankAccountsService} from "../../../../../services/bank-accounts.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-add-bank-account',
    templateUrl: './add-bank-account.component.html',
    styleUrls: ['./add-bank-account.component.scss']
})
export class AddBankAccountComponent implements OnInit {
    labelHeader: 'Agregar' | 'Editar' = 'Agregar';

    bankAccountForm: FormGroup;
    private getSetupState: Observable<any>;

    get f() {
        return this.bankAccountForm.controls;
    };

    constructor(private bankAccountsService: BankAccountsService,
                public dialogRef: MatDialogRef<AddBankAccountComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private snackBar: MatSnackBar,
                private store: Store<IAppState>) {
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        let {edit, selection} = this.data;
        this.labelHeader = edit ? 'Editar' : 'Agregar';
        this.bankAccountForm = new FormGroup({
            'institucionFinanciera': new FormControl('', Validators.required),
            'tipoCuenta': new FormControl('', Validators.required),
            'nroCuenta': new FormControl('', Validators.required),
            'titularCuenta': new FormControl('', Validators.required),
            'docIdentidad': new FormControl('', Validators.maxLength(13)),
            'emailNotificacion': new FormControl('', Validators.email),
            'setupId': new FormControl()
        })

        this.getSetupState.pipe(
            take(1)
        ).subscribe(({id}) => this.bankAccountForm.get('setupId').patchValue(id))

        if (edit) {
            this.bankAccountForm.patchValue(selection);
        }
    }

    save() {
        let setupId = this.bankAccountForm.get('setupId').value;
        this.markFormGroupTouched(this.bankAccountForm);
        if (this.bankAccountForm.invalid) {
            return;
        }
        let {selection, edit} = this.data;
        if (edit) {
            this.bankAccountForm.addControl('id', new FormControl(selection.id));
            let bankAccount = this.bankAccountForm.value;
            this.bankAccountsService.updateBankAccount(bankAccount, setupId)
                .subscribe(
                    () => {
                        this.dialogRef.close(true);
                        this.snackBar.open('Cuenta bancaria modificada con exito', 'Aceptar', {
                            duration: 2000,
                        });
                    },
                    () => {
                        this.snackBar.open('Error al guardar', 'Aceptar', {
                            panelClass: 'snack-danger'
                        })
                    }
                );

        } else {
            let bankAccount = this.bankAccountForm.value;
            this.bankAccountsService.saveBankAccount(bankAccount, setupId)
                .subscribe(
                    () => {
                        this.dialogRef.close(true);
                        this.snackBar.open('Cuenta bancaria guardada con exito', 'Aceptar', {
                            duration: 2000,
                        });
                    },
                    () => {
                        this.snackBar.open('Error al guardar', 'Aceptar', {
                            panelClass: 'snack-danger'
                        })
                    }
                );
        }
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
