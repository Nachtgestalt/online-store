import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PayTypeService {

  constructor(private http: HttpClient) {
  }

  fetchPayTypes(setupId) {
    return this.http.get(`${environment.BASE_URL}/pay-type/${setupId}`);
  }
}
