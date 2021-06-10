import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ProductService} from "../../../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../../store/state/app.state";
import {first, map, switchMap} from "rxjs/operators";
import {ScrollContentService} from "../../../../services/scroll-content.service";
import {combineLatest, Observable, Subscription} from "rxjs";
import {FilterTypeEnum} from "../../../../models/filterType.enum";
import {UpdateProductsService} from "../../../../services/update-products.service";

@Component({
    selector: 'app-home-products',
    templateUrl: './home-products.component.html',
    styleUrls: ['./home-products.component.scss']
})
export class HomeProductsComponent implements OnInit, OnDestroy {
    loading = false;
    @Output() onSuggest: EventEmitter<any> = new EventEmitter();
    homeProducts = [];
    totalCount: number;
    actualPage: number = 1;
    productsPerPage = 25;
    companyName: string;
    city: string;

    subscription: Subscription;

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    showStock$: Observable<any>;
    showPrice$: Observable<any>;

    filterType: FilterTypeEnum | null = null;


    constructor(private productService: ProductService,
                private activatedRoute: ActivatedRoute,
                private scrollContentService: ScrollContentService,
                private updateProductsService: UpdateProductsService,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
        this.subscription = scrollContentService.scrollAnnounced$.subscribe(
            () => {
                this.loadNextProducts();
            }
        );

        updateProductsService.updateAnnounced$.subscribe(
            () => {
                console.log('Actualizando productos');
                this.loadInitProducts(1);
            }
        );
    }

    ngOnInit() {
        this.loadInitProducts(null);

        this.showStock$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
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
            )

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
            )
    }

    loadInitProducts(filter: FilterTypeEnum) {
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getProducts(1, this.productsPerPage, filter, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getProducts(1, this.productsPerPage, filter, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this.productService.getProducts(1, this.productsPerPage, filter, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    } else {
                        return this.productService.getProducts(1, this.productsPerPage, filter, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                })
            );

        products$.pipe(first()).subscribe((products: any) => {
            this.homeProducts = products.data;
            this.totalCount = products.totalCount;
            this.actualPage = products.page;
        })
    }

    applyFilter(filter: FilterTypeEnum) {
        this.filterType = filter;
        this.homeProducts = []
        this.loadInitProducts(filter)
    }

    loadNextProducts() {
        this.loading = true
        let products$: Observable<any>

        products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getMoreProducts(this.actualPage + 1, this.productsPerPage,
                            this.filterType,
                            companyId, bodegaId, setupState.id, mlPriceId);
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getMoreProducts(this.actualPage + 1, this.productsPerPage,
                                this.filterType,
                                companyId, bodegaId, setupState.id, mlPriceId);
                        }
                        return this.productService.getMoreProducts(this.actualPage + 1, this.productsPerPage,
                            this.filterType,
                            companyId, bodegaId, setupState.id, mlPriceIdUser);
                    }
                })
            );

        products$.subscribe((products: any) => {
            const newProduct = products.data;
            this.actualPage = products.page;
            this.homeProducts = this.homeProducts.concat(newProduct);
            this.loading = false;
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
