import {Component, OnInit} from '@angular/core';
import {IAppState, selectSetupState} from "../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {ScrollContentService} from "../../../services/scroll-content.service";
import {ISetupState} from "../../../store/state/setup.state";
import {Observable} from "rxjs";
import {SetupService} from "../../../services/setup.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    setup: ISetupState
    routeLinks: any[];

    getSetupState: Observable<any>;

    constructor(private store: Store<IAppState>,
                private router: Router,
                private scrollContentService: ScrollContentService,
                private setupService: SetupService) {
        this.routeLinks = [
            {
                label: 'Nuestros Productos',
                link: './products',
                index: 0
            },
            {
                label: '¿Quienes somos?',
                link: './about-us',
                index: 1
            },
            {
                label: 'Contactos',
                link: './contact',
                index: 1
            },
            {
                label: 'Sucursales',
                link: './branch',
                index: 1
            }
        ];
    }

    ngOnInit() {
        this.getSetupState = this.store.select(selectSetupState);
    }


    onScroll() {
        this.scrollContentService.announceScroll('scrolled');
    }
}
