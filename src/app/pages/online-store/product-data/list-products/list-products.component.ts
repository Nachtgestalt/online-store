import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from "../../../../services/product.service";
import {map, switchMap, tap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {IProduct} from "../../../../models/product.interface";
import * as cartActions from "../../../../store/actions/cart.actions";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../../store/state/app.state";

@Component({
    selector: 'app-list-products',
    templateUrl: './list-products.component.html',
    styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent implements OnInit {
    @Input()
    categoryId;

    showStock$: Observable<any>;
    showPrice$: Observable<any>;
    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    products$: Observable<any>;

    actualPage: number = 0;
    loadingProducts = false;

    _page = new BehaviorSubject(0);

    get page() {
        return this._page.getValue()
    }

    products = [];
    totalCount: number;

    @Input()
    set page(value) {
        this._page.next(value)
    }

    productsPerPage = 25;
    noMoreItemsInCategory = false;

    setup;

    constructor(private productService: ProductService,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        this.showStock$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                tap(([authState, setupState]) => this.setup = setupState),
                map(([authState, setupState]) => {
                    let {showStock} = setupState;
                    let {user} = authState;
                    switch (showStock) {
                        case -1:
                            return false
                        case 0:
                            return true
                        case 1:
                            return !!authState.isAuthenticated;
                        case 2:
                            let showSetup = false
                            if (user) {
                                if (user.setup && user.setup.length > 0) {
                                    user.setup.forEach(setup => {
                                        if (setup.setupId === setupState.id) {
                                            showSetup = setup.showStock === 1;
                                        }
                                    })
                                }
                            }
                            return showSetup;
                        default:
                            return false
                    }
                })
            );

        this.showPrice$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                map(([authState, setupState]) => {
                    let {showPrice} = setupState;
                    let {user} = authState;
                    switch (showPrice) {
                        case -1:
                            return false
                        case 0:
                            return true
                        case 1:
                            return !!authState.isAuthenticated;
                        case 2:
                            let flagPrice = false
                            if (user) {
                                if (user.setup && user.setup.length > 0) {
                                    user.setup.forEach(setup => {
                                        if (setup.setupId === setupState.id) {
                                            flagPrice = setup.showPrice === 1;
                                        }
                                    })
                                }
                            }
                            return flagPrice;
                        default:
                            return false
                    }
                })
            );

        this._page.subscribe(page => {
            if (page !== 1) {
                console.log('Pagina => ', page);
                this.loadNextProducts();
            }
        });

        if (this.categoryId) {
            this.products$ = combineLatest([this.getAuthState, this.getSetupState])
                .pipe(
                    switchMap(([authState, setupState]) => {
                        let mlPriceIdUser = 0;
                        let {user} = authState;
                        let {companyId, bodegaId, mlPriceId} = setupState;
                        if (!authState.isAuthenticated) {
                            return this.productService.getProductsByCategory(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        if (user && user.setup && user.setup.length > 0) {
                            user.setup.forEach(setup => {
                                if (setup.setupId === setupState.id) {
                                    mlPriceIdUser = setup.mlPriceId;
                                }
                            })
                            if (!mlPriceIdUser || mlPriceIdUser === 0) {
                                return this.productService.getProductsByCategory(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                                    `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                            }
                            return this.productService.getProductsByCategory(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceIdUser)
                        }
                    })
                );

            this.products$.subscribe((res: any) => {
                this.products = res.data;
                this.totalCount = res.totalCount;
                this.actualPage = res.page;
                if (res.data.length < 25) {
                    this.noMoreItemsInCategory = true;
                    this.loadNextProducts();
                }
            })
        } else {
            this.noMoreItemsInCategory = true
            this.loadNextProducts();
        }
    }

    loadNextProducts() {
        if (!this.noMoreItemsInCategory) {
            let products$ = combineLatest([this.getAuthState, this.getSetupState])
                .pipe(
                    switchMap(([authState, setupState]) => {
                        let mlPriceIdUser = 0;
                        let {user} = authState;
                        let {companyId, bodegaId, mlPriceId} = setupState;
                        if (!authState.isAuthenticated) {
                            return this.productService.getProductsByCategory(`${this.actualPage + 1}`,
                                `${this.productsPerPage}`,
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        if (user && user.setup && user.setup.length > 0) {
                            user.setup.forEach(setup => {
                                if (setup.setupId === setupState.id) {
                                    mlPriceIdUser = setup.mlPriceId;
                                }
                            })
                            if (!mlPriceIdUser || mlPriceIdUser === 0) {
                                return this.productService.getProductsByCategory(`${this.actualPage + 1}`,
                                    `${this.productsPerPage}`,
                                    `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                            }
                            return this.productService.getProductsByCategory(`${this.actualPage + 1}`,
                                `${this.productsPerPage}`,
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceIdUser)
                        }
                    })
                );
            products$.subscribe((data: any) => {
                if (data.data.length !== 0) {
                    const newProduct = data.data;
                    this.actualPage = data.page;
                    this.products = this.products.concat(newProduct);
                } else {
                    this.noMoreItemsInCategory = true;
                    this.loadNextProducts();
                }
            })
        } else {
            this.loadProducts();
        }
    }

    loadProducts() {
        this.loadingProducts = true;

        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getListProducts(this.actualPage + 1, this.productsPerPage, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getListProducts(this.actualPage + 1, this.productsPerPage, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this.productService.getListProducts(this.actualPage + 1, this.productsPerPage, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    } else {
                        return this.productService.getListProducts(this.actualPage + 1, this.productsPerPage, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                })
            );

        products$.subscribe((products: any) => {
            const newProducts = products.data
            this.actualPage = products.page;
            this.products = this.products.concat(newProducts)
            this.loadingProducts = false
        })


        // this.store.select('setup')
        //     .pipe(
        //         take(1),
        //         switchMap(setup => this.productService.getListProducts(this.actualPage + 1, this.productsPerPage, setup.companyId, setup.bodegaId)),
        //     )
        //     .subscribe(
        //         (data: any) => {
        //             console.log('Recibiendo productos => ', data);
        //             const newProducts = data.data
        //             this.actualPage = data.page;
        //             this.products = this.products.concat(newProducts)
        //             this.loadingProducts = false
        //         },
        //         () => this.loadingProducts = false
        //     );
    }

    addProductToCart(productData) {
        const product: IProduct = {
            id: productData.product_id,
            companyId: productData.company_id,
            setupId: this.setup.id,
            amount: 1,
            category: '',
            name: productData.nombre,
            price: productData.pvp - productData.discount_value,
            image: productData.images[0] || null,
            marca: productData.marca,
            discount: productData.discount_value,
            pvp: productData.pvp,
            cod_barras: productData.cod_barras,
            cod: productData.product_cod,
            price_type: productData.product_price_id
        }
        this.store.dispatch(cartActions.setItem({product}))
    }

}
