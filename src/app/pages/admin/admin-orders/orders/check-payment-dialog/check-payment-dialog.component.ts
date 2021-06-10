import {Component, Inject, OnInit} from '@angular/core';
import {FileItem} from "../../../../../models/file-item";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderService} from "../../../../../services/order.service";
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {IAppState, selectAuthState} from "../../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {switchMap, take} from "rxjs/operators";

@Component({
    selector: 'app-check-payment-dialog',
    templateUrl: './check-payment-dialog.component.html',
    styleUrls: ['./check-payment-dialog.component.scss']
})
export class CheckPaymentDialogComponent implements OnInit {

    archivos: FileItem[] = [];
    images: Observable<any[]>;
    orderData;
    preview;
    observationTextArea = new FormControl('');

    getAuthState: Observable<any>;

    constructor(public dialogRef: MatDialogRef<CheckPaymentDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _snackBar: MatSnackBar,
                private orderService: OrderService,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState)
    }

    ngOnInit(): void {
        let {selection} = this.data;
        let {setup, verifiedPay} = selection;
        this.orderData = {
            verifiedPay,
            companyId: setup.companyId,
            orderId: selection.id
        }
        this.images = this.orderService.getPics(this.orderData);
    }

    togglePayStatus() {
        this.getAuthState.pipe(
            take(1),
            switchMap((authState) => {
                let orderWithPayRevision = {
                    usersId: +authState.user.id,
                    observation: this.observationTextArea.value,
                    ordersId: this.orderData.orderId,
                    verifiedPay: this.orderData.verifiedPay
                }
                return this.orderService.togglePayStatus(orderWithPayRevision)
            })
        ).subscribe(
            () => {
                this.dialogRef.close(true);
                this._snackBar.open('Pago verificado con exito', 'Aceptar', {
                    duration: 2000,
                });
            },
            () => {
                this._snackBar.open('Error al verificar pago', 'Aceptar', {
                    duration: 2000,
                    panelClass: 'snack-danger'
                });
            }
        )

    }

}
