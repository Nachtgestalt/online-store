import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class DirectoryService {

    constructor(private http: HttpClient) {
    }

    fetchDirectory(setupId) {
        return this.http.get(`${environment.BASE_URL}/directory/${setupId}`);
    }

    saveRegistry(registry) {
        return this.http.post(`${environment.BASE_URL}/directory`, registry);
    }

    changeStatus(registryId) {
        return this.http.delete(`${environment.BASE_URL}/directory/${registryId}`);
    }
}
