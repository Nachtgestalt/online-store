import {IPersonData} from "../../models/person-data.interface";
import {IAddress} from "../../models/address.interface";

export interface IUserState {
    personData: IPersonData;
    billingAddress: IAddress;
    deliveryAddress: IAddress;
}

export const initialUserState: IUserState = {
    personData: null,
    billingAddress: null,
    deliveryAddress: null
}