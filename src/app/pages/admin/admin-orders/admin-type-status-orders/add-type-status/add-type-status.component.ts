import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TypeStatusOrdersService} from "../../../../../services/type-status-orders.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-add-status',
    templateUrl: './add-type-status.component.html',
    styleUrls: ['./add-type-status.component.scss']
})
export class AddTypeStatusComponent implements OnInit {
    labelHeader: 'Agregar' | 'Editar' = 'Agregar';
    statusOrdersForm: FormGroup;
    color;

    constructor(public dialogRef: MatDialogRef<AddTypeStatusComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private snackBar: MatSnackBar,
                private typeStatusOrdersService: TypeStatusOrdersService) {
    }

    ngOnInit(): void {
        this.statusOrdersForm = new FormGroup({
            'statusName': new FormControl(),
            'statusColor': new FormControl('', Validators.pattern('^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$'))
        })
        this.labelHeader = this.data.edit ? 'Editar' : 'Agregar';
        let {edit, selection} = this.data;
        if (edit) {
            this.statusOrdersForm.patchValue(selection);
        }
    }

    saveStatusOrders() {
        let {setup, selection, edit} = this.data;
        let statusOrder = {
            ...this.statusOrdersForm.value,
            setupId: setup.id
        };
        if (edit) {
            statusOrder = {
                ...selection,
                ...statusOrder
            }
        }
        this.typeStatusOrdersService.saveTypeStatusOrders(statusOrder, setup.id)
            .subscribe(
                () => {
                    this.snackBar.open('Estado actualizado', 'Aceptar', {duration: 1000})
                    this.dialogRef.close(true);
                },
                () => {
                    this.snackBar.open('Error al actualizar', 'Aceptar',
                        {
                            panelClass: 'snack-danger'
                        })
                }
            );
    }
}
