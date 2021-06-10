import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DirectoryService} from "../../../../services/directory.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-registry-directory',
  templateUrl: './add-registry-directory.component.html',
  styleUrls: ['./add-registry-directory.component.scss']
})
export class AddRegistryDirectoryComponent implements OnInit {
  addRegistryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddRegistryDirectoryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private directoryService: DirectoryService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    let {selection, setup} = this.data;
    this.addRegistryForm = new FormGroup({
      'name': new FormControl('', Validators.required),
      'countryCode': new FormControl('', Validators.required),
      'whatsappNumber': new FormControl('', Validators.required),
      'email': new FormControl('', Validators.required),
      'departmentName': new FormControl(''),
      'setupId': new FormControl(setup.id)
    })


    if (selection) {
      this.addRegistryForm.patchValue(selection);
      this.addRegistryForm.addControl('id', new FormControl(selection.id))
    }
  }

  save() {
    this.directoryService.saveRegistry(this.addRegistryForm.value)
        .subscribe((res: any) => {
          this.snackBar.open(res.message, 'Aceptar', {duration: 2000});
          this.dialogRef.close(true);
        })
  }

}
