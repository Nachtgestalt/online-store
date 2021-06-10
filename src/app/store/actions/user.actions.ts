import {createAction, props} from "@ngrx/store";
import {IPersonData} from "../../models/person-data.interface";
import {IAddress} from "../../models/address.interface";

export enum EUserActions {
    SET_PERSON_DATA = '[User] Set persona data',
    SET_BILLING_ADDRESS = '[User] Set billing address',
    SET_DELIVERY_ADDRESS = '[User] Set delivery address',
    DELETE_USER = '[User] Delete user'
}

export const SetPersonData = createAction(EUserActions.SET_PERSON_DATA, props<{ personData: IPersonData }>());
export const SetBillingAddress = createAction(EUserActions.SET_BILLING_ADDRESS, props<{ billingAddress: IAddress }>());
export const SetDeliveryAddress = createAction(EUserActions.SET_DELIVERY_ADDRESS, props<{ deliveryAddress: IAddress }>());
export const DeleteUser = createAction(EUserActions.DELETE_USER);