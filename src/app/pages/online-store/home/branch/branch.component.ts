import {Component, OnInit} from '@angular/core';
import {switchMap, take} from "rxjs/operators";
import {Observable} from "rxjs";
import {ISetupState} from "../../../../store/state/setup.state";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../../../../store/state/app.state";
import {SetupService} from "../../../../services/setup.service";

@Component({
    selector: 'app-branch',
    templateUrl: './branch.component.html',
    styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {
    getSetupState: Observable<any>
    branchs$: Observable<ISetupState[]>;

    constructor(private store: Store<IAppState>,
                private setupService: SetupService) {
        this.getSetupState = this.store.select(selectSetupState);
    }

    ngOnInit(): void {
        this.branchs$ = this.getSetupState.pipe(
            take(1),
            switchMap(setup => this.setupService.fetchBranch(setup.companyId))
        );
    }

}
