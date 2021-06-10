import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IAppState, selectAuthState, selectSetupState, selectUserState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {forkJoin, Observable, of} from "rxjs";
import {catchError, map, switchMap, take, tap} from "rxjs/operators";
import {UserService} from "../../../services/user.service";
import {IProduct} from "../../../models/product.interface";
import * as userActions from '../../../store/actions/user.actions'
import {DeleteUser} from '../../../store/actions/user.actions'
import * as fromCart from '../../../store/reducers/cart.reducers'
import {OrderService} from "../../../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {emptyCart} from "../../../store/actions/cart.actions";
import {FileItem} from "../../../models/file-item";
import {BankAccountsService} from "../../../services/bank-accounts.service";
import {PayTypeService} from "../../../services/pay-type.service";

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
    payTypeIsTransfer = false;
    setup;
    bankAccounts: Observable<any>;
    payTypes: Observable<any>;
    registerOrderRequests = [];
    observationTextArea = new FormControl('');

    // File input
    payType = new FormControl(1, Validators.required);
    bankAccount;
    fileInput = new FormControl();
    fileErrorMessage = '';
    imgURL: any;
    imagePath;
    archivo: FileItem[] = [];

    // FormGroups
    personaDataGroup: FormGroup;
    billingAddressGroup: FormGroup;
    deliveryAddressGroup: FormGroup;

    personDataExists = false;
    billingAddressExists = false;
    deliveryAddressExists = false;

    getState: Observable<any>;
    getUserState: Observable<any>;
    getCartState: Observable<any>;
    getSetupState: Observable<any>;

    userId;
    user;

    products = [];
    total;

    constructor(private store: Store<IAppState>,
                private userService: UserService,
                private orderService: OrderService,
                private bankAccountsService: BankAccountsService,
                private payTypeService: PayTypeService,
                private _snackBar: MatSnackBar,
                private route: ActivatedRoute,
                private router: Router) {
        this.getState = this.store.select(selectAuthState);
        this.getUserState = this.store.select(selectUserState);
        this.getSetupState = this.store.select(selectSetupState)
            .pipe(take(1));
        this.getCartState = this.store.select(fromCart.selectAll).pipe(
            tap(cart => this.products = cart),
            map((cart: IProduct[]) => {
                let total = 0;
                cart.forEach((product: IProduct) => {
                    total += (product.pvp - product.discount) * product.amount
                })
                this.total = total;
                return total;
            })
        )
    }

    get fPersonData() {
        return this.personaDataGroup.controls
    };

    get fBillingAddress() {
        return this.billingAddressGroup.controls
    };

    get fDeliveryAddress() {
        return this.deliveryAddressGroup.controls
    };

    ngOnInit(): void {
        this.bankAccounts = this.getSetupState.pipe(
            tap(setup => this.setup = setup),
            switchMap(setup => this.bankAccountsService.fetchBankAccounts(setup.id))
        );

        this.payTypes = this.getSetupState.pipe(
            tap(setup => this.setup = setup),
            switchMap(setup => this.payTypeService.fetchPayTypes(setup.id))
        );

        this.personaDataGroup = new FormGroup({
            'id': new FormControl(),
            'ciRuc': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(13)])),
            'firstname': new FormControl('', Validators.required),
            'lastname': new FormControl(''),
            'userId': new FormControl()
        })

        this.getState.pipe(
            tap(({user}) => this.userId = user.id),
            switchMap(({user}) => {
                    const personData = this.userService.getPersonData(user.id).pipe(catchError(err => {
                        return of(undefined);
                    }));
                    const billingAddress = this.userService.getBillingAddress(user.id).pipe(catchError(err => {
                        return of(undefined);
                    }));
                    const deliveryAddress = this.userService.getDeliveryAddress(user.id).pipe(catchError(err => {
                        return of(undefined);
                    }));
                    return forkJoin([personData, billingAddress, deliveryAddress]).pipe(
                        map(res => {
                            return {
                                ...user,
                                personData: res[0],
                                billingAddress: res[1],
                                deliveryAddress: res[2],
                            }
                        })
                    )
                }
            )
        ).subscribe(
            res => {
                let {billingAddress, personData, deliveryAddress} = res;
                if (personData) {
                    this.personDataExists = true;
                    this.personaDataGroup.patchValue(personData);
                }
                if (billingAddress) {
                    this.billingAddressExists = true;
                    this.billingAddressGroup.patchValue(billingAddress);
                }
                if (deliveryAddress) {
                    this.deliveryAddressExists = true;
                    this.deliveryAddressGroup.patchValue(deliveryAddress);
                }
            }
        );

        this.billingAddressGroup = new FormGroup({
            'id': new FormControl(),
            'country': new FormControl('', Validators.required),
            'city': new FormControl('', Validators.required),
            'address': new FormControl('', Validators.required),
            'houseNumber': new FormControl('', Validators.required),
            'zipCode': new FormControl(''),
            'streetMain': new FormControl('', Validators.required),
            'streetSecond': new FormControl('', Validators.required),
            'reference': new FormControl('', Validators.required),
            'email': new FormControl('', Validators.required),
            'phone': new FormControl(''),
            'mobile': new FormControl('', Validators.required),
            'addressTypeId': new FormControl(1, Validators.required),
            'usersId': new FormControl(null),
        })

        this.deliveryAddressGroup = new FormGroup({
            'id': new FormControl(),
            'country': new FormControl('', Validators.required),
            'city': new FormControl('', Validators.required),
            'address': new FormControl('', Validators.required),
            'houseNumber': new FormControl('', Validators.required),
            'zipCode': new FormControl(''),
            'streetMain': new FormControl('', Validators.required),
            'streetSecond': new FormControl('', Validators.required),
            'reference': new FormControl('', Validators.required),
            'email': new FormControl('', Validators.required),
            'phone': new FormControl(''),
            'mobile': new FormControl('', Validators.required),
            'addressTypeId': new FormControl(2, Validators.required),
            'usersId': new FormControl(null),
        })

        this.getUserState.subscribe(user => {
            this.user = user;
            let {personData, billingAddress} = user;
            if (user.personData) {
                this.personaDataGroup.patchValue(personData);
            }
            if (user.billingAddress) {
                this.billingAddressGroup.patchValue(billingAddress);
                if (!this.deliveryAddressExists) {
                    this.deliveryAddressGroup.patchValue(billingAddress);
                    this.fDeliveryAddress.addressTypeId.patchValue(2);
                }
            }
        })

    }

    savePersonData() {
        this.fPersonData.userId.patchValue(this.userId);
        this.store.dispatch(userActions.SetPersonData({personData: this.personaDataGroup.value}))
    }

    saveBillingAddress() {
        this.fBillingAddress.usersId.patchValue(this.userId);
        this.fBillingAddress.addressTypeId.patchValue(1);
        this.store.dispatch(userActions.SetBillingAddress({billingAddress: this.billingAddressGroup.value}))
    }

    saveDeliveryAddress() {
        this.fDeliveryAddress.usersId.patchValue(this.userId);
        this.fDeliveryAddress.addressTypeId.patchValue(2);
        this.store.dispatch(userActions.SetDeliveryAddress({deliveryAddress: this.deliveryAddressGroup.value}))
    }

    changeSelectionPayType(ev) {
        let {value} = ev
        console.log(ev)
        if (value.cod === 'TRANSFER') {
            this.payType.patchValue(value.id);
            this.payTypeIsTransfer = true;
        }
    }

    onFileChange(files) {
        this.archivo = [];
        if (files.length === 0) {
            return;
        }

        if (files[0].size > 3000000) {
            this.fileErrorMessage = 'El archivo es mayor a 3MB'
            return;
        }

        this.archivo.push(new FileItem(files[0]));
        let reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        }
    }

    setPayType(payType: number) {
        this.payType.patchValue(payType);
    }

    confirmOrder() {
        if (this.products.length === 0) {
            this._snackBar.open('Deben haber productos en tu carrito para completar una orden', 'Aceptar', {
                panelClass: 'snack-danger'
            });
            return;
        }
        if (!this.personDataExists) {
            let registerPersonData = this.userService.registerPersonData(this.personaDataGroup.value)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al registrar datos de la persona'});
                }))
            this.registerOrderRequests.push(registerPersonData)
        } else if (this.personaDataGroup.dirty) {
            let {userId, ...personData} = this.personaDataGroup.value;
            let updatePersonData = this.userService.updatePersonData(personData)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al actualizar datos de la persona'});
                }))
            this.registerOrderRequests.push(updatePersonData);
        }

        if (!this.billingAddressExists) {
            let registerBillingAddress = this.userService.registerBillingAddress(this.billingAddressGroup.value)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al registrar Dirección de facturación'});
                }));
            this.registerOrderRequests.push(registerBillingAddress);
        } else if (this.billingAddressGroup.dirty) {
            let updateBillingAddress = this.userService.updateAddress(this.billingAddressGroup.value)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al registrar Dirección de facturación'});
                }));
            this.registerOrderRequests.push(updateBillingAddress);
        }

        if (!this.deliveryAddressExists) {
            let registerDeliveryAddress = this.userService.registerDeliveryAddress(this.deliveryAddressGroup.value)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al registrar Dirección de envío'});
                }))
            this.registerOrderRequests.push(registerDeliveryAddress);
        } else if (this.deliveryAddressGroup.dirty) {
            let updateDeliveryAddress = this.userService.updateAddress(this.deliveryAddressGroup.value)
                .pipe(catchError(err => {
                    return of({success: false, message: 'Error al actualizar Dirección de envío'});
                }));
            this.registerOrderRequests.push(updateDeliveryAddress)

        }

        let order = {
            usersId: this.userId,
            observation: this.observationTextArea.value,
            total: this.total,
            payTypeId: this.payType.value,
            setupId: this.setup.id,
            observationPay: '',
            payOrder: {
                payTypeId: this.payType.value,
                bankAccountsId: this.bankAccount.id
            }
        }


        if (this.registerOrderRequests.length > 0) {
            forkJoin(this.registerOrderRequests)
                .pipe(
                    switchMap((res: any) => {
                        res.map(res => {
                            if (!res.success) {
                                return of({success: false, message: res.message})
                            }
                        })
                        return this.orderService.registerOrder(this.user, order, this.products)
                    })
                )
                .subscribe(
                    (res: any) => {
                        let {order} = res;
                        if (!res.success) {
                            this._snackBar.open(res.message, 'Aceptar', {
                                panelClass: 'snack-danger'
                            });
                            return;
                        } else {
                            this.store.dispatch(emptyCart());
                            this.store.dispatch(DeleteUser());
                            this.uploadPicOfPay(order);
                            this.router.navigate(['../confirmOrder', res.order.id], {
                                relativeTo: this.route,
                                queryParams: {
                                    newOrder: true
                                }
                            });
                        }
                    },
                    error => {
                        this._snackBar.open(error, 'Aceptar', {
                            panelClass: 'snack-danger'
                        });
                    }
                )
        } else {
            this.orderService.registerOrder(this.user, order, this.products)
                .subscribe(
                    (res: any) => {
                        let {order} = res;
                        if (!res.success) {
                            this._snackBar.open(res.message, 'Aceptar', {
                                duration: 2000,
                                panelClass: 'snack-danger'
                            });
                            return;
                        } else {
                            this.uploadPicOfPay(order);
                            this.store.dispatch(emptyCart());
                            this.store.dispatch(DeleteUser());
                            this.router.navigate(['../confirmOrder', res.order.id], {
                                relativeTo: this.route,
                                queryParams: {
                                    newOrder: true
                                }
                            });
                        }
                    },
                    error => {
                        this._snackBar.open(error, 'Aceptar', {
                            panelClass: 'snack-danger'
                        });
                    }
                )
        }
    }

    uploadPicOfPay(order) {
        if (this.archivo.length > 0) {
            this.getSetupState.pipe(
                switchMap(
                    setup => {
                        let orderData = {
                            companyId: setup.companyId,
                            orderId: order.id
                        }
                        return this.orderService.uploadPics(this.archivo, orderData)
                    }
                )
            ).subscribe(res => console.log(res));
        }
    }
}
