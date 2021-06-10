import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {GridApi, GridOptions} from "ag-grid-community";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {OrderService} from "../../../../services/order.service";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../../../../store/state/app.state";
import {ActivatedRoute, Router} from "@angular/router";
import {map, switchMap} from "rxjs/operators";
import {Location} from "@angular/common";
import {SeePaymentDialogComponent} from "../see-payment-dialog/see-payment-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
    verifiedPayColor;
    orderNumberLabel;
    order;
    personData;
    statusOrder;
    statusOrderLabel = '';
    selectedId: number;
    orders$: Observable<any>;
    getAuthState: Observable<any>;

    total = 0;
    public gridOptions: GridOptions;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(private orderService: OrderService,
                private store: Store<IAppState>,
                private router: Router,
                private route: ActivatedRoute,
                private dialog: MatDialog,
                private location: Location) {
        this.getAuthState = this.store.select(selectAuthState);
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
            rowSelection: 'multiple',
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 50,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            onGridReady: (params) => {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                this.getOrderData().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        console.log(rowData);
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            }
        }
    }

    ngOnInit(): void {
    }

    getOrderData() {
        return this.route.paramMap.pipe(
            switchMap(params => {
                    this.selectedId = Number(params.get('id'));
                    return this.orderService.fetchOrder(this.selectedId);
                }
            ),
            map((res: any) => {
                let {detail, order} = res;
                if (order.users.personData) {
                    this.personData = order.users.personData;
                }
                this.order = order;
                if (order.osStatusOrders.length <= 0) {
                    this.statusOrderLabel = 'Sin estado'
                } else {
                    this.statusOrder = order.osStatusOrders.pop();
                    this.statusOrderLabel = this.statusOrder.typeStatusOrders.statusName;
                }
                this.orderNumberLabel = `${order.setup.codEstablecimiento}-${order.emisionPoints.emisionPoint}-${order.orderSecuence}`
                this.verifiedPayColor = order.verifiedPay === 1 ? '#8bc34a' : '#ff9800'
                return detail.map(order => {
                    let {name, codBarras, cod} = order.productDetail;
                    this.total += (order.priceUnitValue - order.discountUnitValue) * order.qty
                    return {
                        ...order,
                        codBarras,
                        cod,
                        name,
                        total: (order.priceUnitValue - order.discountUnitValue) * order.qty
                    }
                })
            })
        );
    }

    goBack() {
        this.location.back();
    }

    openSeePaymentDialog() {
        const dialogRef = this.dialog.open(SeePaymentDialogComponent, {
            width: '90vw',
            height: '600px',
            data: {
                selection: this.order
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Producto',
                field: 'name',
                filter: true,
                width: 300
            },
            {headerName: 'Código 1', field: 'codBarras', width: 60},
            {headerName: 'Código 2', field: 'cod', width: 60},
            {
                headerName: 'Precio',
                field: 'priceUnitValue',
                width: 90
            },
            // {headerName: 'Descuento', field: 'discountUnitValue', width: 90},
            {
                headerName: 'Cant.', field: 'qty', editable: true,
                width: 60,
                cellStyle: function (params) {
                    if (params !== undefined) {
                        if (params.value > 0) {
                            return {color: "#065fd4", fontSize: '16px', fontWeight: 'bold'};
                        } else {
                            return {color: "#ff0000", fontSize: '16px', fontWeight: 'bold'};
                        }
                    }
                },
            },
            {headerName: 'Total', field: 'total', width: 90},
        ]
    }
}
