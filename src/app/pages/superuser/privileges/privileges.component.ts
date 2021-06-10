import {Component, OnInit} from '@angular/core';
import {AG_GRID_LOCALE} from "../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {PrivilegesService} from "../../../services/privileges.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AddPrivilegeComponent} from "./add-privilege/add-privilege.component";

@Component({
    selector: 'app-privileges',
    templateUrl: './privileges.component.html',
    styleUrls: ['./privileges.component.scss']
})
export class PrivilegesComponent implements OnInit {
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(private privilegesService: PrivilegesService,
                public dialog: MatDialog,
                private _snackBar: MatSnackBar) {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1
            },
            columnDefs: this.createColumnDefs(),
            getRowNodeId: function (data) {
                // the code is unique, so perfect for the id
                return data.id;
            },
            rowBuffer: 0,
            rowSelection: 'single',
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 50,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            onGridReady: (params) => {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                this.privilegesService.fetchPrivileges().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                console.log(event.api.getSelectedRows());
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                } else {
                    this.selectedRows = [];
                }
            }
        }
    }

    ngOnInit(): void {
    }

    openModal(edit) {
        const dialogRef = this.dialog.open(AddPrivilegeComponent, {
            width: '50vw',
            height: '450px',
            data: {
                edit,
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.privilegesService.fetchPrivileges().subscribe(
                    (rowData: Array<any>) => {
                        this.gridOptions.api.setRowData(rowData);
                    }
                )
            }
        });
    }

    // deletePrivilege() {
    //     let {id} = this.selectedRows[0];
    //     this.privilegesService.deletePrivilege(id)
    //         .subscribe(res => {
    //             console.log(res);
    //             this._snackBar.open('Privilegio desactivado con exito', 'Aceptar', {
    //                 duration: 2000,
    //             });
    //             this.privilegesService.fetchPrivileges().subscribe(
    //                 (rowData: Array<any>) => {
    //                     this.gridOptions.api.setRowData(rowData);
    //                 }
    //             )
    //         }, () =>
    //             this._snackBar.open('Error al desactivar', 'Aceptar', {
    //                 panelClass: 'snack-danger'
    //             }))
    // }

    createColumnDefs() {
        return [
            {
                headerName: 'Nombre',
                field: 'name',
                filter: true,
                width: 90,
                checkboxSelection: true,
            },
            {headerName: 'Creado', field: 'createdDate', width: 60},
        ]
    }

}
