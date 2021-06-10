import {Component, OnInit} from '@angular/core';
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {TypeStatusOrdersService} from "../../../../services/type-status-orders.service";
import {IAppState, selectSetupState} from "../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {map, switchMap, take, tap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {AddTypeStatusComponent} from "./add-type-status/add-type-status.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-admin-status-orders',
    templateUrl: './admin-type-status-orders.component.html',
    styleUrls: ['./admin-type-status-orders.component.scss']
})
export class AdminTypeStatusOrdersComponent implements OnInit {
    setup;
    statusLabelButton: 'Activar' | 'Desactivar' = 'Desactivar';
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;

    private getSetupState: Observable<any>;

    constructor(private typeStatusOrdersService: TypeStatusOrdersService,
                private store: Store<IAppState>,
                private dialog: MatDialog,
                private snackBar: MatSnackBar) {
        this.getSetupState = this.store.select(selectSetupState);
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true
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
                this.loadData().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                    let [typeSelected] = this.selectedRows;
                    this.statusLabelButton = typeSelected.status === 1 ? 'Desactivar' : 'Activar';
                } else {
                    this.selectedRows = [];
                }
            }
        }
    }

    ngOnInit(): void {
    }

    loadData() {
        return this.getSetupState.pipe(
            tap(setup => this.setup = setup),
            switchMap(({id}) => this.typeStatusOrdersService.fetchTypeStatusOrders(id)),
            map((typeStatusOrders: Array<any>) => {
                return typeStatusOrders.map(typeStatusOrder => {
                    let statusColum = typeStatusOrder.status === 1 ? 'Activo' : 'Inactivo';
                    return {
                        ...typeStatusOrder,
                        statusColum
                    }
                })
            })
        )
    }

    reloadData() {
        this.loadData().pipe(take(1)).subscribe(rowData => this.gridOptions.api.setRowData(rowData));
    }

    openModal(edit) {
        const dialogRef = this.dialog.open(AddTypeStatusComponent, {
            width: '50vw',
            height: '450px',
            data: {
                edit,
                setup: this.setup,
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData().subscribe(
                    (rowData: Array<any>) => {
                        this.gridOptions.api.setRowData(rowData);
                    }
                )
            }
        });
    }

    toggleStatusType() {
        let {id, status, setupId} = this.selectedRows[0];
        this.typeStatusOrdersService.toggleStatusTypeStatusOrders(id, status, setupId)
            .subscribe(() => {
                this.snackBar.open('Estado desactivado con exito', 'Aceptar', {
                    duration: 2000,
                });
                this.reloadData();
            }, () =>
                this.snackBar.open('Error al desactivar', 'Aceptar', {
                    panelClass: 'snack-danger'
                }))
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Nombre',
                field: 'statusName',
                filter: true,
                width: 185,
                checkboxSelection: true,
            },
            {
                headerName: 'Color',
                field: 'statusColor',
                width: 105,
                cellStyle: (params) => {
                    return {
                        background: params.value,
                        color: "#000",
                        fontSize: '16px',
                        fontWeight: 'bold'
                    };
                }
            },
            {
                headerName: 'Estado', field: 'statusColum', width: 120,
                cellStyle: function (params) {
                    if (params !== undefined) {
                        if (params.value === 'Activo') {
                            return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (params.value === 'Inactivo') {
                            return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                },
            },
        ]
    }

}
