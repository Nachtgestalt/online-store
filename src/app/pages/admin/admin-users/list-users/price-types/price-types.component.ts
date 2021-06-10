import {Component, Inject, OnInit} from '@angular/core';
import {SetupService} from "../../../../../services/setup.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {SetupUserService} from "../../../../../services/setup-user.service";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
    selector: 'app-price-types',
    templateUrl: './price-types.component.html',
    styleUrls: ['./price-types.component.scss']
})
export class PriceTypesComponent implements OnInit {
    priceTypeForm: FormGroup;
    priceTypes$: Observable<any>;
    showPriceOptions: any[];

    constructor(public dialogRef: MatDialogRef<PriceTypesComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private setupService: SetupService,
                private setupUserService: SetupUserService,
                private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.showPriceOptions = [
            {value: 0, label: 'No mostrar precios'},
            {value: 1, label: 'Mostrar precios'},
        ];

        let {mlPriceId, showPrice, setup} = this.data.selection;
        this.priceTypeForm = new FormGroup({
            'priceId': new FormControl(),
            'showPrice': new FormControl(showPrice)
        });
        console.log(this.data.selection);
        if (mlPriceId !== 0) {
            this.priceTypeForm.get('priceId').patchValue(mlPriceId);
        }
        this.priceTypeForm.get('showPrice').patchValue(showPrice);
        this.priceTypes$ = this.setupService.fetchPriceTypes(setup.companyId);
    }

    save() {
        let {setupId} = this.data.selection;
        let setupUser = {
            ...this.data.selection,
            id: +this.data.selection.id,
            mlPriceId: this.priceTypeForm.get('priceId').value,
            showPrice: this.priceTypeForm.get('showPrice').value
        }

        let {statusField, osUserPrivileges, emailCol, showStockField, ...res} = setupUser
        this.setupUserService.updateSetupUser(setupUser.id, res, setupId)
            .subscribe(() => {
                    this.snackBar.open('Cambios realizados', 'Aceptar', {
                        duration: 2000,
                    });
                    this.dialogRef.close(true);
                },
                () => {
                    this.snackBar.open('Error al realizar los cambios', 'Aceptar', {
                        panelClass: 'snack-danger'
                    })
                    this.dialogRef.close(false);
                }
            );
    }

}
