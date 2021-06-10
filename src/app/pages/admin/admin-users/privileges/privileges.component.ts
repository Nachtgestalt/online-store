import {Component, Inject, OnInit} from '@angular/core';
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SetupUserService} from "../../../../services/setup-user.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-privileges',
    templateUrl: './privileges.component.html',
    styleUrls: ['./privileges.component.scss']
})
export class PrivilegesComponent implements OnInit {
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(public dialogRef: MatDialogRef<PrivilegesComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private setupUserService: SetupUserService,
                private privilegesService: PrivilegesService,
                private snackBar: MatSnackBar) {
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
            rowSelection: 'multiple',
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
            onFirstDataRendered: (params) => {
                // params.api.sizeColumnsToFit();
                params.api.forEachNode(node => {
                    let {selection} = this.data
                    if (selection.osUserPrivileges.length > 0) {
                        selection.osUserPrivileges.forEach(userPrivilege => {
                            if (userPrivilege.privilegesId === node.data.id && userPrivilege.status === 1) {
                                node.setSelected(true);
                            }
                        })
                    }
                });
            },
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

    ngOnInit() {
    }

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

    save() {
        let {selection} = this.data;
        let {setupId} = selection;
        selection.osUserPrivileges = this.selectedRows;
        this.setupUserService.savePrivileges(selection, selection.id, setupId)
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
                });
    }

}
