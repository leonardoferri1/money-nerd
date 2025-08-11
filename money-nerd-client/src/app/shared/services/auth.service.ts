import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { SnackbarService } from '../components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private snackBar: SnackbarService,
    private router: Router,
    private translate: TranslateService
  ) {}

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
        next: (response: any) => {
          if (response.message == 'Logged out successfully.') {
            this.snackBar.openSuccessSnackbar(
              this.translate.instant('LOGGED_OUT')
            );
          }
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
        },
      });
  }
}
