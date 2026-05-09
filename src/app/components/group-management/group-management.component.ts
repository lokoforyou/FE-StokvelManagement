import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <div class="row mb-4">
        <div class="col-md-12">
          <h2 class="fw-bold">Group Management</h2>
          <p class="text-muted">Configure group goals and manage your stokvel's performance.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="row">
          <div class="col-lg-8">
            <!-- Group Settings Card -->
            <div class="card border-0 shadow-sm p-4 mb-4">
              <h5 class="fw-bold mb-4 d-flex align-items-center">
                <i class="bi bi-gear-fill me-2 text-primary"></i>Group Settings
              </h5>

              @if (success()) {
                <div class="alert alert-success alert-dismissible fade show mb-4">
                  {{ success() }}
                  <button type="button" class="btn-close" (click)="success.set(null)"></button>
                </div>
              }

              <form (ngSubmit)="saveSettings()">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Stokvel Name</label>
                  <input type="text" class="form-control bg-light" [value]="groupName" disabled />
                  <div class="form-text">Group name cannot be changed.</div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Group Description</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="description" name="description"></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Monthly Group Target (R)</label>
                    <div class="input-group">
                      <span class="input-group-text">R</span>
                      <input type="number" class="form-control" [(ngModel)]="monthlyTarget" name="monthlyTarget" />
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Yearly Group Target (R)</label>
                    <div class="input-group">
                      <span class="input-group-text">R</span>
                      <input type="number" class="form-control" [(ngModel)]="yearlyTarget" name="yearlyTarget" />
                    </div>
                  </div>
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button type="submit" class="btn btn-primary px-4" [disabled]="saving()">
                    @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                    Save Group Settings
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Group Health Card -->
            <div class="card border-0 shadow-sm p-4 bg-primary text-white mb-4">
              <h5 class="fw-bold mb-3">Group Financials</h5>
              <div class="mb-4">
                <div class="small opacity-75 uppercase">Total Group Balance</div>
                <div class="h2 fw-bold">R {{ groupBalance }}</div>
              </div>
              <div class="mb-0">
                <div class="small opacity-75 uppercase">Monthly Progress</div>
                <div class="h4 fw-bold">{{ getPercent(monthlyVerified, monthlyTarget) }}%</div>
                <div class="progress bg-white bg-opacity-25 mt-2" style="height: 6px;">
                  <div class="progress-bar bg-white" [style.width.%]="getPercentLimit(monthlyVerified, monthlyTarget)"></div>
                </div>
              </div>
            </div>

            <!-- Quick Tips -->
            <div class="card border-0 shadow-sm p-4 bg-light">
              <h6 class="fw-bold mb-3">Admin Rules</h6>
              <ul class="small text-secondary ps-3">
                <li class="mb-2"><strong>Targets</strong> update the progress bars on all member dashboards.</li>
                <li class="mb-2">Keep the <strong>Description</strong> up to date with meeting schedules or rules.</li>
                <li>Verify all payments promptly to ensure the <strong>Group Balance</strong> is accurate.</li>
              </ul>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.uppercase { text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem; }`]
})
export class GroupManagementComponent implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  success = signal<string | null>(null);

  groupId: number = 0;
  groupName = "";
  description = "";
  monthlyTarget = 0;
  yearlyTarget = 0;
  groupBalance = 0;
  monthlyVerified = 0;

  ngOnInit(): void {
    this.api.getMe().subscribe(res => {
      if (res.stats?.group) {
        const g = res.stats.group;
        this.groupId = g.id;
        this.groupName = g.name;
        this.description = g.description || "";
        this.monthlyTarget = g.monthlyTarget || 0;
        this.yearlyTarget = g.yearlyTarget || 0;
        this.groupBalance = g.groupBalance || 0;
        this.monthlyVerified = res.stats.groupMonthlyVerified || 0;
      }
      this.loading.set(false);
    });
  }

  saveSettings(): void {
    this.saving.set(true);
    this.api.updateGroupSettings(this.groupId, {
      description: this.description,
      monthlyTarget: this.monthlyTarget,
      yearlyTarget: this.yearlyTarget
    }).subscribe({
      next: () => {
        this.success.set("Group settings updated successfully!");
        this.saving.set(false);
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => this.saving.set(false)
    });
  }

  getPercent(actual: number, target: number): number {
    if (!target || target <= 0) return 0;
    return Math.round((actual / target) * 100);
  }

  getPercentLimit(actual: number, target: number): number {
    const p = this.getPercent(actual, target);
    return p > 100 ? 100 : p;
  }
}
