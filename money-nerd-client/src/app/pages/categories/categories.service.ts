import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createNewCategory(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, payload, {
      withCredentials: true,
    });
  }

  getAllCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`, {
      withCredentials: true,
    });
  }
}
