import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PrivilegesService} from "../../../../services/privileges.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-add-privilege',
    templateUrl: './add-privilege.component.html',
    styleUrls: ['./add-privilege.component.scss']
})
export class AddPrivilegeComponent implements OnInit {
    labelHeader = '';
    privilegeForm: FormGroup;

    constructor(public dialogRef: MatDialogRef<AddPrivilegeComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _snackBar: MatSnackBar,
                private privilegeService: PrivilegesService) {
    }

    ngOnInit(): void {
        this.privilegeForm = new FormGroup({
            'name': new FormControl('', Validators.required),
            'createdDate': new FormControl()
        })

        if (this.data.edit) {
            this.labelHeader = 'Editar'
            console.log(this.data);
            this.privilegeForm.patchValue(this.data.selection);
        } else {
            this.labelHeader = 'Guardar'
        }
    }

    savePrivilege() {
        if (this.data.edit) {
            let {id} = this.data.selection;
            this.privilegeService.updatePrivilege(id, this.privilegeForm.value)
                .subscribe(res => {
                        console.log(res);
                        this.dialogRef.close(true);
                        this._snackBar.open('Privilegio editado con exito', 'Aceptar', {
                            duration: 2000,
                        });
                    },
                    () =>
                        this._snackBar.open('Error al editar privilegio', 'Aceptar', {
                            panelClass: 'snack-danger'
                        })
                )
        } else {
            this.privilegeForm.get('createdDate').patchValue(new Date());
            this.privilegeService.savePrivilege(this.privilegeForm.value)
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


}
