import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {GridApi, GridOptions, IDatasource, IGetRowsParams} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../../../shared/constants";
import {OrderService} from "../../../../../services/order.service";
import {TypeStatusOrdersService} from "../../../../../services/type-status-orders.service";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../../../../../store/state/app.state";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {map, switchMap, take} from "rxjs/operators";
import BigNumber from "bignumber.js";
import {CheckPaymentDialogComponent} from "../check-payment-dialog/check-payment-dialog.component";
import {ChangeOrderStatusComponent} from "../change-order-status/change-order-status.component";
import {DomSanitizer} from "@angular/platform-browser";
import {saveAs} from 'file-saver';
import {IPaginator} from "../../../../../models/paginator.interface";

@Component({
    selector: 'app-list-orders',
    templateUrl: './list-orders.component.html',
    styleUrls: ['./list-orders.component.scss']
})
export class ListOrdersComponent implements OnInit {

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

            if (params.filterModel.email) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.email.filter, 'email')
                    .subscribe((data: any) => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.user) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.user.filter, 'user')
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

            if (params.filterModel.verifiedPayColumn) {
                this.getOrdersData(params.startRow, params.endRow, params.filterModel.verifiedPayColumn.filter, 'verifiedPay')
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
    public columDefs: any[];
    public gridOptions: GridOptions;
    totalCount: number = 0;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    rowNumber: number = 0
    private gridApi: GridApi;
    private gridColumnApi;

    selectedRows = [];

    getSetupState: Observable<any>;

    constructor(private orderService: OrderService,
                private typeStatusOrdersService: TypeStatusOrdersService,
                private store: Store<IAppState>,
                private router: Router,
                private route: ActivatedRoute,
                private domSanitizer: DomSanitizer,
                public dialog: MatDialog) {
        this.getSetupState = this.store.select(selectSetupState);
        this.columDefs = [
            {
                headerName: '#',
                filter: true,
                checkboxSelection: true,
                width: 75,
                valueGetter: "node.rowIndex + 1"
            },
            {
                headerName: 'Correo', field: 'email', width: 145, filter: true,
                floatingFilter: true
            },
            {
                headerName: 'Usuario', field: 'user', width: 145, filter: true,
                floatingFilter: true,
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
            {headerName: 'Total', field: 'total', width: 70},
            {headerName: 'Observación', field: 'observation', width: 120},
            {
                headerName: 'Pago verificado', field: 'verifiedPayColumn', width: 130,
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
                        console.log(params);
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
                resizable: true
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
            //
            //     this.getOrdersData().subscribe((rowData: Array<any>) => {
            //         if (this.gridOptions.api) {
            //             this.gridOptions.api.setRowData(rowData);
            //         }
            //     })
            // },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            // onRowClicked(event: RowClickedEvent) {
            //     router.navigate([`../`, event.data.id], {relativeTo: route})
            // },
            // onSelectionChanged: (event) => {
            //     if (event.api.getSelectedRows().length > 0) {
            //         this.selectedRows = event.api.getSelectedRows();
            //     } else {
            //         this.selectedRows = [];
            //     }
            // }
        }
    }

    ngOnInit(): void {
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.setDatasource(this.dataSource);
    }

    getOrdersData(start: number, end: number, query?: string, typeFilter?: string) {
        let ordersSetup$: Observable<any>;
        let paginator: IPaginator = {start, end};
        return this.getSetupState.pipe(
            switchMap(({id: setupId}) => {
                if (query && typeFilter) {
                    ordersSetup$ = this.orderService.fetchOrdersByCompany(setupId, paginator, query, typeFilter)
                } else {
                    ordersSetup$ = this.orderService.fetchOrdersByCompany(setupId, paginator)
                }
                return ordersSetup$.pipe(
                    map((ordersResponse: any) => {
                        let {data} = ordersResponse;
                        let orders = data.map(order => {
                            let total = new BigNumber(order.total);
                            let verifiedPayColumn = order.verifiedPay === 1 ? 'Si' : 'No'
                            let orderStatus = '';
                            if (order.osStatusOrders.length > 0) {
                                let lastStatus = order.osStatusOrders[order.osStatusOrders.length - 1];
                                orderStatus = lastStatus.typeStatusOrders.statusName;
                            } else {
                                orderStatus = 'Sin estado';
                            }

                            return {
                                ...order,
                                user: `${order.users.personData.firstname} ${order.users.personData.lastname}`,
                                email: order.users.email,
                                verifiedPayColumn,
                                total: total.toFormat(2, BigNumber.ROUND_UP),
                                orderStatusColum: orderStatus,
                                row_number: ++this.rowNumber
                            }
                        })
                        return {
                            ...ordersResponse,
                            data: orders
                        }
                    })
                )
            })
        )
    }

    reloadData() {
        this.rowNumber = 0;
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

    openCheckPaymentDialog() {
        const dialogRef = this.dialog.open(CheckPaymentDialogComponent, {
            width: '90vw',
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

    openChangeStatusOrderDialog() {
        const dialogRef = this.dialog.open(ChangeOrderStatusComponent, {
            width: '400px',
            height: '300px',
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

    goToOrderDetail(evt) {
        let {data} = evt;
        this.router.navigate([`../`, data.id], {relativeTo: this.route})
    }

    // public createColumnDefs() {
    //     return [
    //         {
    //             headerName: '#',
    //             field: 'row_number',
    //             filter: true,
    //             checkboxSelection: true,
    //             width: 75
    //         },
    //         {
    //             headerName: 'Correo', field: 'users.email', width: 145, filter: true,
    //             floatingFilter: true
    //         },
    //         {
    //             headerName: 'Usuario', field: 'users.personData.firstname', width: 145, filter: true,
    //             floatingFilter: true,
    //         },
    //         {
    //             headerName: 'Nro. de Orden', field: 'orderSecuence', width: 115,
    //             filter: true,
    //             floatingFilter: true,
    //             valueGetter: function (params) {
    //                 let {data} = params;
    //                 if (data !== undefined) {
    //                     if (data.emisionPoints && data.setup.codEstablecimiento) {
    //                         return `${data.setup.codEstablecimiento}-${data.emisionPoints.emisionPoint}-${data.orderSecuence}`;
    //                     } else {
    //                         return data.orderSecuence;
    //                     }
    //                 }
    //             },
    //         },
    //         {headerName: 'Total', field: 'total', width: 70},
    //         {headerName: 'Observación', field: 'observation', width: 120},
    //         {
    //             headerName: 'Pago verificado', field: 'verifiedPayColumn', width: 130,
    //             filter: true,
    //             floatingFilter: true,
    //             cellStyle: function (params) {
    //                 if (params !== undefined) {
    //                     if (params.value === 'Si') {
    //                         return {background: "#8bc34a", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
    //                     } else if (params.value === 'No') {
    //                         return {background: "#ff9800", color: "#fff", fontSize: '16px', fontWeight: 'bold'};
    //                     }
    //                 }
    //             },
    //         },
    //         {
    //             headerName: 'Estado', field: 'orderStatusColum', width: 140,
    //             filter: true,
    //             floatingFilter: true,
    //             cellStyle: params => {
    //                 let {data} = params;
    //                 if (data.osStatusOrders.length > 0) {
    //                     let lastStatus = data.osStatusOrders[data.osStatusOrders.length - 1];
    //                     return {
    //                         background: lastStatus.typeStatusOrders.statusColor,
    //                         color: "#fff",
    //                         fontSize: '16px',
    //                         fontWeight: 'bold'
    //                     };
    //                 }
    //             },
    //         },
    //     ]
    // }

}
