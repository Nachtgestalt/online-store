import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ISetupState} from "../store/state/setup.state";

@Injectable({
    providedIn: 'root'
})
export class SetupService {

    constructor(private http: HttpClient) {
    }

    fetchSetups() {
        return this.http.get(`${environment.BASE_URL}/setup/company`)
    }

    fetchSetupCompany(name) {
        return this.http.get(`${environment.BASE_URL}/setup/company/${name}`)
    }

    saveSetupCompany(setup) {
        return this.http.post(`${environment.BASE_URL}/setup`, setup);
    }

    updateSetupCompany(id, setup) {
        return this.http.put(`${environment.BASE_URL}/setup/${id}`, setup);
    }

    changeStatusSetupCompany(id, status) {
        let params = new HttpParams().append('status', status)
        return this.http.delete(`${environment.BASE_URL}/setup/${id}`, {params});
    }

    fetchPayTypes(setupId) {
        let params = new HttpParams().append('setupId', setupId)
        return this.http.get(`${environment.BASE_URL}/setup/pay-types`, {params})
    }

    toggleStatusPayType(id, status) {
        let params = new HttpParams().append('status', status)
        return this.http.delete(`${environment.BASE_URL}/setup/pay-types/${id}`, {params});
    }

    fetchBranch(companyId) {
        return this.http.get<ISetupState[]>(`${environment.BASE_URL}/setup/branch/${companyId}`);
    }

    fetchPriceTypes(companyId) {
        return this.http.get(`${environment.BASE_URL}/setup/price-types/${companyId}`);
    }
}
