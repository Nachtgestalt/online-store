import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {GridApi, GridOptions, IDatasource, IGetRowsParams} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {OrderService} from "../../../../services/order.service";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../../../../store/state/app.state";
import {ActivatedRoute, Router} from "@angular/router";
import {first, map, switchMap, take} from "rxjs/operators";
import BigNumber from "bignumber.js";
import {MatDialog} from "@angular/material/dialog";
import {SeePaymentDialogComponent} from "../see-payment-dialog/see-payment-dialog.component";
import {saveAs} from 'file-saver';
import {IPaginator} from "../../../../models/paginator.interface";

@Component({
    selector: 'app-all-orders',
    templateUrl: './all-orders.component.html',
    styleUrls: ['./all-orders.component.scss']
})
export class AllOrdersComponent implements OnInit {
    dataSource: IDatasource = {
        getRows: (params: IGetRowsParams) => {
            console.log(params);
            if (Object.keys(params.filterModel).length === 0 && params.filterModel.constructor === Object) {
                this.getOrdersData(params.startRow, params.endRow)
                    .subscribe((data: any) => {
                        console.log(data);
                        params.successCallback(data.data, data.totalCount)
                    });
            }

            if (params.filterModel.companyName) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.companyName.filter, 'companyName')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.orderSecuence) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.orderSecuence.filter, 'orderSecuence')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.verifiedPay) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.verifiedPay.filter, 'verifiedPay')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;

            }

            if (params.filterModel.orderStatusColum) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.orderStatusColum.filter, 'orderStatus')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }
        }
    }
    selectedRows = [];
    // orders$: Observable<any>;
    getAuthState: Observable<any>;

    public columDefs: any[];
    public gridOptions: GridOptions;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    private gridColumnApi;
    private gridApi: GridApi;


    constructor(private orderService: OrderService,
                private store: Store<IAppState>,
                private router: Router,
                private route: ActivatedRoute,
                public dialog: MatDialog) {
        this.getAuthState = this.store.select(selectAuthState);
        this.columDefs = [
            {
                headerName: '#',
                filter: true,
                checkboxSelection: true,
                width: 75,
                valueGetter: "node.rowIndex + 1"
            },
            {
                headerName: 'Nro. de Orden', field: 'orderSecuence', width: 115,
                filter: true,
                floatingFilter: true,
                valueGetter: function (params) {
                    let {data} = params;
                    if (data !== undefined) {
                        if (data.emisionPoints && data.setup.codEstablecimiento) {
                            return `${data.setup.codEstablecimiento}-${data.emisionPoints.emisionPoint}-${data.orderSecuence}`;
                        } else {
                            return data.orderSecuence;
                        }
                    }
                },
            },
            {
                headerName: 'Empresa', field: 'companyName', width: 120,
                filter: true,
                floatingFilter: true,
            },
            {headerName: 'Total', field: 'total', width: 70},
            {headerName: 'Observación', field: 'observation', width: 120},
            {
                headerName: 'Pago verificado', field: 'verifiedPay', width: 130,
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
                },
            },
            {
                headerName: 'Estado', field: 'orderStatusColum', width: 140,
                filter: true,
                floatingFilter: true,
                cellStyle: params => {
                    let {data} = params;
                    if (data !== undefined) {
                        if (data.osStatusOrders.length > 0) {
                            let lastStatus = data.osStatusOrders[data.osStatusOrders.length - 1];
                            return {
                                background: lastStatus.typeStatusOrders.statusColor,
                                color: "#fff",
                                fontSize: '16px',
                                fontWeight: 'bold'
                            };
                        }
                    }
                },
            },
        ]
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
            },
            rowHeight: 30,
            rowSelection: 'single',
            cacheBlockSize: 25,
            maxBlocksInCache: 2,
            cacheOverflowSize: 2,
            enableServerSideFilter: false,
            enableServerSideSorting: false,
            rowModelType: 'infinite',
            pagination: true,
            paginationAutoPageSize: true,
            // onGridReady: (params) => {
            //     this.gridApi = params.api;
            //     this.gridColumnApi = params.columnApi;
            //     this.getOrdersData()
            //         .pipe(first())
            //         .subscribe((rowData: Array<any>) => {
            //             if (this.gridOptions.api) {
            //                 this.gridOptions.api.setRowData(rowData);
            //             }
            //         })
            // },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            // onRowClicked(event: RowClickedEvent) {
            //     router.navigate([`./`, event.data.id], {relativeTo: route})
            // },
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
        // this.orders$ = this.getAuthState.pipe(
        //     switchMap(authState => this.orderService.fetchOrders(authState.user.id))
        // )
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.setDatasource(this.dataSource);
    }

    getOrdersData(start: number, end: number, query?: string, typeFilter?: string) {
        let ordersSetup$: Observable<any>;
        let paginator: IPaginator = {start, end};
        return this.getAuthState.pipe(
            switchMap(authState => {
                if (query && typeFilter) {
                    ordersSetup$ = this.orderService.fetchOrders(authState.user.id, paginator, query, typeFilter)
                } else {
                    ordersSetup$ = this.orderService.fetchOrders(authState.user.id, paginator)
                }
                return ordersSetup$.pipe(
                    map((ordersResponse: any) => {
                        let {data} = ordersResponse;
                        let orders = data.map(order => {
                            let total = new BigNumber(order.total);
                            let verifiedPay = order.verifiedPay === 1 ? 'Si' : 'No'
                            let orderStatus = '';
                            if (order.osStatusOrders.length > 0) {
                                let lastStatus = order.osStatusOrders[order.osStatusOrders.length - 1];
                                orderStatus = lastStatus.typeStatusOrders.statusName;
                            } else {
                                orderStatus = 'Sin estado';
                            }
                            return {
                                ...order,
                                verifiedPay,
                                companyName: order.setup.nombreComercial,
                                total: total.toFormat(2, BigNumber.ROUND_UP),
                                orderStatusColum: orderStatus,
                                row_number: 0
                            }
                        })
                        return {
                            ...ordersResponse,
                            data: orders
                        }
                    })
                )
            }),
            first()
        )
    }

    reloadData() {
        this.getOrdersData(0, 25)
            .pipe(
                take(1)
            )
            .subscribe(
                rowData => {
                    this.gridOptions.api.setRowData(rowData);
                }
            )
    }

    openSeePaymentDialog() {
        const dialogRef = this.dialog.open(SeePaymentDialogComponent, {
            width: '90vw',
            height: '600px',
            data: {
                selection: this.selectedRows[0]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    goToOrderDetail(evt) {
        let {data} = evt;
        this.router.navigate([`./`, data.id], {relativeTo: this.route})
    }

    downloadReport() {
        let [selectedOrder] = this.selectedRows;
        this.orderService.getOrderReport(selectedOrder.id)
            .subscribe((response: any) => {
                let fileName = 'file';
                const contentDisposition = response.headers.get('Content-Disposition');
                if (contentDisposition) {
                    const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = fileNameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                    }
                }
                const fileContent = response.body;
                const blob = new Blob([fileContent], {type: 'application/octet-stream'});
                saveAs(blob, fileName);
            })
    }

    private createColumnDefs() {
        return [
            {
                headerName: '#',
                field: 'row_number',
                filter: true,
                checkboxSelection: true,
                width: 90
            },
            {
                headerName: 'Nro. de Orden', field: 'orderSecuence', width: 115,
                filter: true,
                floatingFilter: true,
                valueGetter: function (params) {
                    let {data} = params;
                    if (data !== undefined) {
                        if (data.emisionPoints && data.setup.codEstablecimiento) {
                            return `${data.setup.codEstablecimiento}-${data.emisionPoints.emisionPoint}-${data.orderSecuence}`;
                        } else {
                            return data.orderSecuence;
                        }
                    }
                },
            },
            {
                headerName: 'Empresa', field: 'setup.nombreComercial', width: 120,
                filter: true,
                floatingFilter: true,
            },
            {headerName: 'Total', field: 'total', width: 70},
            {headerName: 'Observación', field: 'observation', width: 120},
            {
                headerName: 'Pago verificado', field: 'verifiedPay', width: 130,
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
                },
            },
            {
                headerName: 'Estado', field: 'orderStatusColum', width: 140,
                filter: true,
                floatingFilter: true,
                cellStyle: params => {
                    let {data} = params;
                    if (data.osStatusOrders.length > 0) {
                        let lastStatus = data.osStatusOrders[data.osStatusOrders.length - 1];
                        return {
                            background: lastStatus.typeStatusOrders.statusColor,
                            color: "#fff",
                            fontSize: '16px',
                            fontWeight: 'bold'
                        };
                    }
                },
            },
        ]
    }

}
