import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';


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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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

  onSubmit(): void {
    if (this.queryForm.valid) {
      this.isSubmitting = true;
      const query = this.queryForm.get('query')?.value;
      this.querySubmitted.emit(query);
      this.queryForm.reset();
      Object.keys(this.queryForm.controls).forEach(key => {
        this.queryForm.get(key)?.setErrors(null);
      });
      this.isSubmitting = false;
    }
  }
}