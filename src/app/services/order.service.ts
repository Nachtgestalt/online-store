import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {FileItem} from "../models/file-item";
import {IPaginator} from "../models/paginator.interface";

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    constructor(private http: HttpClient) {
    }

    registerOrder(user, order, products) {
        let body = {
            user,
            order,
            products
        }
        console.log(body);
        return this.http.post(`${environment.BASE_URL}/order`, body);
    }

    fetchOrder(id) {
        return this.http.get(`${environment.BASE_URL}/order/${id}`)
    }

    fetchOrders(userId, paginator: IPaginator, query?: string, typeFilter?: string) {
        let params = new HttpParams().append('start', `${paginator.start}`)
        params = params.append('end', `${paginator.end}`);
        if (query && typeFilter) {
            params = params.append('query', `${query}`);
            params = params.append('typeFilter', `${typeFilter}`);
        }
        return this.http.get(`${environment.BASE_URL}/order/user/${userId}`, {params});
    }

    fetchOrdersByCompany(setupId: number, paginator: IPaginator, query?, typeFilter?) {
        let params = new HttpParams().append('start', `${paginator.start}`)
        params = params.append('end', `${paginator.end}`);
        if (query && typeFilter) {
            params = params.append('query', `${query}`);
            params = params.append('typeFilter', `${typeFilter}`);
        }
        return this.http.get(`${environment.BASE_URL}/order/company/${setupId}`, {params});
    }

    getOrderReport(orderId) {
        let headers = new HttpHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return this.http.get<Blob>(`${environment.BASE_URL}/reports/order/${orderId}`, {
            observe: 'response',
            responseType: 'blob' as 'json',
            headers
        });
    }

    getPics(orderData) {
        let params = new HttpParams().append('companyId', orderData.companyId);
        params = params.append('orderId', orderData.orderId);
        return this.http.get<Array<any>>(`${environment.BASE_URL}/order/files`, {params});
    }

    uploadPics(images: FileItem[], orderData: any) {
        const formData = new FormData();
        for (const item of images) {
            formData.append('upload', item.archivo)
        }
        let params = new HttpParams().append('companyId', orderData.companyId);
        params = params.append('orderId', orderData.orderId);
        return this.http.post(`${environment.BASE_URL}/order/files`, formData, {params});
    }

    deleteFiles(files) {
        const url = `${environment.BASE_URL}/order/files/deleteFiles`
        return this.http.post(url, files);
    }

    togglePayStatus(orderWithPayRevision) {
        return this.http.put(`${environment.BASE_URL}/order/pay-status`, orderWithPayRevision)
    }
}
