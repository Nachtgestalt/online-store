import {Component, OnInit} from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {SetupService} from "../../../../services/setup.service";
import {AddCompanieComponent} from "./add-companie/add-companie.component";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import * as moment from "moment";
import {PriceTypesComponent} from "./price-types/price-types.component";

@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.html',
    styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
    statusLabelButton: 'Activar' | 'Desactivar' = 'Desactivar';
    selectedRows = [];
    public gridOptions: GridOptions;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(private setupService: SetupService,
                private router: Router,
                private route: ActivatedRoute,
                public dialog: MatDialog,
                private _snackBar: MatSnackBar) {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1,
                filter: true,
                floatingFilter: true,
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
                this.setupService.fetchSetups()
                    .pipe(
                        map((setups: Array<any>) => {
                            return setups.map(setup => {
                                let statusField = setup.status === 1 ? 'Activo' : 'Inactivo'
                                return {...setup, statusField}
                            })
                        })
                    )
                    .subscribe((rowData: Array<any>) => {
                        if (this.gridOptions.api) {
                            this.gridOptions.api.setRowData(rowData);
                        }
                    })
            },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                    let [setupSelected] = this.selectedRows;
                    console.log(setupSelected);
                    this.statusLabelButton = setupSelected.status === 1 ? 'Desactivar' : 'Activar';
                } else {
                    this.selectedRows = [];
                }
            }
        }
    }

    ngOnInit(): void {
    }

    openModal(edit) {
        const dialogRef = this.dialog.open(AddCompanieComponent, {
            width: '80vw',
            height: '80vh',
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

    goToPayTypes() {
        let [companie] = this.selectedRows;
        this.router.navigate(['./pay-types', companie.id], {relativeTo: this.route})
    }

    reloadData() {
        this.setupService.fetchSetups()
            .pipe(
                map((setups: Array<any>) => {
                    return setups.map(setup => {
                        let statusField = setup.status === 1 ? 'Activo' : 'Inactivo'
                        return {...setup, statusField}
                    })
                })
            )
            .subscribe((rowData: Array<any>) => {
                if (this.gridOptions.api) {
                    this.gridOptions.api.setRowData(rowData);
                }
            })
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Cuenta',
                field: 'companyAccount',
                filter: true,
                width: 90,
                checkboxSelection: true,
            },
            {headerName: 'Bucket', field: 'bucketToImages', width: 60},
            {
                headerName: 'Expire date', field: 'expireDate', width: 60,
                filter: true,
                floatingFilter: true,
                sortable: true,
                cellStyle: function (params) {
                    if (params !== undefined) {
                        let expireDate = moment(params.value).startOf('day');
                        let today = moment().startOf('day');
                        if (expireDate.isSame(today)) {
                            return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (expireDate.isAfter(today)) {
                            return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        } else if (expireDate.isBefore(today)) {
                            return {background: "#F44336", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                }
            },
            {
                headerName: 'Status', field: 'statusField', width: 60,
                filter: true,
                floatingFilter: true,
                sortable: true,
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

    toggleStatus() {
        let {id, status} = this.selectedRows[0];
        this.setupService.changeStatusSetupCompany(id, status).subscribe(() => {
            this._snackBar.open('Compañia desactivada con exito', 'Aceptar', {
                duration: 2000,
            });
            this.reloadData();
        }, () =>
            this._snackBar.open('Error al desactivar', 'Aceptar', {
                panelClass: 'snack-danger'
            }))
    }
}
