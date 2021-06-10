import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, Observable, Subscription} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../store/state/app.state";

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
    loading = false;
    searchResults = [];
    totalCount: number;
    actualPage: number = 1;
    productsPerPage = 25;
    searchQuery;
    subscription: Subscription;

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    constructor(private productService: ProductService,
                private route: ActivatedRoute,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);

        this.subscription = this.route.queryParams.subscribe(params => {
            this.searchQuery = params['search_query']
            this.searchResults = [];

            let products$ = combineLatest([this.getAuthState, this.getSetupState])
                .pipe(
                    switchMap(([authState, setupState]) => {
                        let mlPriceIdUser = 0;
                        let {user} = authState;
                        let {companyId, bodegaId, mlPriceId} = setupState;
                        if (!authState.isAuthenticated) {
                            console.log('No esta autenticado');
                            return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceId, 1,
                                25)
                        }
                        if (user && user.setup && user.setup.length > 0) {
                            console.log('Esta autenticado y tiene setups');
                            user.setup.forEach(setup => {
                                if (setup.setupId === setupState.id) {
                                    mlPriceIdUser = setup.mlPriceId;
                                }
                            })
                            if (!mlPriceIdUser || mlPriceIdUser === 0) {
                                console.log('El mlPriceIdUser user es igual a 0');
                                console.log('El mlPriceId del setup es => ', mlPriceId);
                                return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceId, 1,
                                    25)
                            }
                            console.log('El mlPriceIdUser es diferente de 0 => ', mlPriceIdUser)
                            return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceIdUser, 1,
                                25)
                        }
                    })
                );

            products$.subscribe((products: any) => {
                this.searchResults = products.data;
                this.totalCount = products.totalCount;
                this.actualPage = products.page;
            })

            // this.store.select('setup')
            //     .pipe(
            //         switchMap(
            //             setup => this._productService.getSearchResults(
            //                 this.searchQuery,
            //                 setup.companyId,
            //                 setup.bodegaId,
            //                 1,
            //                 25
            //             )
            //         )
            //     )
            //     .subscribe((data: any) => {
            //             this.searchResults = data.data;
            //             this.totalCount = data.totalCount;
            //             this.actualPage = data.page;
            //         }
            //     )
        })
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onScroll() {
        this.loadNextProducts();
    }

    loadNextProducts() {
        let moreProducts = true;
        this.loading = true
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        console.log('No esta autenticado');
                        return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceId, 1,
                            25, moreProducts)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        console.log('Esta autenticado y tiene setups');
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            console.log('El mlPriceIdUser user es igual a 0');
                            console.log('El mlPriceId del setup es => ', mlPriceId);
                            return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceId, 1,
                                25, moreProducts)
                        }
                        console.log('El mlPriceIdUser es diferente de 0 => ', mlPriceIdUser)
                        return this.productService.getSearchResults(this.searchQuery, companyId, bodegaId, setupState.id, mlPriceIdUser, 1,
                            25, moreProducts)
                    }
                })
            );

        products$.subscribe(
            (products: any) => {
                const newProduct = products.data;
                this.actualPage = products.page;
                this.searchResults = this.searchResults.concat(newProduct);
                this.loading = false;
            },
            () => this.loading = false
        )
    }

    //     this.store.select('setup')
    //         .pipe(
    //             switchMap(
    //                 setup => this._productService.getSearchResults(
    //                     this.searchQuery,
    //                     setup.companyId,
    //                     setup.bodegaId,
    //                     this.actualPage + 1,
    //                     this.productsPerPage,
    //                     moreProducts
    //                 )
    //             )
    //         )
    //         .subscribe((data: any) => {
    //                 const newProduct = data.data;
    //                 this.actualPage = data.page;
    //                 this.searchResults = this.searchResults.concat(newProduct);
    //                 this.loading = false;
    //             },
    //             () => this.loading = false)
    // }

}
