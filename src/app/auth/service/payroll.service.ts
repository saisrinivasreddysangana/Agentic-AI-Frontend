
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = environment.payrollApiUrl; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPayrollExplanation(employeeId: string, question: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('PayrollService: No authentication token available');
      return throwError(() => new Error('No authentication token available'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const requestBody = { employeeId, question };
    console.log('PayrollService: Sending request to /api/query', { employeeId, question, token: token.substring(0, 10) + '...' });
    return this.http.post<any>(`${this.apiUrl}/api/query`, requestBody, { headers }).pipe(
      catchError(this.handleError('getPayrollExplanation'))
    );
  }

  getPayslip(employeeId: string, yearMonth: string): Observable<Blob> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('PayrollService: No authentication token available for payslip request');
      return throwError(() => new Error('No authentication token available'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.apiUrl}/api/payslip?employeeId=${employeeId}&yearMonth=${yearMonth}`;
    console.log('PayrollService: Fetching payslip', { employeeId, yearMonth, url });
    return this.http.get(url, { headers, responseType: 'blob' }).pipe(
      catchError(this.handleError('getPayslip'))
    );
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = `PayrollService: Error in ${operation}`;
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        errorMessage = `Server-side error: ${error.status} - ${error.message}`;
        if (error.error?.message) {
          errorMessage += ` | Backend message: ${error.error.message}`;
        }
      }
      console.error(errorMessage, error);
      return throwError(() => new Error(errorMessage));
    };
  }
}