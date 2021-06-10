import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {GridApi, GridOptions} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../shared/constants";
import {IAppState, selectSetupState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {first, map, switchMap, tap} from "rxjs/operators";
import {DirectoryService} from "../../../services/directory.service";
import {MatDialog} from "@angular/material/dialog";
import {AddRegistryDirectoryComponent} from "./add-registry-directory/add-registry-directory.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-directory',
    templateUrl: './directory.component.html',
    styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {

    selectedRows = [];
    getSetupState: Observable<any>;
    public gridOptions: GridOptions;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    setup;
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(private store: Store<IAppState>,
                private directoryService: DirectoryService,
                public dialog: MatDialog,
                private snackBar: MatSnackBar) {
        this.getSetupState = this.store.select(selectSetupState);
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1
            },
            columnDefs: this.createColumnDefs(),
            getRowNodeId: function (data) {
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
                this.getDirectoryData().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            onSelectionChanged: (event) => {
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

    reloadData() {
        this.getDirectoryData().pipe(first())
            .subscribe((rowData: Array<any>) => {
                if (this.gridOptions.api) {
                    this.gridOptions.api.setRowData(rowData);
                }
            })
    }

    createColumnDefs() {
        return [
            {
                headerName: '#',
                field: 'row_number',
                filter: true,
                checkboxSelection: true,
                width: 75
            },
            {
                headerName: 'Nombre', field: 'name', width: 145, filter: true,
                floatingFilter: true,
            },
            {
                headerName: 'Número de whatsapp', field: 'whatsappNumber', width: 145, filter: true,
                floatingFilter: true,
                valueGetter: (params) => {
                    return `(${params.data.countryCode})${params.data.whatsappNumber}`;
                }
            },
            {
                headerName: 'Email', field: 'email', width: 145, filter: true,
                floatingFilter: true,
            },
            {
                headerName: 'Status', field: 'status', width: 145, filter: true,
                floatingFilter: true,
                valueGetter: (params) => {
                    return params.data.status === 0 ? 'Inactivo' : 'Activo'
                },
                cellStyle: function (params) {
                    if (params !== undefined) {
                        if (params.value === 'Activo') {
                            return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (params.value === 'Inactivo') {
                            return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                }
            },
            {
                headerName: 'Departamento', field: 'departmentName', width: 145, filter: true,
                floatingFilter: true,
            },
        ]
    }

    getDirectoryData() {
        return this.getSetupState.pipe(
            tap(setup => this.setup = setup),
            switchMap(setupState => this.directoryService.fetchDirectory(setupState.id)),
            map((directory: Array<any>) => {
                let i = 0;
                return directory.map(x => {
                    return {
                        ...x,
                        row_number: ++i
                    }
                })
            })
        )
    }

    openDialogAdd(edit: boolean) {
        if (!edit) {
            this.gridOptions.api.deselectAll();
            this.selectedRows = [];
        }

        const dialogRef = this.dialog.open(AddRegistryDirectoryComponent, {
            width: '500px',
            height: '450px',
            data: {
                setup: this.setup,
                edit,
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadData();
            }
        });
    }

    changeStatus() {
        let registry = this.selectedRows[0];
        this.directoryService.changeStatus(registry.id)
            .subscribe(
                (res: any) => {
                    this.snackBar.open(res.message, 'Aceptar', {duration: 2000});
                    this.reloadData();
                },
                () => {
                    this.snackBar.open('Error al actualizar', 'Aceptar', {panelClass: 'snack-danger'});
                }
            )
    }

}
