import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../store/state/app.state";
import {combineLatest, Observable} from "rxjs";

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
    products = [];
    totalCount: number;
    actualPage: number = 1;
    categoryTitle: string;
    categoryId;

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;


    constructor(private _productService: ProductService,
                private route: ActivatedRoute,
                private store: Store<IAppState>) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit() {
        this.route.paramMap.subscribe(({params}: any) => {
                this.categoryId = params.id;
                this.categoryTitle = params.category;
                this.loadInitProducts()
            }
        )
    }

    loadInitProducts() {
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this._productService.getProductsByCategory('1', '25',
                            `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this._productService.getProductsByCategory('1', '25',
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this._productService.getProductsByCategory('1', '25',
                            `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    } else {
                        return this._productService.getProductsByCategory('1', '25',
                            `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                })
            );

        products$.subscribe((products: any) => {
            this.products = products.data;
            this.totalCount = products.totalCount;
            this.actualPage = products.page;
        })
    }

    onScroll() {
        this.loadNextProducts();
    }

    loadNextProducts() {
        let products$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this._productService.getProductsByCategory(`${this.actualPage + 1}`, '25',
                            `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this._productService.getProductsByCategory(`${this.actualPage + 1}`, '25',
                                `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this._productService.getProductsByCategory(`${this.actualPage + 1}`, '25',
                            `${this.categoryId}`, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    }
                })
            );

        products$.subscribe((products: any) => {
            const newProduct = products.data;
            this.actualPage = products.page;
            this.products = this.products.concat(newProduct);
        })
    }

}
