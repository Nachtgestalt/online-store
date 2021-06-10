import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {SetupInfo} from "../../../../models/setupInfo.interface";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../../../../store/state/app.state";
import {SetupInfoService} from "../../../../services/setup-info.service";
import {switchMap} from "rxjs/operators";
import {ISetupState} from "../../../../store/state/setup.state";

@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

    getSetupState: Observable<any>;
    setupInfo$: Observable<SetupInfo>;

    constructor(private store: Store<IAppState>,
                private setupInfoService: SetupInfoService) {
        this.getSetupState = store.select(selectSetupState);
    }

    ngOnInit(): void {
        this.setupInfo$ = this.getSetupState.pipe(
            switchMap((setup: ISetupState) => this.setupInfoService.fetchSetupInfo(setup.id))
        );
    }

}
