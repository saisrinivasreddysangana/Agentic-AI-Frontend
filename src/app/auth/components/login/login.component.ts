import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}