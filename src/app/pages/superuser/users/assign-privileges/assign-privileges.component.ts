import {Component, Inject, OnInit} from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {PrivilegesService} from "../../../../services/privileges.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SetupUserService} from "../../../../services/setup-user.service";

@Component({
    selector: 'app-assign-privileges',
    templateUrl: './assign-privileges.component.html',
    styleUrls: ['./assign-privileges.component.scss']
})
export class AssignPrivilegesComponent implements OnInit {
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(public dialogRef: MatDialogRef<AssignPrivilegesComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private setupUserService: SetupUserService,
                private privilegesService: PrivilegesService) {
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
        console.log(selection)
        let body = {
            users: selection,
            osUserPrivileges: this.selectedRows
        }
        // this.setupUserService.savePrivileges(body, selection.id);
    }

}
