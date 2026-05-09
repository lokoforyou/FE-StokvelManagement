import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Member, MemberStats, Payment } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-md-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold mb-0 text-brand">Welcome, {{ auth.member()?.fullName }}</h2>
            <p class="text-muted mb-0">
              Group: <span class="badge bg-primary rounded-pill">{{ stats()?.group?.name || 'No Group' }}</span>
              Role: <span class="badge bg-info rounded-pill">{{ auth.member()?.role || 'Member' }}</span>
            </p>
          </div>
          <div class="text-end">
             <div class="small text-muted">Join Date</div>
             <div class="fw-bold">{{ auth.member()?.createdAt | date:'mediumDate' }}</div>
          </div>
        </div>
      </div>

      <!-- Main Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 class="text-muted mb-1 small uppercase fw-bold">Total Verified</h6>
            <h3 class="fw-bold text-success">R {{ stats()?.totalContributions || 0 }}</h3>
            <div class="small text-muted">Verified lifetime funds</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 class="text-muted mb-1 small uppercase fw-bold">Yearly Progress</h6>
            <h3 class="fw-bold text-primary">R {{ stats()?.yearlyContributions || 0 }}</h3>
            <div class="progress mt-2" style="height: 6px;">
              <div class="progress-bar" [style.width.%]="getPercentLimit(stats()?.yearlyContributions, auth.member()?.yearlyTarget)"></div>
            </div>
            <div class="small text-muted mt-1">
              @if (getPercent(stats()?.yearlyContributions, auth.member()?.yearlyTarget) > 100) {
                <span class="text-success fw-bold">Exceeded by R {{ (stats()?.yearlyContributions ?? 0) - (auth.member()?.yearlyTarget ?? 0) }}</span>
              } @else {
                Goal: R {{ auth.member()?.yearlyTarget || 0 }}
              }
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 class="text-muted mb-1 small uppercase fw-bold">Monthly Status</h6>
            <h3 class="fw-bold text-dark">R {{ stats()?.monthlyVerified || 0 }}</h3>
            <div class="progress mt-2" style="height: 6px;">
              <div class="progress-bar bg-warning" [style.width.%]="getPercentLimit(stats()?.monthlyVerified, auth.member()?.monthlyTarget)"></div>
            </div>
            <div class="small text-muted mt-1">
              @if (getPercent(stats()?.monthlyVerified, auth.member()?.monthlyTarget) > 100) {
                <span class="text-warning fw-bold">Exceeded by R {{ (stats()?.monthlyVerified ?? 0) - (auth.member()?.monthlyTarget ?? 0) }}</span>
              } @else {
                Target: R {{ auth.member()?.monthlyTarget || 0 }}
              }
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 class="text-muted mb-1 small uppercase fw-bold">Total Pending</h6>
            <h3 class="fw-bold text-warning">R {{ stats()?.totalPending || 0 }}</h3>
            <div class="small text-muted">Awaiting verification</div>
          </div>
        </div>
      </div>

      <!-- Group Target Section -->
      @if (stats()?.group) {
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm p-4 bg-brand-light">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 fw-bold"><i class="bi bi-graph-up-arrow me-2 text-primary"></i>Group Performance: {{ stats()?.group?.name }}</h5>
              <span class="badge bg-white text-primary border border-primary">Pool: R {{ stats()?.group?.groupBalance }}</span>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3 mb-md-0">
                <div class="d-flex justify-content-between mb-1">
                  <span class="small fw-bold">Yearly Group Target</span>
                  <span class="small fw-bold">{{ getPercent(stats()?.group?.groupBalance, stats()?.group?.yearlyTarget) }}%</span>
                </div>
                <div class="progress bg-white" style="height: 12px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                       [style.width.%]="getPercentLimit(stats()?.group?.groupBalance, stats()?.group?.yearlyTarget)"></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                  <span class="small text-muted">
                    @if (getPercent(stats()?.group?.groupBalance, stats()?.group?.yearlyTarget) > 100) {
                      <span class="text-success fw-bold">Target exceeded by R {{ (stats()?.group?.groupBalance ?? 0) - (stats()?.group?.yearlyTarget ?? 0) }}</span>
                    } @else {
                      R {{ stats()?.group?.groupBalance }} raised
                    }
                  </span>
                  <span class="small text-muted">Goal: R {{ stats()?.group?.yearlyTarget }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex justify-content-between mb-1">
                  <span class="small fw-bold">Monthly Group Target</span>
                  <span class="small fw-bold">{{ getPercent(stats()?.groupMonthlyVerified, stats()?.group?.monthlyTarget) }}%</span>
                </div>
                <div class="progress bg-white" style="height: 12px;">
                  <div class="progress-bar bg-info" [style.width.%]="getPercentLimit(stats()?.groupMonthlyVerified, stats()?.group?.monthlyTarget)"></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                  <span class="small text-muted">
                    @if (getPercent(stats()?.groupMonthlyVerified, stats()?.group?.monthlyTarget) > 100) {
                      <span class="text-info fw-bold">Target exceeded by R {{ (stats()?.groupMonthlyVerified ?? 0) - (stats()?.group?.monthlyTarget ?? 0) }}</span>
                    } @else {
                      R {{ stats()?.groupMonthlyVerified || 0 }} this month
                    }
                  </span>
                  <span class="small text-muted">Goal: R {{ stats()?.group?.monthlyTarget }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      }

      @if (auth.member()?.role === 'Admin') {
        <div class="alert alert-info d-flex align-items-center mb-4 border-0 shadow-sm py-3">
          <i class="bi bi-shield-lock-fill me-3 fs-3"></i>
          <div>
            <div class="fw-bold">Administrator Panel Active</div>
            <div class="small text-secondary">You have elevated permissions for <strong>{{ stats()?.group?.name }}</strong>. Verifying member payments updates the group balance and progress bars.</div>
          </div>
        </div>
      }

      <!-- Recent Activity -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 border-0">
          <h5 class="mb-0 fw-bold">Recent Payments</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (p of recent(); track p.id) {
                  <tr>
                    <td>{{ p.paidAt | date:'shortDate' }}</td>
                    <td class="fw-bold text-dark">R {{ p.amount }}</td>
                    <td>{{ p.reference }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': p.status === 'verified',
                        'bg-warning': p.status === 'pending',
                        'bg-danger': p.status === 'rejected'
                      }">{{ p.status }}</span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-5 text-muted">
                       <i class="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                       No payments found
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-brand-light { background-color: #f0f7ff; }
    .text-brand { color: #0d6efd; }
    .uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  stats = signal<MemberStats | null>(null);
  recent = signal<Payment[]>([]);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.api.getMe().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.auth.setMember(res.member);
      },
    });
    this.api.listPayments().subscribe({
      next: (res) => {
        this.recent.set(res.payments.slice(0, 10));
      }
    });
  }

  getPercent(actual: number | undefined, target: number | undefined): number {
    if (!target || target <= 0) return 0;
    return Math.round(((actual || 0) / target) * 100);
  }

  getPercentLimit(actual: number | undefined, target: number | undefined): number {
    const p = this.getPercent(actual, target);
    return p > 100 ? 100 : p;
  }
}
