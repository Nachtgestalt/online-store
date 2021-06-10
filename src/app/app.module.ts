import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from "@angular/router";
import {APP_ROUTES} from "./app.routes";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {LoadingScreenInterceptor} from "./helpers/loading.interceptor";
import {ActionReducer, MetaReducer, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {appReducers} from "./store/reducers/app.reducers";
import {EffectsModule} from "@ngrx/effects";
import {LocalStorageEffects} from "./store/effects/localstorage.effects";
import {localStorageSync} from "ngrx-store-localstorage";
import {AuthEffects} from "./store/effects/auth.effects";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "./material.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgImageSliderModule} from "ng-image-slider";
import {AgGridModule} from "ag-grid-angular";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {ShareButtonsConfig} from "@ngx-share/core";
import {JwtInterceptor} from "./helpers/jwt.interceptor";
import {QuillModule} from "ngx-quill";

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({keys: ['cart', 'authState', 'user'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

const customConfig: ShareButtonsConfig = {
    autoSetMeta: true
};

@NgModule({
    declarations: [
        AppComponent,
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
        QuillModule.forRoot(),
        ShareButtonsModule.withConfig(customConfig),
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(appReducers, {metaReducers}),
        EffectsModule.forRoot([LocalStorageEffects, AuthEffects]),
        StoreDevtoolsModule.instrument({
            name: 'Onlinestore',
            maxAge: 25,
            logOnly: environment.production
        }),
        RouterModule.forRoot(APP_ROUTES)
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: LoadingScreenInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        // {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
    ],
    exports: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
