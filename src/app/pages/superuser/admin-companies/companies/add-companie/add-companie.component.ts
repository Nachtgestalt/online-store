import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SetupService} from "../../../../../services/setup.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-add-companie',
    templateUrl: './add-companie.component.html',
    styleUrls: ['./add-companie.component.scss']
})
export class AddCompanieComponent implements OnInit {

    showStockOptions;

    showOutOfStockOptions;

    labelHeader = '';

    companieForm: FormGroup;

    get f() {
        return this.companieForm.controls
    };

    constructor(public dialogRef: MatDialogRef<AddCompanieComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _snackBar: MatSnackBar,
                private setupService: SetupService) {
    }

    ngOnInit(): void {
        this.showStockOptions = [
            {value: -1, label: 'No mostrar stock en ningun momento'},
            {value: 0, label: 'Mostrar stock a todos'},
            {value: 1, label: 'Mostrar stock solo a usuarios autenticados'},
            {value: 2, label: 'Mostrar solo a usuarios marcados'}
        ];

        this.showOutOfStockOptions = [
            {value: 0, label: 'No'},
            {value: 1, label: 'Si'}
        ]
        this.companieForm = new FormGroup({
            'companyId': new FormControl(null, Validators.required),
            'bodegaId': new FormControl(0),
            'companyAccount': new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]),
            'bucketToImages': new FormControl('', Validators.required),
            'country': new FormControl(),
            'city': new FormControl(),
            'address': new FormControl(),
            'nombreComercial': new FormControl(),
            'slogan': new FormControl(),
            'logoName': new FormControl(''),
            'showStock': new FormControl(1, Validators.compose([Validators.max(4), Validators.min(-1)])),
            'expireDate': new FormControl('', Validators.required),
            'codEstablecimiento': new FormControl('', Validators.maxLength(3)),
            'showOutOfStock': new FormControl(1, Validators.maxLength(3))
        })
        if (this.data.edit) {
            this.labelHeader = 'Editar'
            console.log(this.data);
            this.companieForm.patchValue(this.data.selection);
        } else {
            this.labelHeader = 'Guardar'
        }
    }

    saveCompanieSetup() {
        this.markFormGroupTouched(this.companieForm);
        if (this.companieForm.invalid) {
            return;
        }
        if (!this.companieForm.get('bodegaId').value) {
            this.companieForm.get('bodegaId').patchValue(0)
        }

        if (!this.companieForm.get('codEstablecimiento').value) {
            this.companieForm.get('codEstablecimiento').patchValue('001')
        }

        if (this.data.edit) {
            let {id} = this.data.selection;
            this.setupService.updateSetupCompany(id, this.companieForm.value)
                .subscribe(
                    res => {
                        this.dialogRef.close(true);
                        this._snackBar.open('Compañia editada con exito', 'Aceptar', {
                            duration: 2000,
                        });
                    },
                    () =>
                        this._snackBar.open('Error al editar compañia', 'Aceptar', {
                            panelClass: 'snack-danger'
                        })
                )
        } else {
            this.setupService.saveSetupCompany(this.companieForm.value)
                .subscribe(
                    res => {
                        this.dialogRef.close(true);
                        this._snackBar.open('Compañia guardada con exito', 'Aceptar', {
                            duration: 2000,
                        });
                    },
                    () =>
                        this._snackBar.open('Error al guardar', 'Aceptar', {
                            panelClass: 'snack-danger'
                        })
                )
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
