import {IProduct} from "../../models/product.interface";
import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";

export interface ICartState extends EntityState<IProduct> {
}

export const cartAdapter: EntityAdapter<IProduct> = createEntityAdapter<IProduct>()

export const initialCartState: ICartState = cartAdapter.getInitialState();