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

  updateTransaction(id: string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/transactions/${id}`, payload, {
      withCredentials: true,
    });
  }

  getRecurringTransactions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions/recurring`, {
      withCredentials: true,
    });
  }

  getAllTransactions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions`, {
      withCredentials: true,
    });
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/transactions/${id}`, {
      withCredentials: true,
    });
  }

  getTransactionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions/${id}`, {
      withCredentials: true,
    });
  }
}
