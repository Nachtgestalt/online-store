import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatSelectionList} from "@angular/material/list";
import {FileItem} from "../../../../models/file-item";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderService} from "../../../../services/order.service";

@Component({
    selector: 'app-see-payment-dialog',
    templateUrl: './see-payment-dialog.component.html',
    styleUrls: ['./see-payment-dialog.component.scss']
})
export class SeePaymentDialogComponent implements OnInit {
    preview;

    imgURL: any;
    imagePath;

    @ViewChild('imageRef') selectedImages: MatSelectionList;
    images;
    archivos: FileItem[] = []
    fileErrors = [];

    orderData;

    fileInput: FormControl = new FormControl();

    constructor(public dialogRef: MatDialogRef<SeePaymentDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _snackBar: MatSnackBar,
                private orderService: OrderService) {
        console.log(this.data);
    }

    ngOnInit(): void {
        let {selection} = this.data;
        let {setup} = selection;
        this.orderData = {
            companyId: setup.companyId,
            orderId: selection.id
        }
        this.images = this.orderService.getPics(this.orderData);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onFileChange(files) {
        this.fileErrors = [];
        for (const file of files) {
            if (file.size < 3000000) {
                this.archivos.push(new FileItem(file));
            } else {
                this.fileErrors.push(file);
            }
        }

        let reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        }
    }

    cargarImagenes() {
        console.log(this.archivos);
        this.orderService.uploadPics(this.archivos, this.orderData)
            .subscribe(
                res => {
                    this.dialogRef.close();
                    this._snackBar.open('Imagenes cargadas con exito', 'Aceptar', {
                        duration: 2000,
                    });
                }
            )
    }

    clearFiles() {
        this.archivos = [];
    }

    deleteImages() {
        const imagesToDelete = this.selectedImages.selectedOptions.selected.map(o => o.value);
        console.log(imagesToDelete);
        this.orderService.deleteFiles(imagesToDelete).subscribe(res => {
            this.dialogRef.close();
            this._snackBar.open('Imagenes borradas con exito', 'Aceptar', {
                duration: 2000,
            });
        })
    }

}
