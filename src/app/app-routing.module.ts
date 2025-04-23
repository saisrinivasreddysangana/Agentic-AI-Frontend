import { inject, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { SignupComponent } from './auth/components/signup/signup.component';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth/service/auth.service';
import { DashboardComponent } from './auth/components/dashboard/dashboard.component';

const canActivateDashboard: CanActivateFn = (route, state) => {
  return inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [canActivateDashboard] },
  { path: 'query', component: DashboardComponent, canActivate: [canActivateDashboard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }