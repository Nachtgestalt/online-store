import {Component, OnInit} from '@angular/core';
import {IAppState, selectSetupState} from "../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {SetupInfoService} from "../../../../services/setup-info.service";
import {switchMap} from "rxjs/operators";
import {ISetupState} from "../../../../store/state/setup.state";
import {SetupInfo} from "../../../../models/setupInfo.interface";

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

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
