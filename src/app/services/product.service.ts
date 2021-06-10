import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpBackend, HttpClient, HttpParams} from "@angular/common/http";
import {FileItem} from "../models/file-item";
import {map, shareReplay, withLatestFrom} from "rxjs/operators";
import {IProduct} from "../models/product.interface";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../store/state/app.state";
import {FilterTypeEnum} from "../models/filterType.enum";

const CACHE_SIZE = 1;

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private cache$: Observable<Array<IProduct>>;
    private httpWithoutInterceptor: HttpClient;
    private url_product = `${environment.BASE_URL}/product`;
    private getSetupState: Observable<any>;

    constructor(private http: HttpClient,
                private httpBackend: HttpBackend,
                private store: Store<IAppState>) {
        this.getSetupState = store.select(selectSetupState);
        this.httpWithoutInterceptor = new HttpClient(httpBackend);
    }

    getProduct(id: string, bodegaId: number, companyId: number) {
        let params = new HttpParams().append('bodegaId', `${bodegaId}`)
        params = params.append('companyId', `${companyId}`)
        const url = `${this.url_product}/find/${id}`
        return this.http.get(url, {params})
    }

    getProductsByName(name: string, companyId, bodegaId?, setupId?, priceId?, page?: number, limit?: number) {
        const url = `${this.url_product}/findByName`;
        let params = new HttpParams().append('name', name);
        params = params.append('companyId', `${companyId}`)
        params = params.append('bodegaId', `${bodegaId}`)
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);
        if (limit && page) {
            params = params.append('page', `${page}`)
            params = params.append('limit', `${limit}`)
        }
        return this.httpWithoutInterceptor.get(url, {params}).pipe(
            map((products: any) => {
                if (products.data) {
                    let data = products.data.filter(product => product.pvp > 0)
                    return {
                        ...products,
                        data
                    };
                } else {
                    return products.filter(product => product.pvp > 0);
                }
            })
        )
    }

    getSearchResults(name: string, companyId, bodegaId, setupId, priceId, page?: number, limit?: number, moreProducts?: boolean) {
        const url = `${this.url_product}/findByName`;
        let params = new HttpParams().append('name', name);
        params = params.append('companyId', `${companyId}`)
        params = params.append('bodegaId', `${bodegaId}`)
        params = params.append('page', `${page}`)
        params = params.append('limit', `${limit}`)
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);

        if (!moreProducts) {
            return this.http.get(url, {params}).pipe(
                map((products: any) => {
                    if (products.data) {
                        let data = products.data.filter(product => product.pvp > 0)
                        return {
                            ...products,
                            data
                        };
                    } else {
                        return products.filter(product => product.pvp > 0);
                    }
                })
            )
        } else {
            return this.httpWithoutInterceptor.get(url, {params}).pipe(
                map((products: any) => {
                    if (products.data) {
                        let data = products.data.filter(product => product.pvp > 0)
                        return {
                            ...products,
                            data
                        };
                    } else {
                        return products.filter(product => product.pvp > 0);
                    }
                })
            )
        }
    }

    getProducts(page: number, limit: number, filter: FilterTypeEnum, companyId: number, bodegaId: number, setupId, priceId) {
        let params = new HttpParams().append('page', `${page}`)
        params = params.append('limit', `${limit}`);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);
        if (filter) {
            params = params.append('filter', `${filter}`);
        }

        if (!this.cache$ || filter) {
            this.cache$ = this.http.get(this.url_product, {params})
                .pipe(
                    withLatestFrom(this.getSetupState),
                    map(([products, setup]: any) => {
                        products.data = products.data.filter(product => product.pvp > 0)
                        // if (setup.showOutOfStock !== 0) {
                        //     return products
                        // }
                        // products.data = products.data.filter(product => product.stock > 0);
                        return products;

                    }),
                    shareReplay(CACHE_SIZE)
                )
        }

        return this.cache$
    }

    getMoreProducts(page: number, limit: number, filter: FilterTypeEnum, companyId: number, bodegaId: number, setupId, priceId) {
        let params = new HttpParams().append('page', `${page}`)
        params = params.append('limit', `${limit}`);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);

        if (filter) {
            params = params.append('filter', `${filter}`);
        }

        return this.httpWithoutInterceptor.get(this.url_product, {params})
            .pipe(
                map((products: any) => {
                    products.data = products.data.filter(product => product.pvp > 0)
                    return products
                })
            )
    }

    getProductsOnOffer(page: string, limit: string, companyId, bodegaId, setupId, priceId) {
        const url = `${this.url_product}/on-offer`;
        let params = new HttpParams().append('page', page);
        params = params.append('limit', limit);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);
        return this.http.get(url, {params}).pipe(
            map((products: any) => {
                products.data = products.data.filter(product => product.pvp > 0)
                return products
            })
        );
    }

    getFeaturedProducts(page: string, limit: string, companyId, bodegaId, setupId, priceId) {
        const url = `${this.url_product}/featured`;
        let params = new HttpParams().append('page', page);
        params = params.append('limit', limit);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);
        return this.http.get(url, {params}).pipe(
            map((products: any) => {
                products.data = products.data.filter(product => product.pvp > 0)
                return products
            })
        );
    }


    getListProducts(page: number, limit: number, companyId: number, bodegaId: number, setupId, priceId) {
        let params = new HttpParams().append('page', `${page}`)
        params = params.append('limit', `${limit}`);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);


        return this.httpWithoutInterceptor.get(this.url_product, {params})
            .pipe(
                map((products: any) => {
                    products.data = products.data.filter(product => product.pvp > 0)
                    return products
                })
            )
    }


    getProductsAdmin(start: number, end: number, companyId: number, query?: string, typeFilter?: string) {
        const url = `${this.url_product}/admin-prod`
        let params = new HttpParams().append('start', `${start}`)
        params = params.append('end', `${end}`);
        params = params.append('companyId', `${companyId}`);
        if (query && typeFilter) {
            params = params.append('query', `${query}`);
            params = params.append('typeFilter', `${typeFilter}`);
        }
        return this.http.get(url, {params})
    }

    getProductsByCategory(page: string, limit: string, category, companyId, bodegaId, setupId, priceId) {
        const url = `${this.url_product}/category`;
        let params = new HttpParams().append('page', page);
        params = params.append('limit', limit);
        params = params.append('category', category);
        params = params.append('companyId', `${companyId}`);
        params = params.append('bodegaId', `${bodegaId}`);
        params = params.append('priceId', `${priceId}`);
        params = params.append('setupId', `${setupId}`);
        return this.http.get(url, {params}).pipe(
            map((products: any) => {
                products.data = products.data.filter(product => product.pvp > 0)
                return products
            })
        );
    }

    uploadPics(images: FileItem[], productData: any) {
        const formData = new FormData();
        for (const item of images) {
            formData.append('upload', item.archivo)
        }
        let params = new HttpParams().append('company_id', productData.company_id);
        params = params.append('product_id', productData.id);
        return this.http.post(this.url_product, formData, {params});
    }

    getFiles(productData: any) {
        const url = `${this.url_product}/files`
        let params = new HttpParams().append('company_id', productData.company_id);
        params = params.append('product_id', productData.id);
        return this.http.get(url, {params});
    }

    deleteFiles(files) {
        const url = `${this.url_product}/deleteFiles`
        return this.http.post(url, files);
    }

}
