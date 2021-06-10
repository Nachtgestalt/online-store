import {createFeatureSelector, createReducer, on} from "@ngrx/store";
import {cartAdapter, ICartState, initialCartState} from "../state/cart.state";
import {deleteItem, deleteItems, emptyCart, modifiedAmountItem, setItem} from "../actions/cart.actions";
import {Update} from "@ngrx/entity";
import {IProduct} from "../../models/product.interface";

const _cartReducer = createReducer(initialCartState,
    on(setItem, (state, {product}) => {
        if (state.entities[product.id]) {
            const editProduct: Update<IProduct> = {
                id: product.id,
                changes: {
                    amount: state.entities[product.id].amount + product.amount
                }
            }
            return cartAdapter.updateOne(editProduct, state)
        } else {
            return cartAdapter.addOne(product, state)
        }
    }),
    on(modifiedAmountItem, (state, {product}) => {
        return cartAdapter.updateOne({id: product.id, changes: {amount: product.amount}}, state)
    }),
    on(deleteItem, (state, {product}) => {
        return cartAdapter.removeOne(product.id, state)
    }),
    on(deleteItems, (state, {ids}) => {
        return cartAdapter.removeMany(ids, state)
    }),
    on(emptyCart, state => {
        return cartAdapter.removeAll(state);
    })
)

export function cartReducers(state, action) {
    return _cartReducer(state, action);
}

export const getCartState = createFeatureSelector<ICartState>('cart');

export const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal
} = cartAdapter.getSelectors(getCartState);