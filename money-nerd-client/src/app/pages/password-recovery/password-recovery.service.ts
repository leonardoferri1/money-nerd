import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PasswordRecoveryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendPasswordResetEmail(email: string | null): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/users/password-reminder`,
      { email },
      {
        withCredentials: true,
      }
    );
  }

  passwordReset(
    email: string | null,
    code: string,
    newPassword: string | null
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/users/password-reset`,
      {
        email,
        code,
        newPassword,
      },
      {
        withCredentials: true,
      }
    );
  }
}
