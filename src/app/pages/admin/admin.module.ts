import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminProductsComponent} from "./admin-products/admin-products.component";
import {AddImagesDialogComponent} from "./admin-products/add-images-dialog/add-images-dialog.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AgGridModule} from "ag-grid-angular";
import {ColorPickerModule} from 'ngx-color-picker';
import {ImageFormatterComponent} from "../../components/image-formatter/image-formatter.component";
import {MaterialModule} from "../../material.module";
import {ComponentsModule} from "../../components/components.module";
import {AdminOrdersComponent} from './admin-orders/admin-orders.component';
import {DirectivesModule} from "../../directives/directives.module";
import {AdminComponent} from "./admin.component";
import {AdminUsersComponent} from './admin-users/admin-users.component';
import {AdminConfigComponent} from './admin-config/admin-config.component';
import {OrdersComponent} from './admin-orders/orders/orders.component';
import {CheckPaymentDialogComponent} from './admin-orders/orders/check-payment-dialog/check-payment-dialog.component';
import {ListUsersComponent} from './admin-users/list-users/list-users.component';
import {PrivilegesComponent} from './admin-users/privileges/privileges.component';
import {AdminTypeStatusOrdersComponent} from "./admin-orders/admin-type-status-orders/admin-type-status-orders.component";
import {AddTypeStatusComponent} from './admin-orders/admin-type-status-orders/add-type-status/add-type-status.component';
import {ChangeOrderStatusComponent} from './admin-orders/orders/change-order-status/change-order-status.component';
import {OrderDetailAdminComponent} from './admin-orders/orders/order-detail-admin/order-detail-admin.component';
import {ListOrdersComponent} from './admin-orders/orders/list-orders/list-orders.component';
import {AdminPayTypesComponent} from './admin-pay-types/admin-pay-types.component';
import {AdminBankAccountsComponent} from './admin-pay-types/admin-bank-accounts/admin-bank-accounts.component';
import {AddBankAccountComponent} from './admin-pay-types/admin-bank-accounts/add-bank-account/add-bank-account.component';
import {PriceTypesComponent} from "./admin-users/list-users/price-types/price-types.component";
import {QuillModule} from "ngx-quill";
import {DirectoryComponent} from './directory/directory.component';
import {AddRegistryDirectoryComponent} from './directory/add-registry-directory/add-registry-directory.component';


@NgModule({
    declarations: [
        AdminComponent,
        AdminProductsComponent,
        AddImagesDialogComponent,
        AdminOrdersComponent,
        AdminUsersComponent,
        AdminConfigComponent,
        OrdersComponent,
        CheckPaymentDialogComponent,
        ListUsersComponent,
        PrivilegesComponent,
        AdminTypeStatusOrdersComponent,
        AddTypeStatusComponent,
        ChangeOrderStatusComponent,
        OrderDetailAdminComponent,
        ListOrdersComponent,
        AdminPayTypesComponent,
        AdminBankAccountsComponent,
        AddBankAccountComponent,
        PriceTypesComponent,
        DirectoryComponent,
        AddRegistryDirectoryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AgGridModule.withComponents([ImageFormatterComponent]),
        QuillModule,
        DirectivesModule,
        MaterialModule,
        ComponentsModule,
        AdminRoutingModule,
        ColorPickerModule
    ],
    entryComponents: [
        CheckPaymentDialogComponent,
        PrivilegesComponent,
        AddTypeStatusComponent,
        ChangeOrderStatusComponent,
        PriceTypesComponent,
        AddRegistryDirectoryComponent
    ]
})
export class AdminModule {
}
