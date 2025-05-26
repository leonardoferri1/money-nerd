import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, payload, {
      withCredentials: true,
    });
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<{ access_token: string }>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        switchMap((response) => {
          return new Observable<string>((observer) => {
            observer.next(response.access_token);
            observer.complete();
          });
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
        },
      });
  }
}
