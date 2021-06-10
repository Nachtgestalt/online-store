import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MemberComponent} from './member.component';
import {MaterialModule} from "../../material.module";
import {AgGridModule} from "ag-grid-angular";
import {MEMBER_ROUTES} from "./member.routes";
import {ConfigOptionsComponent} from './config-options/config-options.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ImageFormatterComponent} from "../../components/image-formatter/image-formatter.component";
import {CheckoutComponent} from './checkout/checkout.component';
import {ConfirmOrderComponent} from './confirm-order/confirm-order.component';
import {ComponentsModule} from "../../components/components.module";
import {SecurityComponent} from './security/security.component';
import {UserOrdersComponent} from "./user-orders/user-orders.component";
import {DirectivesModule} from "../../directives/directives.module";
import {AllOrdersComponent} from './user-orders/all-orders/all-orders.component';
import {OrderDetailComponent} from './user-orders/order-detail/order-detail.component';
import {SeePaymentDialogComponent} from './user-orders/see-payment-dialog/see-payment-dialog.component';


@NgModule({
    declarations: [
        MemberComponent,
        UserOrdersComponent,
        ConfigOptionsComponent,
        CheckoutComponent,
        ConfirmOrderComponent,
        SecurityComponent,
        AllOrdersComponent,
        OrderDetailComponent,
        SeePaymentDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AgGridModule.withComponents([ImageFormatterComponent]),
        DirectivesModule,
        MaterialModule,
        ComponentsModule,
        MEMBER_ROUTES,
    ],
    entryComponents: [
        SeePaymentDialogComponent
    ]
})
export class MemberModule {
}
