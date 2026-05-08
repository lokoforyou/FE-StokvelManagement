import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-5">
            <div class="card auth-card">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <div class="d-inline-flex align-items-center justify-content-center mb-3"
                       style="width:60px;height:60px;border-radius:50%;background:var(--brand-primary);color:#fff;font-size:28px;">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <h3 class="mb-1">Welcome back</h3>
                  <p class="text-muted mb-0">Sign in to your Stokvel account</p>
                </div>

                @if (error()) {
                  <div class="alert alert-danger py-2">{{ error() }}</div>
                }

                <form (ngSubmit)="submit()" #f="ngForm">
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email"
                           [(ngModel)]="email" required autocomplete="email" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" name="password"
                           [(ngModel)]="password" required autocomplete="current-password" />
                  </div>
                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading() || f.invalid">
                    @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                    Sign in
                  </button>
                </form>

                <p class="text-center mt-4 mb-0 text-muted">
                  Don't have an account? <a routerLink="/signup">Create one</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = "";
  password = "";
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || "Login failed");
      },
    });
  }
}
