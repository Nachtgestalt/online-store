import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LoadingScreenService} from "../../services/loading-screen.service";

@Component({
    selector: 'app-loading-screen',
    templateUrl: './loading-screen.component.html',
    styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {
    // isLoading: Subject<boolean> = this.loaderService.isLoading;
    isLoading: boolean

    constructor(private loaderService: LoadingScreenService,
                private cdRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.loaderService.isLoading.subscribe((v) => {
            this.isLoading = v;
            this.cdRef.detectChanges();
        })
    }
}
