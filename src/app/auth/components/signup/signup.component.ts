import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit {
  user = { username: '', email: '', password: '' };
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  signup() {
    if (!this.user.username || !this.user.email || !this.user.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isLoading = true;
    this.authService.signup(this.user).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}