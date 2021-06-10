import {createAction, props} from "@ngrx/store";
import {IProduct} from "../../models/product.interface";
import {Predicate} from "@ngrx/entity";

export enum ECartActions {
    SET_ITEM = '[Shopping cart] Set Item',
    MODIFIED_AMOUNT = '[Shopping cart] Modified amount Item',
    DELETE_ITEM = '[Shopping cart] Delete Item',
    DELETE_ITEMS = '[Shopping cart] Delete Items',
    EMPTY_CART = '[Shopping cart] Empty cart',
}

let predicate: Predicate<IProduct>

export const setItem = createAction(ECartActions.SET_ITEM, props<{ product: IProduct }>());
export const modifiedAmountItem = createAction(ECartActions.MODIFIED_AMOUNT, props<{ product: IProduct }>());
export const deleteItem = createAction(ECartActions.DELETE_ITEM, props<{ product: IProduct }>());
export const deleteItems = createAction(ECartActions.DELETE_ITEMS, props<{ ids: number[] }>());
export const emptyCart = createAction(ECartActions.EMPTY_CART);