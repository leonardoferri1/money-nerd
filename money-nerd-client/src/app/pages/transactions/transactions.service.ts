import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionFilters } from './transaction-filters.model';

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

  getTransactions(filters?: TransactionFilters): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/transactions`, {
      params,
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
