import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {CategoryComponent} from "./category/category.component";
import {ProductDataComponent} from "./product-data/product-data.component";
import {ResultsComponent} from "./results/results.component";
import {CartComponent} from "./cart/cart.component";
import {CheckoutGuard} from "../../helpers/checkout.guard";
import {CheckoutComponent} from "../member/checkout/checkout.component";
import {ConfirmOrderComponent} from "../member/confirm-order/confirm-order.component";
import {AuthGuard} from "../../helpers/auth.guard";
import {OnlineStoreComponent} from "./online-store.component";
import {AdminGuard} from "../../helpers/admin.guard";
import {HomeProductsComponent} from "./home/home-products/home-products.component";
import {AboutUsComponent} from "./home/about-us/about-us.component";
import {ContactComponent} from "./home/contact/contact.component";
import {BranchComponent} from "./home/branch/branch.component";
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";
import {ConfirmAccountComponent} from "./confirm-account/confirm-account.component";
import {ProductsOnOfferComponent} from "./products-on-offer/products-on-offer.component";
import {FeaturedProductsComponent} from "./featured-products/featured-products.component";


const routes: Routes = [
    {
        path: '', component: OnlineStoreComponent,
        children: [
            {
                path: 'home', component: HomeComponent,
                children: [
                    {path: '', redirectTo: 'products', pathMatch: 'full'},
                    {path: 'products', component: HomeProductsComponent},
                    {path: 'about-us', component: AboutUsComponent},
                    {path: 'contact', component: ContactComponent},
                    {path: 'branch', component: BranchComponent}
                ]
            },
            {path: 'products/on-offer', component: ProductsOnOfferComponent},
            {path: 'products/featured', component: FeaturedProductsComponent},
            {path: 'login', component: LoginComponent},
            {path: 'register', component: RegisterComponent},
            {path: 'confirm-account/:email', component: ConfirmAccountComponent},
            {path: 'forgot-password', component: ForgotPasswordComponent},
            {path: 'cat/:category/:id', component: CategoryComponent},
            {path: 'cat/:category/:id/:productId', component: ProductDataComponent},
            {path: 'product/:productId', component: ProductDataComponent},
            {path: 'results', component: ResultsComponent},
            {path: 'cart', component: CartComponent},
            {
                path: 'checkout',
                canActivate: [CheckoutGuard],
                component: CheckoutComponent
            },
            {path: 'confirmOrder', redirectTo: 'confirmOrder/-1'},
            {path: 'confirmOrder/:orderId', component: ConfirmOrderComponent},
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {
                path: 'dashboarduser',
                canActivate: [AuthGuard],
                loadChildren: () => import('../member/member.module').then(m => m.MemberModule)
            },
            {
                path: 'dashboardadmin',
                canActivate: [AuthGuard, AdminGuard],
                loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OnlineStoreRoutingModule {
}
