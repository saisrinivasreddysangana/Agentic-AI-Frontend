import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  signup(user: { username: string; email: string; password: string }): Observable<any> {
    console.log(`Sending signup request to: ${this.apiUrl}/api/auth/register`);
    return this.http.post(`${this.apiUrl}/api/auth/register`, user, { responseType: 'json' }).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    console.log(`Sending login request to: ${this.apiUrl}/api/auth/login`);
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials, { responseType: 'json' }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<any> {
    const token = this.tokenSubject.value;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/auth/profile`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message; // Use backend error message
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}