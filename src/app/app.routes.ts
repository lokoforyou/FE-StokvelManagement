import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { ShellComponent } from './components/shell/shell.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { ProfileComponent } from './components/profile/profile.component';
// import { authGuard, guestGuard } from "./guards/auth.guard";

import { MemberManagementComponent } from './components/member-management/member-management.component';

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "signup", component: SignupComponent, canActivate: [guestGuard] },
  {
    path: "",
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      { path: "dashboard", component: DashboardComponent },
      { path: "payments", component: PaymentsComponent },
      { path: "profile", component: ProfileComponent },
      { path: "member-management", component: MemberManagementComponent },
    ],
  },
  { path: "**", redirectTo: "" },
];
