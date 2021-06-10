import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PrivilegesService {

  constructor(private http: HttpClient) {
  }

  fetchPrivileges() {
    return this.http.get(`${environment.BASE_URL}/privileges`)
  }

  savePrivilege(privilege) {
    return this.http.post(`${environment.BASE_URL}/privileges`, privilege);
  }

  updatePrivilege(id, privilege) {
    return this.http.put(`${environment.BASE_URL}/privileges/${id}`, privilege);
  }

  deletePrivilege(id) {
    return this.http.delete(`${environment.BASE_URL}/privileges/${id}`);
  }
}
