import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TypeStatusOrdersService {

    constructor(private http: HttpClient) {
    }

    fetchTypeStatusOrders(setupId) {
        return this.http.get(`${environment.BASE_URL}/type-status-orders/${setupId}`);
    }

    saveTypeStatusOrders(statusOrder, setupId) {
        return this.http.post(`${environment.BASE_URL}/type-status-orders/${setupId}`, statusOrder);
    }

    toggleStatusTypeStatusOrders(id, status, setupId) {
        let params = new HttpParams().append('status', status)
        return this.http.delete(`${environment.BASE_URL}/type-status-orders/${setupId}/${id}`, {params});
    }
}
