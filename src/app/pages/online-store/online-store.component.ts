import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {combineLatest, Observable, Subscription} from "rxjs";
import {MatSidenav} from "@angular/material/sidenav";
import {MediaMatcher} from "@angular/cdk/layout";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoryService} from "../../services/category.service";
import {ProductService} from "../../services/product.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState, selectSetupState} from "../../store/state/app.state";
import * as fromCart from "../../store/reducers/cart.reducers";
import * as cartActions from '../../store/actions/cart.actions'
import {emptyCart} from '../../store/actions/cart.actions'
import {debounceTime, distinctUntilChanged, map, switchMap, take, tap} from "rxjs/operators";
import {Logout} from "../../store/actions/auth.actions";
import {DeleteUser} from "../../store/actions/user.actions";
import {SetupService} from "../../services/setup.service";
import {Location} from "@angular/common";

import {DEFAULT_INTERRUPTSOURCES, Idle} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import {environment} from "../../../environments/environment";
import {IProduct} from "../../models/product.interface";
import {UpdateProductsService} from "../../services/update-products.service";

@Component({
    selector: 'app-online-store',
    templateUrl: './online-store.component.html',
    styleUrls: ['./online-store.component.scss']
})
export class OnlineStoreComponent implements OnInit, OnDestroy {
    // Idle
    idleState = 'Not started.';
    timedOut = false;
    lastPing?: Date = null;

    menuOptions = [];
    dashboardOptions = [];
    dashboardUserOptions = [
        {
            label: 'Administrar pedidos',
            url: './dashboarduser/orders',
        },
        {
            label: 'Perfil de usuario',
            url: './dashboarduser/user-profile',
        },
        {
            label: 'Seguridad',
            url: './dashboarduser/security',
        }
    ];

    dashboardAdminOptions = [
        {
            label: 'Administrar pedidos',
            url: './dashboardadmin/orders',
        },
        {
            label: 'Administrar productos',
            url: './dashboardadmin/products',
        },
        {
            label: 'Usuarios y permisos',
            url: './dashboardadmin/admin-users',
        },
        {
            label: 'Administrar Tipos de pago',
            url: './dashboardadmin/pay-types',
        },
        {
            label: 'Directorio',
            url: './dashboardadmin/directory',
        },
        {
            label: 'Configuración',
            url: './dashboardadmin/config',
        }
    ]

    menuUserOptions = [
        {
            label: 'Mis pedidos',
            url: './dashboarduser/orders',
        }
    ]

    menuAdminOptions = [
        {
            label: 'Mis pedidos',
            url: './dashboarduser/orders',
        },
        {
            label: 'Dashboard admin',
            url: './dashboardadmin',
        }
    ]

    menuSuperAdminOptions = [
        {
            label: 'Mis pedidos',
            url: './dashboarduser/orders',
        },
        {
            label: 'Dashboard superusuario',
            url: '/globaladmin',
        }
    ]
    itemsInCart: number = 0;
    badgeItemsInCart: string
    searching = false;
    currentUser;
    searchInput: FormControl;
    filterCategoriesInput: FormControl = new FormControl();
    searchableList: any[] = ['nombre'];
    searchOptions: Observable<any[]>;

    mobileQuery: MediaQueryList;
    desktopQuery: MediaQueryList;

    categories$: Observable<any>;
    categories: any[] = [];
    @ViewChild('autoCompleteInput') autoCompleteInput: ElementRef;
    @ViewChild('autoCompleteInputMobile') autoCompleteInputMobile: ElementRef;
    @ViewChild('snav') sidenav: MatSidenav;

    getAuthState: Observable<any>;
    getSetupState: Observable<any>;
    getCartState: Observable<any>;
    isAuthenticated: boolean = false;
    isOnDashboard: boolean = true;
    user = null;
    errorMessage = null;

    selectedProduct;

    private _mobileQueryListener: () => void;

    routerSubscription: Subscription;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
                iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
                private idle: Idle, private keepalive: Keepalive,
                private _categorieService: CategoryService,
                private productService: ProductService,
                private authenticationService: AuthenticationService,
                private setupService: SetupService,
                private updateProductsService: UpdateProductsService,
                private route: ActivatedRoute,
                private router: Router,
                private store: Store<IAppState>,
                private renderer: Renderer2,
                location: Location) {
        this.getAuthState = this.store.select(selectAuthState);
        this.getSetupState = this.store.select(selectSetupState);
        this.getCartState = this.store.select(fromCart.selectAll);
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this.desktopQuery = media.matchMedia('(min-width: 1024px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.routerSubscription = this.router.events.subscribe((event: any) => {
            if (location.path().includes('dashboarduser')) {
                this.isOnDashboard = true;
                this.dashboardOptions = this.dashboardUserOptions;
            } else if (location.path().includes('dashboardadmin')) {
                this.isOnDashboard = true;
                this.dashboardOptions = this.dashboardAdminOptions;
            }
            if (event instanceof NavigationEnd) {
                if (event.url.includes('product') && !this.desktopQuery.matches) {
                    if (this.sidenav !== undefined) {
                        this.sidenav.close();
                    }
                }

                if (!event.url.includes('dashboarduser') && !event.url.includes('dashboardadmin')) {
                    this.isOnDashboard = false;
                }
            }
        });

        // sets an idle timeout of n seconds
        idle.setIdle(environment.idleTimeout);
        // sets a timeout period of n seconds. after n seconds of inactivity, the user will be considered timed out.
        idle.setTimeout(environment.idleAlert);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        idle.onIdleEnd.subscribe(() => {
            this.idleState = 'No longer idle.'
            this.reset();
        });

        idle.onIdleStart.subscribe(() => {
            this.idleState = 'You\'ve gone idle!'
        });

        idle.onTimeout.subscribe(() => {
            this.idleState = 'Timed out!';
            this.timedOut = true;
            this.logout();
        });

        // sets the ping interval to 15 seconds
        keepalive.interval(15);

        keepalive.onPing.subscribe(() => this.lastPing = new Date());
    }

    ngOnInit() {
        this.searchInput = new FormControl();
        combineLatest([this.getAuthState, this.getSetupState]).subscribe((res) => {
            let [authState, setupState] = res;
            this.isAuthenticated = authState.isAuthenticated;
            if (authState.isAuthenticated) {
                this.idle.watch();
                this.timedOut = false;
            } else {
                this.idle.stop();
            }
            this.user = authState.user;
            this.errorMessage = authState.errorMessage;
            if (authState.user) {
                if (authState.user.isRoot === 1) { // Es superusuario
                    this.menuOptions = this.menuSuperAdminOptions;
                } else if (authState.user.setup && authState.user.setup.length > 0) { // Pertenece al menos a una tienda
                    let isAdmin = false;
                    authState.user.setup.map(setup => {
                        if (setup.setupId === setupState.id && setup.isRoot === 1) { // Es administrador de la tienda actual
                            isAdmin = true;
                            this.menuOptions = this.menuAdminOptions;
                        }
                    })

                    if (!isAdmin) { // No es usuario de la tienda actual
                        this.menuOptions = this.menuUserOptions;
                    }
                } else { // Es cliente
                    this.menuOptions = this.menuUserOptions;
                }
            }
        });

        combineLatest([this.getSetupState, this.getCartState])
            .subscribe(
                (res) => {
                    let [setupState, cart] = res;
                    this.itemsInCart = 0;
                    cart.forEach((product: IProduct) => {
                        if (setupState.id !== product.setupId) {
                            this.store.dispatch(cartActions.deleteItem({product}))
                        } else {
                            this.itemsInCart = this.itemsInCart + product.amount;
                        }
                    })
                    this.badgeItemsInCart = `${this.itemsInCart}`;
                }
            );

        this.store.select('setup')
            .pipe(
                switchMap(res => this._categorieService.getCategories(res.companyId)),
            ).subscribe((categories: any) => this.categories = categories)
        this.searchOptions = this.searchInput.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((name: any) => {
                return this.filterProduct(name);
            })
        )
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
        this.routerSubscription.unsubscribe();
    }

    async searchProduct() {
        let selectedProduct = this.searchInput.value;
        if (typeof selectedProduct === "string") {
            await this.router.navigate(['./results'],
                {
                    relativeTo: this.route,
                    queryParams: {
                        search_query: selectedProduct
                    }
                })
        } else {
            console.log(this.searchInput.value);
            await this.router.navigate(
                ['./product', selectedProduct.product_id],
                {relativeTo: this.route}
            );
        }
        this.searchInput.reset();
        this.autoCompleteInput.nativeElement.blur();
        this.searching = false;
    }

    enableSearchBar() {
        this.searching = true;
        setTimeout(() => {
            const element = this.renderer.selectRootElement(this.autoCompleteInputMobile.nativeElement);
            element.focus()
        }, 1);
    }

    disableSearchBar() {
        this.searching = false;
    }

    displayFn(product): string {
        return product && product.nombre ? product.nombre : '';
    }

    filterProduct(name: string): Observable<any[]> {
        return combineLatest([this.getAuthState, this.getSetupState])
            .pipe(
                switchMap(([authState, setupState]) => {
                    let mlPriceIdUser = 0;
                    let {user} = authState;
                    let {companyId, bodegaId, mlPriceId} = setupState;
                    if (!authState.isAuthenticated) {
                        return this.productService.getProductsByName(name, companyId, bodegaId, setupState.id, mlPriceId)
                    }
                    if (user && user.setup && user.setup.length > 0) {
                        user.setup.forEach(setup => {
                            if (setup.setupId === setupState.id) {
                                mlPriceIdUser = setup.mlPriceId;
                            }
                        })
                        if (!mlPriceIdUser || mlPriceIdUser === 0) {
                            return this.productService.getProductsByName(name, companyId, bodegaId, setupState.id, mlPriceId)
                        }
                        return this.productService.getProductsByName(name, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    } else {
                        return this.productService.getProductsByName(name, companyId, bodegaId, setupState.id, mlPriceIdUser)
                    }
                }),
                map((response: any) => response.filter(product => {
                    return product.nombre.toLowerCase().indexOf(name.toLowerCase()) >= 0;
                }))
            );


        // return this.store.select('setup')
        //     .pipe(
        //         switchMap(res => this.productService.getProductsByName(name, res.companyId)),
        //         map((response: any) => response.filter(product => {
        //             return product.nombre.toLowerCase().indexOf(name.toLowerCase()) >= 0;
        //         }))
        //     );
    }

    logout() {
        this.store.select('setup')
            .pipe(
                tap(res => {
                    let redirectUrl = `/${res.companyAccount}`
                    this.router.navigate([redirectUrl]);
                }),
                take(1)
            ).subscribe(() => {
        })
        this.store.dispatch(emptyCart());
        this.store.dispatch(Logout(this.user));
        this.store.dispatch(DeleteUser());
    }

    goToLogin() {
        let routerStateSnapshot = this.router.routerState.snapshot;
        this.router.navigate(['./login'], {
            relativeTo: this.route,
            queryParams: {
                returnUrl: routerStateSnapshot.url
            }
        })
    }

    reset() {
        this.idle.watch();
        this.timedOut = false;
    }

    goToProductsOnOffer() {
        this.router.navigate(['./products/on-offer'], {relativeTo: this.route});
    }

    goToFeaturedProducts() {
        this.router.navigate(['./products/featured'], {relativeTo: this.route});
    }

    onUpdateProducts(filter) {
        this.router.navigate(['./home'], {relativeTo: this.route}).then(
            () => this.updateProductsService.announceUpdateProducts(filter)
        )
    }
}
