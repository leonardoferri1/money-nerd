import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    const params = new HttpParams()
      .set('year', payload.year.toString())
      .set('accountId', payload.accountId ?? '');

    return this.http.get<any>(`${this.apiUrl}/transactions/summary`, {
      withCredentials: true,
      params,
    });
  }
}
