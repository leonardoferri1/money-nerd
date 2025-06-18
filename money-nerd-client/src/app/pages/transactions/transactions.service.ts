import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createNewTransaction(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transactions`, payload, {
      withCredentials: true,
    });
  }

  getAllTransactions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions`, {
      withCredentials: true,
    });
  }
}
