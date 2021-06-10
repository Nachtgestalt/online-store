import {RouterModule, Routes} from "@angular/router";
import {MemberComponent} from "./member.component";
import {UserOrdersComponent} from "./user-orders/user-orders.component";
import {ConfigOptionsComponent} from "./config-options/config-options.component";
import {SecurityComponent} from "./security/security.component";
import {AllOrdersComponent} from "./user-orders/all-orders/all-orders.component";
import {OrderDetailComponent} from "./user-orders/order-detail/order-detail.component";

const memberRoutes: Routes = [
    {
        path: '',
        component: MemberComponent,
        children: [
            {
                path: 'orders', component: UserOrdersComponent,
                children: [
                    {path: '', component: AllOrdersComponent},
                    {path: ':id', component: OrderDetailComponent}
                ]
            },
            {path: 'user-profile', component: ConfigOptionsComponent},
            {path: 'security', component: SecurityComponent},
            {path: '', redirectTo: 'orders', pathMatch: 'full'},
        ]
    }
]
export const MEMBER_ROUTES = RouterModule.forChild(memberRoutes);
