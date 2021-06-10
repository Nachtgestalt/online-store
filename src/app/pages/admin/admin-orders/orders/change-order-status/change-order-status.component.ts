import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TypeStatusOrdersService} from "../../../../../services/type-status-orders.service";
import {Observable} from "rxjs";
import {IAppState, selectSetupState} from "../../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {switchMap} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";
import {StatusOrdersService} from "../../../../../services/status-orders.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-change-order-status',
    templateUrl: './change-order-status.component.html',
    styleUrls: ['./change-order-status.component.scss']
})
export class ChangeOrderStatusComponent implements OnInit {
    orderStatusForm: FormGroup;
    typeStatusInput = new FormControl();
    typeStatus$: Observable<any>
    private getSetupState: Observable<any>;

    constructor(public dialogRef: MatDialogRef<ChangeOrderStatusComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private typeStatusOrdersService: TypeStatusOrdersService,
                private statusOrdersService: StatusOrdersService,
                private snackBar: MatSnackBar,
                private store: Store<IAppState>) {
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        let {selection} = this.data;
        this.orderStatusForm = new FormGroup({
            'ordersId': new FormControl(selection.id),
            'observation': new FormControl(''),
            'typeStatusOrdersId': new FormControl(''),
        })
        this.typeStatus$ = this.getSetupState
            .pipe(
                switchMap(({id}) => this.typeStatusOrdersService.fetchTypeStatusOrders(id)),
            );
    }

    save() {
        let {setupId} = this.data.selection;
        let statusOrder = this.orderStatusForm.value;
        this.statusOrdersService.saveStatusOrder(statusOrder, setupId)
            .subscribe(() => {
                    this.snackBar.open('Estado actualizado', 'Aceptar', {duration: 1000})
                    this.dialogRef.close(true);
                },
                () => {
                    this.snackBar.open('Error al actualizar', 'Aceptar', {
                        panelClass: 'snack-danger'
                    })
                });
    }

}
