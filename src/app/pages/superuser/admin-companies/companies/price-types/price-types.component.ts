import {Component, Inject, OnInit} from '@angular/core';
import {SetupService} from "../../../../../services/setup.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";

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
                private setupService: SetupService) {
    }

    ngOnInit(): void {
        this.showPriceOptions = [
            {value: -1, label: 'No mostrar'},
            {value: 0, label: 'Mostrar a todos los usuarios'},
            {value: 1, label: 'Mostrar a usuarios identificados'},
            {value: 2, label: 'Mostrar solo a usuarios reconocidos'},
        ];

        let {companyId, mlPriceId, showPrice} = this.data.selection;
        this.priceTypeForm = new FormGroup({
            'priceId': new FormControl(),
            'showPrice': new FormControl(showPrice)
        });
        console.log(this.data.selection);
        if (mlPriceId !== 0) {
            this.priceTypeForm.get('priceId').patchValue(mlPriceId);
        }
        this.priceTypes$ = this.setupService.fetchPriceTypes(companyId);
    }

    save() {
        let setup = {
            ...this.data.selection,
            mlPriceId: this.priceTypeForm.get('priceId').value,
            showPrice: this.priceTypeForm.get('showPrice').value
        }

        let {statusField, ...res} = setup
        this.setupService.updateSetupCompany(setup.id, res)
            .subscribe(res => {
                console.log(res);
            });
    }

}
