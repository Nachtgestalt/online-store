import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../../store/state/app.state";
import {switchMap, take} from "rxjs/operators";
import {SetupService} from "../../services/setup.service";
import {DirectoryService} from "../../services/directory.service";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-home-header',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {
    @Input()
    setup;

    @Input()
    category;

    branch$: Observable<any>;
    getSetupState: Observable<any>;
    directory$: Observable<any>;

    constructor(private store: Store<IAppState>,
                private setupService: SetupService,
                private directoryService: DirectoryService,
                private http: HttpClient) {
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        this.branch$ = this.getSetupState.pipe(
            take(1),
            switchMap(setup => this.setupService.fetchBranch(setup.companyId))
        )

        this.directory$ = this.getSetupState.pipe(
            take(1),
            switchMap(setup => this.directoryService.fetchDirectory(setup.id))
        )
    }

    redirectToStore(branch) {
        let getUrl = window.location.origin;
        window.location.replace(`${getUrl}/${branch.companyAccount}`);
        // this.router.navigate([`/${branch.companyAccount}`])
    }

    sendWhats(registry) {
        let {whatsappNumber, countryCode} = registry;
        window.open(`https://api.whatsapp.com/send?phone=${countryCode}${whatsappNumber}`);

    }

}
