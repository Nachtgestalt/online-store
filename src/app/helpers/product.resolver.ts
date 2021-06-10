import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ProductService} from "../services/product.service";
import {catchError} from "rxjs/operators";
import {empty} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProductResolver implements Resolve<any> {
    constructor(private productService: ProductService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.productService.getProducts(1, 25).pipe(
            catchError(() => {
                return empty();
            })
        );
    }
}
