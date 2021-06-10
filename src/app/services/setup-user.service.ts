import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SetupUserService {

  constructor(private http: HttpClient) {
  }

  fetchSetups(setupId) {
    return this.http.get(`${environment.BASE_URL}/setup-user/company/${setupId}`)
        .pipe(
            map((setupUsers: Array<any>) => {
              return setupUsers.map(setupUser => {
                let {users} = setupUser;
                let {personData} = users;
                return {
                  ...setupUser,
                  emailCol: users.email
                }
              })
            })
        )
  }

  fetchSetupUser(id) {
    return this.http.get(`${environment.BASE_URL}/setup-user/company/${name}`)
  }

  saveSetupUser(setup) {
    return this.http.post(`${environment.BASE_URL}/setup-user`, setup);
  }

  updateSetupUser(id, setup, setupId) {
    return this.http.put(`${environment.BASE_URL}/setup-user/${setupId}/${id}`, setup);
  }

  changeStatusSetupUser(id, status, setupId) {
    let params = new HttpParams().append('status', status)
    return this.http.delete(`${environment.BASE_URL}/setup-user/${setupId}/${id}`, {params});
  }

  changeShowStock(id, showStock, setupId) {
    let params = new HttpParams().append('showStock', showStock)
    return this.http.get(`${environment.BASE_URL}/setup-user/showStock/${setupId}/${id}`, {params});
  }

  savePrivileges(body, setupUserId, setupId) {
    return this.http.post(`${environment.BASE_URL}/setup-user/privileges/${setupId}/${setupUserId}`, body)
  }
}
