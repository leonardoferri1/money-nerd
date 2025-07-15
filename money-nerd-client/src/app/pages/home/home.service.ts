import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExpenseCategorySummary } from '../../shared/components/category-summary/category-summary.type';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/me`, {
      withCredentials: true,
    });
  }

  getYearlySummary(payload: {
    year: number;
    accountId?: string;
  }): Observable<any> {
    const params = new HttpParams().set('year', payload.year.toString());

    return this.http.get<any>(`${this.apiUrl}/transactions/yearly-summary`, {
      withCredentials: true,
      params,
    });
  }

  getGrowthSummary(payload: {
    year: number;
    accountId?: string;
  }): Observable<any> {
    const params = new HttpParams().set('year', payload.year.toString());

    return this.http.get<any>(
      `${this.apiUrl}/transactions/wealth-growth-summary`,
      {
        withCredentials: true,
        params,
      }
    );
  }

  getExpenseSummary(
    year?: number,
    month?: number
  ): Observable<ExpenseCategorySummary[]> {
    let params = new HttpParams();

    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }

    return this.http.get<ExpenseCategorySummary[]>(
      `${this.apiUrl}/categories/summary`,
      {
        withCredentials: true,
        params,
      }
    );
  }
}
