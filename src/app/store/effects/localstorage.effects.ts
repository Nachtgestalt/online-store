import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {setItem} from "../actions/cart.actions";
import {tap, withLatestFrom} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {IAppState} from "../state/app.state";
import {SetBillingAddress, SetDeliveryAddress, SetPersonData} from "../actions/user.actions";

@Injectable()
export class LocalStorageEffects {
    @Effect({dispatch: false})
    storeActions = this.actions$.pipe(
        ofType(setItem),
        withLatestFrom(this.store$.select(state => state.cart)),
        tap((data: any) => {
            localStorage.setItem('cart', JSON.stringify(data[1]))
        })
    );

    @Effect({dispatch: false})
    personData = this.actions$.pipe(
        ofType(SetPersonData, SetBillingAddress, SetDeliveryAddress),
        withLatestFrom(this.store$.select(state => state.user)),
        tap((data: any) => {
            localStorage.setItem('user', JSON.stringify(data[1]))
        })
    );

    constructor(private actions$: Actions,
                private store$: Store<IAppState>) {
    }
}