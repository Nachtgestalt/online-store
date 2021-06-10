import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BankAccountsService {

  constructor(private http: HttpClient) {
  }

  fetchBankAccounts(setupId) {
    return this.http.get(`${environment.BASE_URL}/bank-accounts/${setupId}`);
  }

  saveBankAccount(bankAccount, setupId) {
    return this.http.post(`${environment.BASE_URL}/bank-accounts/${setupId}`, bankAccount);
  }

  updateBankAccount(bankAccount, setupId) {
    return this.http.put(`${environment.BASE_URL}/bank-accounts/${setupId}`, bankAccount);
  }

  toggleStatus(bankAccount, setupId) {
    return this.http.put(`${environment.BASE_URL}/bank-accounts/${setupId}/status`, bankAccount);
  }
}
