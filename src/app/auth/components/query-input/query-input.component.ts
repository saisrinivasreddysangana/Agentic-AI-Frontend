import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { PayrollService } from '../../service/payroll.service';  

@Component({
  selector: 'app-query-input',
  standalone: false,
  templateUrl: './query-input.component.html',
  styleUrls: ['./query-input.component.css']
})
export class QueryInputComponent implements OnInit {
  queryForm: FormGroup;
  isLoggedIn = false;
  isSubmitting = false;
  @Output() querySubmitted = new EventEmitter<string>();

  // Variables to handle payroll response
  response: any;
  payslipUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private payrollService: PayrollService  // Inject PayrollService
  ) {
    this.queryForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.authService.token$.subscribe(token => {
      this.isLoggedIn = !!token;
    });
  }

  // Updated onSubmit method to include payroll query handling
  onSubmit(): void {
    if (this.queryForm.valid) {
      this.isSubmitting = true;
      const query = this.queryForm.get('query')?.value;

      // Emit the query if needed by other components
      this.querySubmitted.emit(query);

      // Process the query for payroll-related information
      this.processQuery(query);

      // Reset the form after submitting
      this.queryForm.reset();
      Object.keys(this.queryForm.controls).forEach(key => {
        this.queryForm.get(key)?.setErrors(null);
      });

      this.isSubmitting = false;
    }
  }

  // Method to handle payroll-related and other types of queries
  processQuery(query: string): void {
    // If the query contains payroll-specific keywords, process it with the PayrollService
    if (query.toLowerCase().includes("earnings") || query.toLowerCase().includes("payslip")) {
      this.handlePayrollQuery(query);
    } else {
      // Handle other types of queries (e.g., non-payroll related queries)
      console.log("Handling non-payroll query:", query);
    }
  }

  // Method to handle payroll queries by interacting with PayrollService
  handlePayrollQuery(query: string): void {
    const employeeId = 'emp001'; // Example employee ID, replace with actual if needed

    // Call the PayrollService to fetch payroll explanation
    this.payrollService.getPayrollExplanation(employeeId, query).subscribe(
      (res) => {
        this.response = res; // Assign payroll explanation response
        if (res && res.payPeriod) {
          // If response includes a pay period, fetch the payslip
          this.getPayslip(res.payPeriod);
        }
      },
      (err) => {
        console.error('Error fetching payroll explanation:', err);
      }
    );
  }

  // Method to fetch payslip for a specific pay period
  getPayslip(payPeriod: string): void {
    const employeeId = 'emp001'; // Example employee ID, replace with actual if needed
    this.payrollService.getPayslip(employeeId, payPeriod).subscribe(
      (blob) => {
        const fileURL = URL.createObjectURL(blob);
        this.payslipUrl = fileURL;  // Set the URL for the downloaded payslip
      },
      (err) => {
        console.error('Error fetching payslip:', err);
      }
    );
  }
}
