import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private url_category = `${environment.BASE_URL}/category`;

  constructor(private http: HttpClient) {
  }

  getCategories(companyId) {
    return this.http.get(`${this.url_category}/${companyId}`);
  }
}
