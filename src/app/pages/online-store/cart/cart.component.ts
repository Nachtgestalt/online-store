import {Component, OnDestroy, OnInit} from '@angular/core';
import {IAppState, selectCartState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import * as fromCart from '../../../store/reducers/cart.reducers'
import {IProduct} from "../../../models/product.interface";
import {GridApi, GridOptions, GridReadyEvent, IGetRowsParams} from "ag-grid-community";
import {Observable, Subscription} from "rxjs";
import {map} from "rxjs/operators";
import * as cartActions from '../../../store/actions/cart.actions'
import {InputTypeComponent} from "../../../components/input-type/input-type.component";
// import {NumericEditorComponent} from "../../../components/numeric-editor/numeric-editor.component";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    frameworkComponents = {
        inputType: InputTypeComponent,
    };
    public gridOptions: GridOptions;
    totalCount: number = 0;
    localeText = {
        page: 'Pag.',
        more: 'Mas',
        to: 'Al',
        of: 'De',
        next: 'Siguiente',
        last: 'Ultimo',
        first: 'Primero',
        previous: 'Anterior',
        loadingOoo: 'Cargando Datos...',
        selectAll: 'Seleccionar Todo',
        searchOoo: 'Buscar...',
        blanks: 'daBlanc',
        filterOoo: 'daFilter...',
        equals: 'Igual a',
        notEqual: 'Diferente a',
        dateFormatOoo: 'yyyy-mm-dd',
        lessThan: 'Inferior a',
        greaterThan: 'Superior a',
        lessThanOrEqual: 'Menor o Igual a',
        greaterThanOrEqual: 'Superorio o Igual a',
        inRange: 'En Rango',
        inRangeStart: 'Desde',
        inRangeEnd: 'Hasta',
        contains: 'Contiene',
        notContains: 'No Contiene',
        startsWith: 'Inicia Con',
        endsWith: 'Termina En',
        andCondition: 'Y',
        orCondition: 'O',
        applyFilter: 'Aplicar',
        resetFilter: 'Resetear',
        clearFilter: 'Limpiar',
        // other
        noRowsToShow: 'No hay datos para mostrar'

    };
    private gridApi: GridApi;
    private gridColumnApi;
    products = []
    total = 0;

    getState: Observable<any>;

    constructor(private store: Store<IAppState>,
                private router: Router,
                private route: ActivatedRoute) {
        this.getState = this.store.select(selectCartState);


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
            rowSelection: 'multiple',
            // rowModelType: 'infinite',
            // paginationPageSize: 100,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 50,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            onGridReady: (params) => {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                this.subscription = this.getRowData().subscribe(rowData => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onCellValueChanged: ({data}) => {
                this.updateAmount(data);
            }

        }
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    updateAmount(data: IProduct) {
        let product: IProduct = {...data, amount: +data.amount}
        this.store.dispatch(cartActions.modifiedAmountItem({product}))
    }

    deleteProduct(product) {
        this.store.dispatch(cartActions.deleteItem({product}))
    }

    deleteProducts() {
        let ids = [];
        let selectedRows = this.gridApi.getSelectedRows();
        selectedRows.forEach(x => ids.push(x.id));
        this.store.dispatch(cartActions.deleteItems({ids}))
    }

    emptyCart() {
        this.store.dispatch(cartActions.emptyCart());
        this.total = 0;
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.subscription = this.getRowData().subscribe(
            data => {
                this.gridApi.setRowData(data);
                if (data.length === 0) {
                    this.gridApi.showNoRowsOverlay();
                }
                let datasource = {
                    rowCount: null,
                    getRows: (params: IGetRowsParams) => {
                        setTimeout(() => {
                            let rowsThisPage = data.slice(params.startRow, params.endRow);
                            var lastRow = -1;
                            if (data.length <= params.endRow) {
                                lastRow = data.length;
                            }
                            params.successCallback(rowsThisPage, lastRow)
                        }, 500)
                    },
                };

                // params.api.setDatasource(datasource);
            }
        )
    }

    public getRowData(): Observable<any[]> {
        return this.store.select(fromCart.selectAll)
            .pipe(
                map((product: IProduct[]) => {
                        this.total = 0;
                        return product.map((x: IProduct) => {
                            this.total += (x.pvp - x.discount) * x.amount
                            return {
                                ...x,
                                subtotal: x.pvp * x.amount,
                                total: (x.pvp - x.discount) * x.amount
                            }
                        })
                    }
                )
            )
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Producto',
                field: 'name',
                filter: true,
                width: 300,
                checkboxSelection: true,
                // flex: 1
            },
            {headerName: 'Código 1', field: 'cod_barras', width: 60},
            {headerName: 'Código 2', field: 'cod', width: 60},
            {
                headerName: 'Precio',
                field: 'pvp',
                width: 90
            },
            {headerName: 'Descuento', field: 'discount', width: 90},
            {
                headerName: 'Cant.', field: 'amount', editable: true,
                width: 60,
                cellEditor: 'inputType',
                cellEditorParams: {
                    inputAttrs: {
                        type: 'number',
                        min: 1
                    },
                },
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
            {headerName: 'Total sin descuento', field: 'subtotal', width: 90},
            {headerName: 'Total', field: 'total', width: 90},
        ]
    }

    goToCheckout() {
        this.router.navigate(['../checkout'], {
            relativeTo: this.route
        });
    }

}
