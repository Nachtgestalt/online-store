import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MaterialModule} from "../../material.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgImageSliderModule} from "ng-image-slider";
import {AgGridModule} from "ag-grid-angular";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {ShareButtonsConfig} from "@ngx-share/core";
import {OnlineStoreComponent} from "./online-store.component";
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {CategoryComponent} from "./category/category.component";
import {ProductDataComponent} from "./product-data/product-data.component";
import {ListProductsComponent} from "./product-data/list-products/list-products.component";
import {ResultsComponent} from "./results/results.component";
import {FilterPipe} from "../../pipes/filter.pipe";
import {CartComponent} from "./cart/cart.component";
import {ShoppingListComponent} from "./cart/shopping-list/shopping-list.component";
import {OnlineStoreRoutingModule} from "./online-store-routing.module";
import {LoadingScreenInterceptor} from "../../helpers/loading.interceptor";
import {JwtInterceptor} from "../../helpers/jwt.interceptor";
import {ErrorInterceptor} from "../../helpers/error.interceptor";
import {ComponentsModule} from "../../components/components.module";
import {InputTypeComponent} from 'src/app/components/input-type/input-type.component';
import {HomeProductsComponent} from './home/home-products/home-products.component';
import {AboutUsComponent} from './home/about-us/about-us.component';
import {ContactComponent} from './home/contact/contact.component';
import {BranchComponent} from './home/branch/branch.component';
import {PipesModule} from "../../pipes/pipes.module";
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {QuillModule} from "ngx-quill";
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ConfirmAccountComponent} from './confirm-account/confirm-account.component';
import {ProductsOnOfferComponent} from './products-on-offer/products-on-offer.component';
import {FeaturedProductsComponent} from './featured-products/featured-products.component';

const customConfig: ShareButtonsConfig = {
    autoSetMeta: true
};

@NgModule({
    declarations: [
        OnlineStoreComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        CategoryComponent,
        ProductDataComponent,
        ListProductsComponent,
        ResultsComponent,
        FilterPipe,
        CartComponent,
        ShoppingListComponent,
        InputTypeComponent,
        HomeProductsComponent,
        AboutUsComponent,
        ContactComponent,
        BranchComponent,
        ForgotPasswordComponent,
        ConfirmAccountComponent,
        ProductsOnOfferComponent,
        FeaturedProductsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        MaterialModule,
        InfiniteScrollModule,
        NgImageSliderModule,
        AgGridModule,
        ShareButtonsModule.withConfig(customConfig),
        ComponentsModule,
        PipesModule,
        OnlineStoreRoutingModule,
        QuillModule,
        NgIdleKeepaliveModule.forRoot(),
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: LoadingScreenInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
    ],
    exports: []
})
export class OnlineStoreModule {
}
