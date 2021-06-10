import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from "./admin.component";
import {AdminProductsComponent} from "./admin-products/admin-products.component";
import {AdminOrdersComponent} from "./admin-orders/admin-orders.component";
import {AdminUsersComponent} from "./admin-users/admin-users.component";
import {AdminConfigComponent} from "./admin-config/admin-config.component";
import {OrdersComponent} from "./admin-orders/orders/orders.component";
import {ListUsersComponent} from "./admin-users/list-users/list-users.component";
import {AdminTypeStatusOrdersComponent} from "./admin-orders/admin-type-status-orders/admin-type-status-orders.component";
import {OrderDetailAdminComponent} from "./admin-orders/orders/order-detail-admin/order-detail-admin.component";
import {ListOrdersComponent} from "./admin-orders/orders/list-orders/list-orders.component";
import {AdminPayTypesComponent} from "./admin-pay-types/admin-pay-types.component";
import {AdminBankAccountsComponent} from "./admin-pay-types/admin-bank-accounts/admin-bank-accounts.component";
import {DirectoryComponent} from "./directory/directory.component";


const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'orders', component: AdminOrdersComponent,
                children: [
                    {path: '', redirectTo: 'admin', pathMatch: 'full'},
                    {
                        path: 'admin', component: OrdersComponent,
                        children: [
                            {path: '', redirectTo: 'list', pathMatch: 'full'},
                            {path: 'list', component: ListOrdersComponent},
                            {path: ':id', component: OrderDetailAdminComponent},
                        ]
                    },
                    {path: 'order-status', component: AdminTypeStatusOrdersComponent},
                ]
            },
            {path: 'products', component: AdminProductsComponent},
            {
                path: 'admin-users', component: AdminUsersComponent,
                children: [
                    {path: 'users', component: ListUsersComponent},
                    {path: '', redirectTo: 'users', pathMatch: 'full'},
                ]
            },
            {
                path: 'pay-types', component: AdminPayTypesComponent,
                children: [
                    {path: 'bank-accounts', component: AdminBankAccountsComponent},
                    {path: '', redirectTo: 'bank-accounts', pathMatch: 'full'}
                ]
            },
            {path: 'directory', component: DirectoryComponent},
            {path: 'config', component: AdminConfigComponent},
            {path: '', redirectTo: 'orders', pathMatch: 'full'},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {
}
