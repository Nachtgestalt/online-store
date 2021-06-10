import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageFormatterComponent} from "./image-formatter/image-formatter.component";
import {LoadingScreenComponent} from "./loading-screen/loading-screen.component";
import {ProductComponent} from "./product/product.component";
import {MaterialModule} from "../material.module";
import {RouterModule} from "@angular/router";
import {PipesModule} from "../pipes/pipes.module";
import {HomeHeaderComponent} from './home-header/home-header.component';
import {QuillModule} from "ngx-quill";
import {MatQuill} from "./mat-quill/mat-quill";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        ImageFormatterComponent,
        LoadingScreenComponent,
        ProductComponent,
        HomeHeaderComponent,
        MatQuill
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MaterialModule,
        RouterModule,
        PipesModule,
        QuillModule,
    ],
    exports: [
        ImageFormatterComponent,
        LoadingScreenComponent,
        ProductComponent,
        HomeHeaderComponent,
        MatQuill
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule {
}
