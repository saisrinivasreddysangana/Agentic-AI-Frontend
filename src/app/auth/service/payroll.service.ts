import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  // Fetch payroll explanation for a query
  getPayrollExplanation(employeeId: string, question: string): Observable<any> {
    const requestBody = { employeeId, question };
    return this.http.post<any>(`${this.apiUrl}/api/query`, requestBody);
  }

  // Fetch payslip for a specific pay period
  getPayslip(employeeId: string, yearMonth: string): Observable<Blob> {
    const url = `${this.apiUrl}/api/payslip?employeeId=${employeeId}&yearMonth=${yearMonth}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
