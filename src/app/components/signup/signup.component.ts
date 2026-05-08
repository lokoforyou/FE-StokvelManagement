import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card auth-card">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <h3 class="mb-1">Join the Stokvel</h3>
                  <p class="text-muted mb-0">Create your membership account</p>
                </div>

                @if (error()) {
                  <div class="alert alert-danger py-2">{{ error() }}</div>
                }

                <form (ngSubmit)="submit()" #f="ngForm">
                  <div class="mb-3">
                    <label class="form-label">Full name</label>
                    <input type="text" class="form-control" name="fullName"
                           [(ngModel)]="fullName" required />
                  </div>
                  <div class="row">
                    <div class="col-sm-6 mb-3">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" name="email"
                             [(ngModel)]="email" required />
                    </div>
                    <div class="col-sm-6 mb-3">
                      <label class="form-label">Group Name</label>
                      <input type="text" class="form-control" name="groupName"
                             [(ngModel)]="groupName" placeholder="Leave empty if no group" />
                      <div class="form-text">If group exists, you join as Member. If not, you create it as Admin.</div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-6 mb-3">
                      <label class="form-label">Phone</label>
                      <input type="tel" class="form-control" name="phone"
                             [(ngModel)]="phone" />
                    </div>
                    <div class="col-sm-6 mb-3">
                      <label class="form-label">Monthly contribution (R)</label>
                      <input type="number" min="0" class="form-control" name="monthlyContribution"
                             [(ngModel)]="monthlyContribution" />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" name="password"
                           [(ngModel)]="password" required minlength="6" autocomplete="new-password" />
                    <div class="form-text">At least 6 characters.</div>
                  </div>

                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading() || f.invalid">      
                    @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                    Create account
                  </button>
                </form>

                <p class="text-center mt-4 mb-0 text-muted">
                  Already a member? <a routerLink="/login">Sign in</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = "";
  email = "";
  phone = "";
  groupName = "";
  monthlyContribution = 500;
  password = "";
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.fullName || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth
      .signup({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        phone: this.phone || undefined,
        monthlyContribution: Number(this.monthlyContribution) || 0,
        groupName: this.groupName || undefined
      } as any)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(["/dashboard"]);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.error || "Sign-up failed");
        },
      });
  }
}
