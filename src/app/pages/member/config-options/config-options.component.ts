import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Store} from "@ngrx/store";
import {IAppState, selectAuthState} from "../../../store/state/app.state";
import {forkJoin, Observable} from "rxjs";
import {take} from "rxjs/operators";
import {UserService} from "../../../services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-config-options',
    templateUrl: './config-options.component.html',
    styleUrls: ['./config-options.component.scss']
})
export class ConfigOptionsComponent implements OnInit {
    BILLING_ADDRESS = 1;
    DELIVERY_ADDRESS = 2;
    personDataForm: FormGroup;
    billingAddressForm: FormGroup;
    deliveryAddressForm: FormGroup;

    getAuthState: Observable<any>

    constructor(private store: Store<IAppState>,
                private userService: UserService,
                private matSnackBar: MatSnackBar) {
        this.getAuthState = this.store.select(selectAuthState)
    }

    ngOnInit(): void {
        this.personDataForm = new FormGroup({
            'ciRuc': new FormControl('', [Validators.maxLength(13)]),
            'firstname': new FormControl(''),
            'lastname': new FormControl(''),
        });

        this.billingAddressForm = new FormGroup({
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
        })

        this.deliveryAddressForm = new FormGroup({
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
        });

        this.getAuthState.pipe(take(1)).subscribe(
            ({user}) => {
                let personData$ = this.userService.getPersonData(user.id);
                let billingAddress$ = this.userService.getDeliveryAddress(user.id);
                let deliveryAddress$ = this.userService.getBillingAddress(user.id);

                forkJoin([personData$, billingAddress$, deliveryAddress$])
                    .subscribe(
                        res => {
                            let [personData, billingAddress, deliveryAddress] = res;
                            this.personDataForm.addControl('id', new FormControl());
                            this.personDataForm.patchValue(personData);
                            this.deliveryAddressForm.addControl('id', new FormControl());
                            this.deliveryAddressForm.patchValue(billingAddress);
                            this.billingAddressForm.addControl('id', new FormControl());
                            this.billingAddressForm.patchValue(deliveryAddress);
                        }
                    )
            }
        )
    }

    onSubmitPersonData() {
        let personData = this.personDataForm.value;
        this.userService.updatePersonData(personData)
            .subscribe(
                ({personData}) => {
                    this.personDataForm.patchValue(personData)
                    this.matSnackBar.open('Datos personales actualizados', 'Aceptar')
                },
                error => this.matSnackBar.open('Error al actualizar datos', 'Aceptar', {panelClass: 'snack-danger'})
            )
    }

    onSubmitAddress(type: number) {
        let address = type === this.BILLING_ADDRESS ? this.billingAddressForm.value : this.deliveryAddressForm.value;
        this.userService.updateAddress(address)
            .subscribe(
                ({address}) => {
                    let message;
                    if (type === 1) {
                        this.billingAddressForm.patchValue(address);
                        message = 'Datos de facturación actualizados';
                    } else {
                        this.deliveryAddressForm.patchValue(address);
                        message = 'Datos de entrega actualizados';
                    }

                    this.matSnackBar.open(message, 'Aceptar')
                },
                error => this.matSnackBar.open('Error al actualizar datos', 'Aceptar', {panelClass: 'snack-danger'})
            )
    }


}
