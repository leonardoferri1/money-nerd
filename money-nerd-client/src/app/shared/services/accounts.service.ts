import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createNewAccount(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts`, payload, {
      withCredentials: true,
    });
  }

  getAllAccounts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/accounts`, {
      withCredentials: true,
    });
  }

  getAccountsDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/accounts/account-transactions`, {
      withCredentials: true,
    });
  }
}
