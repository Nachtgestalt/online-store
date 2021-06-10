import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from "rxjs";
import {SetupUserService} from "../../../../services/setup-user.service";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../../store/state/app.state";
import {map, switchMap} from "rxjs/operators";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {PrivilegesComponent} from "../privileges/privileges.component";
import {PriceTypesComponent} from "./price-types/price-types.component";

@Component({
    selector: 'app-list-users',
    templateUrl: './list-users.component.html',
    styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {
    statusLabelButton: 'Activar' | 'Desactivar' = 'Desactivar';
    showStockLabelButton: 'Mostrar' | 'Ocultar' = 'Mostrar';
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;
    user;

    private getAuthState: Observable<any>;
    private getSetupState: Observable<any>;

    constructor(private setupUserService: SetupUserService,
                private store: Store<IAppState>,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);

        this.gridOptions = <GridOptions>{
            defaultColDef: {
                flex: 1,
                resizable: true,
                filter: true,
                floatingFilter: true,
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
                this.getSetupState
                    .pipe(
                        switchMap(({id}) => this.setupUserService.fetchSetups(id)),
                        map((setups: Array<any>) => {
                            return setups.map(setup => {
                                let statusField = setup.status === 1 ? 'Activo' : 'Inactivo'
                                let showStockField = setup.showStock === 1 ? 'Si' : 'No'
                                return {...setup, statusField, showStockField}
                            })
                        })
                    )
                    .subscribe(
                        (rowData: Array<any>) => {
                            console.log(rowData);
                            if (this.gridOptions.api) {
                                this.gridOptions.api.setRowData(rowData);
                            }
                        }
                    );
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                    let [setupSelected] = this.selectedRows;
                    this.statusLabelButton = setupSelected.status === 1 ? 'Desactivar' : 'Activar';
                    this.showStockLabelButton = setupSelected.showStock === 0 ? 'Mostrar' : 'Ocultar';

                } else {
                    this.selectedRows = [];
                }
            }
        }
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Email',
                field: 'emailCol',
                filter: true,
                floatingFilter: true,
                sortable: true,
                width: 90,
                checkboxSelection: true,
            },
            {
                headerName: 'Mostrar stock', field: 'showStockField', width: 60,
                sortable: true,
                filter: true,
                floatingFilter: true,
                cellStyle: function (params) {
                    if (params !== undefined) {
                        if (params.value === 'Si') {
                            return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (params.value === 'No') {
                            return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                }
            },
            {
                headerName: 'Status', field: 'statusField', width: 60,
                sortable: true,
                filter: true,
                floatingFilter: true,
                cellStyle: function (params) {
                    if (params !== undefined) {
                        if (params.value === 'Activo') {
                            return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (params.value === 'Inactivo') {
                            return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                }
            }
        ]
    }

    ngOnInit(): void {
        //TODO: Avoid leak memories
        combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                map(([authState, setupState]) => {
                    let {user} = authState;
                    let setupUser = user.setup;
                    return [setupUser, setupState]
                })
            )
            .subscribe(([setupUser, setupState]) => {
                setupUser.forEach(setup => {
                    if (setup.setupId === setupState.id) {
                        this.user = setup
                    }
                })
            })
    }

    reloadData() {
        this.getSetupState
            .pipe(
                switchMap(({id}) => this.setupUserService.fetchSetups(id)),
                map((setups: Array<any>) => {
                    return setups.map(setup => {
                        let statusField = setup.status === 1 ? 'Activo' : 'Inactivo'
                        let showStockField = setup.showStock === 1 ? 'Si' : 'No'
                        return {...setup, statusField, showStockField}
                    })
                })
            )
            .subscribe(
                (rowData: Array<any>) => {
                    console.log(rowData);
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                }
            );
    }

    toggleStatus() {
        let {id, status, setupId} = this.selectedRows[0];
        this.setupUserService.changeStatusSetupUser(id, status, setupId)
            .subscribe(() => {
                this.snackBar.open('Compañia desactivada con exito', 'Aceptar', {
                    duration: 2000,
                });
                this.reloadData();
            }, () =>
                this.snackBar.open('Error al desactivar', 'Aceptar', {
                    panelClass: 'snack-danger'
                }))
    }

    toogleShowStock() {
        let {id, showStock, setupId} = this.selectedRows[0];
        this.setupUserService.changeShowStock(id, showStock, setupId)
            .subscribe(() => {
                this.snackBar.open('Mostrar stock modificado', 'Aceptar', {
                    duration: 2000,
                });
                this.reloadData();
            }, () =>
                this.snackBar.open('Error al modificar Mostrar stock', 'Aceptar', {
                    panelClass: 'snack-danger'
                }))

    }

    openModal() {
        const dialogRef = this.dialog.open(PrivilegesComponent, {
            width: '80vw',
            height: '600px',
            data: {
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadData();
            }
        });
    }


    openModalPrice() {
        const dialogRef = this.dialog.open(PriceTypesComponent, {
            width: '80vw',
            height: '50vh',
            data: {
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadData();
            }
        });
    }
}
