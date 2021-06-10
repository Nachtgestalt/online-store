import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GridApi, GridOptions} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../../../shared/constants";
import {SetupService} from "../../../../../services/setup.service";
import {map, switchMap} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-pay-types',
    templateUrl: './pay-types.component.html',
    styleUrls: ['./pay-types.component.scss']
})
export class PayTypesComponent implements OnInit {
    statusLabelButton: 'Activar' | 'Desactivar' = 'Desactivar';
    selectedRows = [];
    companyName: string;
    selectedId: number;
    gridHeight: string = '350px';
    private gridColumnApi;
    public gridOptions: GridOptions;
    localeText = AG_GRID_LOCALE;
    private gridApi: GridApi;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private setupService: SetupService,
                private _snackBar: MatSnackBar) {
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
                this.getPayTypes().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        console.log(rowData);
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedRows = event.api.getSelectedRows();
                    let [payType] = this.selectedRows;
                    console.log(payType);
                    this.statusLabelButton = payType.status === 1 ? 'Desactivar' : 'Activar';
                    console.log(this.statusLabelButton);
                } else {
                    this.selectedRows = [];
                }
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // }
        }
    }

    ngOnInit(): void {
    }

    getPayTypes() {
        return this.route.paramMap.pipe(
            switchMap(
                params => {
                    this.selectedId = Number(params.get('id'));
                    return this.setupService.fetchPayTypes(this.selectedId);
                }
            ),
            map((setupWityPayTypes: any) => {
                    let {osPayTypes, companyAccount} = setupWityPayTypes;
                    this.companyName = companyAccount;
                    return osPayTypes.map(payType => {
                        let statusField = payType.status === 1 ? 'Activo' : 'Inactivo';
                        return {
                            ...payType,
                            statusField
                        }
                    })
                }
            )
        );
    }

    reloadData() {
        this.getPayTypes()
            .subscribe((rowData: Array<any>) => {
                if (this.gridOptions.api) {
                    this.gridOptions.api.setRowData(rowData);
                }
            })
    }

    toggleStatus() {
        let {id, status} = this.selectedRows[0];
        this.setupService.toggleStatusPayType(id, status)
            .subscribe(res => {
                console.log(res);
                this._snackBar.open('Compañia desactivada con exito', 'Aceptar', {
                    duration: 2000,
                });
                this.reloadData();
            }, () =>
                this._snackBar.open('Error al desactivar', 'Aceptar', {
                    panelClass: 'snack-danger'
                }))
    }

    goBack() {
        this.router.navigate(['../../'], {relativeTo: this.route})
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Codigo',
                field: 'cod',
                filter: true,
                width: 300,
                checkboxSelection: true,
            },
            {headerName: 'Nombre', field: 'payName', width: 60},
            {
                headerName: 'Status', field: 'statusField', width: 60,
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
