import {Component, Input, OnInit} from '@angular/core';
import {IAppState, selectAuthState, selectSetupState} from "../../store/state/app.state";
import {Store} from "@ngrx/store";
import {IProduct} from "../../models/product.interface";
import {MatDialog} from "@angular/material/dialog";
import {combineLatest, Observable} from "rxjs";
import * as cartActions from '../../store/actions/cart.actions'
import {ActivatedRoute, Router} from "@angular/router";
import {AddImagesDialogComponent} from "../../pages/admin/admin-products/add-images-dialog/add-images-dialog.component";
import {map, tap} from "rxjs/operators";
import {ISetupState} from "../../store/state/setup.state";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
    @Input()
    productInfo;

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;
    showStock$: Observable<any>;
    showPrice$: Observable<any>;
    setup: ISetupState;

    constructor(private store: Store<IAppState>,
                private router: Router,
                private route: ActivatedRoute,
                public dialog: MatDialog) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit() {
        this.showStock$ = combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                tap(([, setupState]) => {
                    this.setup = setupState
                }),
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

    addProduct() {
        const product: IProduct = {
            id: this.productInfo.product_id,
            companyId: this.productInfo.company_id,
            setupId: this.setup.id,
            amount: 1,
            category: '',
            name: this.productInfo.nombre,
            price: this.productInfo.pvp - this.productInfo.discount_value,
            image: this.productInfo.images[0] || null,
            marca: this.productInfo.marca,
            pvp: this.productInfo.pvp,
            discount: this.productInfo.discount_value,
            cod: this.productInfo.product_cod,
            cod_barras: this.productInfo.cod_barras,
            price_type: this.productInfo.product_price_id
        }
        this.store.dispatch(cartActions.setItem({product}))
    }

    uploadImage(producto) {
        const dialogRef = this.dialog.open(AddImagesDialogComponent, {
            width: '90vw',
            height: '600px',
            data: {...producto, id: producto.product_id}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
        });
    }

    goToProduct(productId) {
        console.log(this.router.url);
        let segments = this.route.snapshot.url[0].path;
        console.log(segments);
        if (segments === 'products') {
            this.router.navigate(['../../product', productId], {relativeTo: this.route})
        } else if (segments === 'cat') {
            this.router.navigate(['./', productId], {relativeTo: this.route})
        }
    }

}
