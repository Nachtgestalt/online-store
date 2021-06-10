import {Injectable} from '@angular/core';
import {CanLoad, Route, Router, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {CategoryService} from "../services/category.service";
import {SetupService} from "../services/setup.service";
import {catchError, map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {IAppState} from "../store/state/app.state";
import {Store} from "@ngrx/store";
import {SetSetup} from "../store/actions/setup.actions";
import {ISetup} from "../models/setup.interface";

@Injectable({
    providedIn: 'root'
})
export class StoreGuard implements CanLoad {
    constructor(private setupService: SetupService,
                private categoryService: CategoryService,
                private http: HttpClient,
                private store: Store<IAppState>,
                private router: Router) {
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
        return this.http.get(`${environment.BASE_URL}/setup/company/${segments[0]}`)
            .pipe(
                map((setupCompany: ISetup) => {
                    if (setupCompany) {
                        this.store.dispatch(SetSetup({setup: setupCompany}))
                        return true
                    } else {
                        this.router.navigate(['/'])
                        return false
                    }
                }),
                catchError(() => this.router.navigate(['/']))
            )
    }

}
