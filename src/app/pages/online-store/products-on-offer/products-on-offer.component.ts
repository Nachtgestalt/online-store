import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from "rxjs";
import {ProductService} from "../../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {UpdateProductsService} from "../../../services/update-products.service";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../store/state/app.state";
import {first, switchMap} from "rxjs/operators";

@Component({
    selector: 'app-products-on-offer',
    templateUrl: './products-on-offer.component.html',
    styleUrls: ['./products-on-offer.component.scss']
})
export class ProductsOnOfferComponent implements OnInit {

    totalCount: number;
    actualPage: number = 1;
    productsPerPage = 25;

    products = [];
    loading = false;
    categoryTitle: string = 'EN OFERTA';

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    showStock$: Observable<any>;
    showPrice$: Observable<any>;

    constructor(private productService: ProductService,
                private activatedRoute: ActivatedRoute,
                private updateProductsService: UpdateProductsService,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        this.loadProductsOnOffer();
    }

    onScroll() {
        this.loadNextProducts();
    }

    loadProductsOnOffer() {
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getProductsOnOffer(`1`, `${this.productsPerPage}`, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getProductsOnOffer(`1`, `${this.productsPerPage}`, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this.productService.getProductsOnOffer(`1`, `${this.productsPerPage}`, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    } else {
                        return this.productService.getProductsOnOffer(`1`, `${this.productsPerPage}`, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                })
            );

        products$
            .pipe(
                first()
            )
            .subscribe((products: any) => {
                this.products = products.data;
                this.totalCount = products.totalCount;
                this.actualPage = products.page;
            })
    }

    loadNextProducts() {
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getProductsOnOffer(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                            companyId, bodegaId, setupState.id, mlPriceId);
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getProductsOnOffer(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                                companyId, bodegaId, setupState.id, mlPriceId);
                        }
                        return this.productService.getProductsOnOffer(`${this.actualPage + 1}`, `${this.productsPerPage}`,
                            companyId, bodegaId, setupState.id, mlPriceIdUser);
                    }
                })
            );

        products$
            .pipe(
                first()
            )
            .subscribe(
                (products: any) => {
                    const newProduct = products.data;
                    this.actualPage = products.page;
                    this.products = this.products.concat(newProduct);
                    this.loading = false;
                })

    }

}
