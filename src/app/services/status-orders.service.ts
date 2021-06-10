import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class StatusOrdersService {

    constructor(private http: HttpClient) {
    }

    saveStatusOrder(statusOrder, setupId) {
        return this.http.post(`${environment.BASE_URL}/status-orders/${setupId}`, statusOrder)
    }
}
