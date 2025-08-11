import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  emailVerify(email: string | null, code: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/auth/verify-email`,
      { email: email, code: code },
      {
        withCredentials: true,
      }
    );
  }

  resendEmail(email: string | null): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/users/resend-email`,
      { email },
      {
        withCredentials: true,
      }
    );
  }
}
