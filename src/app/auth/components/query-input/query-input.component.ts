
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { PayrollService } from '../../service/payroll.service';


@Component({
  selector: 'app-query-input',
  templateUrl: './query-input.component.html',
  styleUrls: ['./query-input.component.css'],
  standalone: false,
})
export class QueryInputComponent implements OnInit {
  queryForm: FormGroup;
  isLoggedIn = false;
  isSubmitting = false;
  @Output() querySubmitted = new EventEmitter<{ query: string, response?: any, payslipUrl?: string }>();
  response: any;
  payslipUrl: string = '';
  employeeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private payrollService: PayrollService
  ) {
    this.queryForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.authService.token$.subscribe(token => {
      this.isLoggedIn = !!token;
      if (token) {
        console.log('QueryInputComponent: User logged in, fetching profile');
        this.authService.getProfile().subscribe({
          next: (profile) => {
            this.employeeId = profile.id;
            if (!this.employeeId) {
              console.warn('QueryInputComponent: Profile does not contain id, using fallback');
              this.employeeId = 1;
            }
            console.log('QueryInputComponent: Employee ID set to', this.employeeId);
          },
          error: (err) => {
            console.error('QueryInputComponent: Error fetching profile:', err);
            this.employeeId = 1;
            console.log('QueryInputComponent: Using fallback employeeId:', this.employeeId);
          }
        });
      } else {
        console.log('QueryInputComponent: User not logged in');
      }
    });
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      this.isSubmitting = true;
      const query = this.queryForm.get('query')?.value;
      console.log('QueryInputComponent: Submitting query:', query);
      this.querySubmitted.emit({ query });
      this.processQuery(query);
      this.queryForm.reset();
      Object.keys(this.queryForm.controls).forEach(key => {
        this.queryForm.get(key)?.setErrors(null);
      });
      this.isSubmitting = false;
    } else {
      console.log('QueryInputComponent: Form invalid', this.queryForm.errors);
    }
  }

  processQuery(query: string): void {
    if (!this.employeeId) {
      console.error('QueryInputComponent: No employeeId available');
      this.querySubmitted.emit({
        query,
        response: { explanation: 'Unable to process payroll query: User ID not found in profile.' }
      });
      return;
    }

    if (query.toLowerCase().includes('earnings') || query.toLowerCase().includes('payslip') || query.toLowerCase().includes('pay') || query.toLowerCase().includes('tax')) {
      console.log('QueryInputComponent: Processing payroll query');
      this.handlePayrollQuery(query);
    } else {
      console.log('QueryInputComponent: Non-payroll query detected');
      this.querySubmitted.emit({
        query,
        response: { explanation: 'Sorry, I can only assist with payroll-related questions at this time.' }
      });
    }
  }

  handlePayrollQuery(query: string): void {
    console.log('QueryInputComponent: Calling PayrollService for query:', query, 'with employeeId:', this.employeeId);
    this.payrollService.getPayrollExplanation(this.employeeId!.toString(), query).subscribe({
      next: (res) => {
        console.log('QueryInputComponent: Received payroll response:', res);
        this.response = res;
        this.querySubmitted.emit({ query, response: res });
        if (res?.payPeriod) {
          console.log('QueryInputComponent: Pay period found, fetching payslip for:', res.payPeriod);
          this.getPayslip(res.payPeriod);
        }
      },
      error: (err) => {
        console.error('QueryInputComponent: Error in payroll query:', err.message);
        this.querySubmitted.emit({
          query,
          response: { explanation: `Failed to fetch payroll information: ${err.message}` }
        });
      }
    });
  }

  getPayslip(payPeriod: string): void {
    console.log('QueryInputComponent: Fetching payslip for employeeId:', this.employeeId, 'and payPeriod:', payPeriod);
    this.payrollService.getPayslip(this.employeeId!.toString(), payPeriod).subscribe({
      next: (blob) => {
        console.log('QueryInputComponent: Payslip blob received');
        const fileURL = URL.createObjectURL(blob);
        this.payslipUrl = fileURL;
        this.querySubmitted.emit({ query: '', response: this.response, payslipUrl: fileURL });
      },
      error: (err) => {
        console.error('QueryInputComponent: Error fetching payslip:', err.message);
        this.querySubmitted.emit({
          query: '',
          response: { explanation: `Failed to fetch payslip: ${err.message}` }
        });
      }
    });
  }
}