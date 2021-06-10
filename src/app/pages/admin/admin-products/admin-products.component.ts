import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {map, switchMap} from "rxjs/operators";
import {GridApi, IDatasource, IGetRowsParams} from "ag-grid-community";
import {Observable} from "rxjs";
import {AddImagesDialogComponent} from "./add-images-dialog/add-images-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ImageFormatterComponent} from "../../../components/image-formatter/image-formatter.component";
import {IAppState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {AG_GRID_LOCALE} from "../../../shared/constants";

@Component({
    selector: 'app-admin-products',
    templateUrl: './admin-products.component.html',
    styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
    dataSource: IDatasource = {
        getRows: (params: IGetRowsParams) => {
            console.log(params);
            if (Object.keys(params.filterModel).length === 0 && params.filterModel.constructor === Object) {
                this.getRowData(params.startRow, params.endRow)
                    .subscribe((data: any) => {
                        params.successCallback(data.data, data.totalCount)
                    });
            }

            if (params.filterModel.cod) {
                this.getRowData(params.startRow, params.endRow, params.filterModel.cod.filter, 'cod')
                    .subscribe((data: any) => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.cod_barras) {
                this.getRowData(params.startRow, params.endRow, params.filterModel.cod_barras.filter, 'cod_barras')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.nombre) {
                this.getRowData(params.startRow, params.endRow, params.filterModel.nombre.filter, 'name')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }

            if (params.filterModel.marca) {
                this.getRowData(params.startRow, params.endRow, params.filterModel.marca.filter, 'marca')
                    .subscribe(data => {
                        params.successCallback(data.data, data.totalCount)
                    });
                return;
            }
        }
    }
    // Ag-grid

    private gridApi: GridApi;
    private gridColumnApi;
    public columnDefs: any[];
    public gridOptions: any;
    public info: string;
    totalCount: number = 0;
    localeText = AG_GRID_LOCALE;
    gridHeight: string = '350px';

    constructor(private productService: ProductService,
                public dialog: MatDialog,
                private store: Store<IAppState>) {
        this.columnDefs = [
            {
                headerName: 'Código', field: 'cod',
                filter: true,
                floatingFilter: true,
                suppressMenu: true,
                floatingFilterComponentParams: {suppressFilterButton: true},
            },
            {
                headerName: 'Código barras', field: 'cod_barras',
                filter: true,
                suppressMenu: true,
                floatingFilter: true,
                floatingFilterComponentParams: {suppressFilterButton: true},
            },
            {
                headerName: 'Nombre', field: 'nombre',
                resizable: true,
                width: 400,
                filter: true,
                suppressMenu: true,
                floatingFilter: true,
                floatingFilterComponentParams: {suppressFilterButton: true}
            },
            {
                headerName: 'Marca', field: 'marca',
                suppressMenu: true,
                filter: true,
                floatingFilter: true,
                floatingFilterComponentParams: {suppressFilterButton: true}
            },
            {headerName: 'Imagen', field: 'image', cellRendererFramework: ImageFormatterComponent},
        ];

        this.gridOptions = {
            defaultColDef: {
                flex: 1,
                resizable: true,
                minWidth: 100,
            },
            rowHeight: 50,
            rowSelection: 'single',
            cacheBlockSize: 25,
            maxBlocksInCache: 2,
            enableServerSideFilter: false,
            enableServerSideSorting: false,
            rowModelType: 'infinite',
            pagination: true,
            paginationAutoPageSize: true
        }
    }

    ngOnInit(): void {
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.setDatasource(this.dataSource);
        // let datasource = {
        //     getRows: (params: IGetRowsParams) => {
        //         this.info = "Getting datasource rows, start: " + params.startRow + ", end: " + params.endRow;
        //         this.getRowData(params.startRow, params.endRow)
        //             .subscribe(data => {
        //                 params.successCallback(data)
        //             });
        //     }
        // };
        // params.api.setDatasource(datasource);
    }

    openModal(evt) {
        let {data} = evt;
        console.log(evt);
        const dialogRef = this.dialog.open(AddImagesDialogComponent, {
            width: '90vw',
            height: '600px',
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
        });
    }

    searchProduct(query, type) {
        return this.store.select('setup')
            .pipe(
                switchMap(
                    setup => this.productService.getProductsByName(query, setup.companyId)
                )
            )
    }

    private getRowData(start: number, end: number, query?: string, typeFilter?: string) {
        let productsAdmin$: Observable<any>;
        return this.store.select('setup')
            .pipe(
                switchMap(({companyId}) => {
                        if (query && typeFilter) {
                            productsAdmin$ = this.productService.getProductsAdmin(start, end, companyId, query, typeFilter)
                        } else {
                            productsAdmin$ = this.productService.getProductsAdmin(start, end, companyId)
                        }
                        return productsAdmin$
                            .pipe(
                                map((res: any) => {
                                    let rowData = [];
                                    res.data.forEach(product => {
                                        rowData.push({
                                            id: product.product_id,
                                            company_id: product.company_id,
                                            cod: product.product_cod,
                                            cod_barras: product.cod_barras,
                                            nombre: product.nombre,
                                            marca: product.marca,
                                            image: product.images[0] || './assets/producto-default.jpg'
                                        });
                                    })
                                    return {
                                        ...res,
                                        data: rowData
                                    };
                                })
                            )
                    }
                )
            )
    }

}
