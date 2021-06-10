import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {ShareService} from "@ngx-share/core";
import {FaIconLibrary} from "@fortawesome/angular-fontawesome";
import {iconpack} from "../../../../icons";
import {BreakpointObserver, Breakpoints, BreakpointState, MediaMatcher} from '@angular/cdk/layout';
import {combineLatest, Observable} from 'rxjs';
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../../store/state/app.state";
import {IProduct} from "../../../models/product.interface";
import * as cartActions from "../../../store/actions/cart.actions";
import {map, switchMap, tap} from "rxjs/operators";

@Component({
    selector: 'app-product-data',
    templateUrl: './product-data.component.html',
    styleUrls: ['./product-data.component.scss']
})
export class ProductDataComponent implements OnInit {
    actualPage = 1;

    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    productId;
    productData;
    imageObject = [];
    infiniteSlider = true;
    isMobile = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.XSmall);

    showStock$: Observable<any>;
    showPrice$: Observable<any>;
    getAuthState: Observable<any>;
    getSetupState: Observable<any>;

    setup;

    constructor(private productService: ProductService,
                private route: ActivatedRoute,
                public share: ShareService,
                public library: FaIconLibrary,
                media: MediaMatcher,
                changeDetectorRef: ChangeDetectorRef,
                private breakpointObserver: BreakpointObserver,
                private store: Store<IAppState>
    ) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
        library.addIcons(...iconpack);
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.route.paramMap.subscribe(({params}: any) => {
                /**
                 * Es necesario inicializar aqui con los valores por defecto
                 * ya que de otra manera da error usando la opcion infinite = true
                 */
                this.imageObject = [
                    {
                        image: './assets/producto-default.jpg',
                        thumbImage: './assets/producto-default.jpg'
                    }
                ];
                this.productId = params.productId;
                this.productData = null;
                this.getProductInfo();
            }
        )

        this.isExtraSmall.subscribe(result => {
            if (result.matches) {
                this.isMobile = true;
            }
        });
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

    getProductInfo() {
        this.store.select('setup')
            .pipe(
                switchMap(setup =>
                    this.productService.getProduct(this.productId, setup.bodegaId, setup.companyId)
                )
            )
            .subscribe((data: any) => {
                if (data.images.length === 0) {
                    this.imageObject.push({
                        image: './assets/producto-default.jpg',
                        thumbImage: './assets/producto-default.jpg'
                    })
                } else {
                    data.images.forEach(img => {
                        this.imageObject.push({image: img, thumbImage: img})
                    })
                }
                this.productData = data;
            })
    }

    onScroll() {
        this.actualPage = this.actualPage + 1;
    }

    addProductToCart() {
        const product: IProduct = {
            id: this.productData.product_id,
            companyId: this.productData.company_id,
            setupId: this.setup.id,
            amount: 1,
            category: '',
            name: this.productData.nombre,
            price: this.productData.pvp - this.productData.discount_value,
            image: this.productData.images[0] || null,
            marca: this.productData.marca,
            discount: this.productData.discount_value,
            pvp: this.productData.pvp,
            cod_barras: this.productData.cod_barras,
            cod: this.productData.product_cod

        }
        this.store.dispatch(cartActions.setItem({product}))
    }
}
