import {Component, OnInit} from '@angular/core';
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../../store/state/app.state";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {switchMap, take} from "rxjs/operators";
import {BankAccountsService} from "../../../../services/bank-accounts.service";
import {AddBankAccountComponent} from "./add-bank-account/add-bank-account.component";

@Component({
    selector: 'app-admin-bank-accounts',
    templateUrl: './admin-bank-accounts.component.html',
    styleUrls: ['./admin-bank-accounts.component.scss']
})
export class AdminBankAccountsComponent implements OnInit {

    statusLabelButton: 'Activar' | 'Desactivar' = 'Desactivar';
    showStockLabelButton: 'Mostrar' | 'Ocultar' = 'Mostrar';
    selectedRows = [];
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    public gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi;

    private getAuthState: Observable<any>;
    private getSetupState: Observable<any>;

    constructor(private bankAccountsService: BankAccountsService,
                private store: Store<IAppState>,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
        this.getAuthState = this.store.select(selectAuthState);
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
                this.getSetupState
                    .pipe(
                        switchMap(({id}) => this.bankAccountsService.fetchBankAccounts(id)),
                    )
                    .subscribe(
                        (rowData: Array<any>) => {
                            if (this.gridOptions.api) {
                                this.gridOptions.api.setRowData(rowData);
                            }
                        }
                    );
            },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                    let [setupSelected] = this.selectedRows;
                    this.statusLabelButton = setupSelected.status === 1 ? 'Desactivar' : 'Activar';
                } else {
                    this.selectedRows = [];
                }
            }
        }
    }

    ngOnInit(): void {
    }

    reloadData() {
        this.getSetupState
            .pipe(
                take(1),
                switchMap(({id}) => this.bankAccountsService.fetchBankAccounts(id)),
            )
            .subscribe(
                (rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                }
            );
    }

    openModal(edit) {
        const dialogRef = this.dialog.open(AddBankAccountComponent, {
            width: '50vw',
            height: '500px',
            data: {
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

    toggleStatus() {
        let [bankAccount] = this.selectedRows;
        this.bankAccountsService.toggleStatus(bankAccount, bankAccount.setupId)
            .subscribe(
                () => {
                    this.snackBar.open('Cuenta bancaria desactivada con exito', 'Aceptar', {
                        duration: 2000,
                    });
                    this.reloadData();
                },
                () => {
                    this.snackBar.open('Error al desactivar', 'Aceptar', {
                        panelClass: 'snack-danger'
                    })
                }
            )
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Institución financiera',
                field: 'institucionFinanciera',
                filter: true,
                width: 90,
                checkboxSelection: true,
            },
            {
                headerName: 'Tipo cuenta',
                field: 'tipoCuenta',
                width: 60,
            },
            {
                headerName: 'Nro. Cuenta',
                field: 'nroCuenta',
                width: 60,
            },
            {
                headerName: 'Titular',
                field: 'titularCuenta',
                width: 60,
            },
            {
                headerName: 'Email para notificar',
                field: 'emailNotificacion',
                width: 60,
            },
            {
                headerName: 'Estado',
                field: 'emailNotificacion',
                width: 60,
                valueGetter: function (params) {
                    let {data} = params;
                    if (data !== undefined) {
                        if (data.status === 1) {
                            return 'Activo';
                        } else {
                            return 'Inactivo'
                        }
                    }
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
            }
        ]
    }

}
