import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProductService} from "../../../../services/product.service";
import {FileItem} from "../../../../models/file-item";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl} from "@angular/forms";
import {MatSelectionList} from "@angular/material/list";

@Component({
    selector: 'app-add-images-dialog',
    templateUrl: './add-images-dialog.component.html',
    styleUrls: ['./add-images-dialog.component.scss']
})
export class AddImagesDialogComponent implements OnInit {
    @ViewChild('imageRef') selectedImages: MatSelectionList;
    images;
    estaSobreElemento = false;
    archivos: FileItem[] = []
    fileErrors = [];

    fileInput: FormControl = new FormControl();

    constructor(public dialogRef: MatDialogRef<AddImagesDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _snackBar: MatSnackBar,
                private productService: ProductService) {
    }

    ngOnInit(): void {
        this.images = this.productService.getFiles(this.data);
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
    }

    cargarImagenes() {
        this.productService.uploadPics(this.archivos, this.data).subscribe(
            res => {
                this.dialogRef.close();
                this._snackBar.open('Imagenes cargadas con exito', 'Aceptar', {
                    duration: 2000,
                });
            }
        );
    }

    clearFiles() {
        this.archivos = [];
    }

    deleteImages() {
        const imagesToDelete = this.selectedImages.selectedOptions.selected.map(o => o.value);
        console.log(imagesToDelete);
        this.productService.deleteFiles(imagesToDelete).subscribe(res => {
            this.dialogRef.close();
            this._snackBar.open('Imagenes borradas con exito', 'Aceptar', {
                duration: 2000,
            });
        })
    }
}
