import {createReducer, on} from "@ngrx/store";
import {initialUserState} from "../state/user.state";
import {DeleteUser, SetBillingAddress, SetDeliveryAddress, SetPersonData} from "../actions/user.actions";

const _userReducer = createReducer(initialUserState,
    on(SetPersonData, (state, {personData}) => {
        return {
            ...state,
            personData
        }
    }),
    on(SetBillingAddress, (state, {billingAddress}) => {
        return {
            ...state,
            billingAddress
        }
    }),
    on(SetDeliveryAddress, (state, {deliveryAddress}) => {
        return {
            ...state,
            deliveryAddress
        }
    }),
    on(DeleteUser, () => initialUserState)
)

export function userReducer(state, action) {
    return _userReducer(state, action);
}