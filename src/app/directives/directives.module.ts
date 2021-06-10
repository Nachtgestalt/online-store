import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgDropFilesDirective} from "./ng-drop-files.directive";


@NgModule({
    declarations: [
        NgDropFilesDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NgDropFilesDirective
    ]
})
export class DirectivesModule {
}
