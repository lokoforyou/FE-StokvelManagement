import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Payment } from '../../models/types';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <div class="row mb-4">
        <div class="col-md-12">
          <h2 class="fw-bold">Payments</h2>
          <p class="text-muted">Manage your contributions and track group funds.</p>
        </div>
      </div>

      <div class="row">
        <!-- Payment Form -->
        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0">Make a Contribution</h5>
            </div>
            <div class="card-body">
              @if (success()) {
                <div class="alert alert-success alert-dismissible fade show">
                  {{ success() }}
                  <button type="button" class="btn-close" (click)="success.set(null)"></button>
                </div>
              }
              @if (error()) {
                <div class="alert alert-danger alert-dismissible fade show">
                  {{ error() }}
                  <button type="button" class="btn-close" (click)="error.set(null)"></button>
                </div>
              }

              <form (ngSubmit)="submit()" #f="ngForm">
                <div class="mb-3">
                  <label class="form-label">Amount (R)</label>
                  <input type="number" class="form-control" name="amount" [(ngModel)]="amount" required min="1" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Reference</label>
                  <input type="text" class="form-control" name="reference" [(ngModel)]="reference" placeholder="e.g. Jan Contribution" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Payment Method</label>
                  <select class="form-select" name="method" [(ngModel)]="method" required>
                    <option value="EFT">EFT / Online</option>
                    <option value="Cash">Cash / Direct Pay</option>
                  </select>
                </div>

                @if (method === 'Cash') {
                  <div class="mb-3">
                    <label class="form-label">Proof of Payment</label>
                    <input type="file" class="form-control" (change)="onFileChange($event)" required />
                    <div class="form-text">Required for Cash or Direct Pay.</div>
                  </div>
                }

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading() || f.invalid || (method === 'Cash' && !proofFile)">
                  @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                  Submit Payment
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-2">
              <ul class="nav nav-tabs card-header-tabs border-0">
                <li class="nav-item">
                  <button class="nav-link border-0 fw-bold py-3" [class.active]="view() === 'personal'" (click)="view.set('personal')">
                    My Payments
                  </button>
                </li>
                @if (auth.member()?.role === 'Admin') {
                <li class="nav-item">
                  <button class="nav-link border-0 fw-bold py-3" [class.active]="view() === 'group'" (click)="view.set('group')">
                    Group Payments
                  </button>
                </li>
                }
              </ul>
            </div>

            <!-- Filters -->
            <div class="card-body border-bottom bg-light bg-opacity-10 p-3">
              <div class="row g-2 align-items-end">
                <div class="col-md-2">
                  <label class="small fw-bold text-muted mb-1">Status</label>
                  <select class="form-select form-select-sm" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div class="col-md-1">
                  <label class="small fw-bold text-muted mb-1">Day</label>
                  <select class="form-select form-select-sm" [ngModel]="dayFilter()" (ngModelChange)="dayFilter.set($event)">
                    <option [ngValue]="null">Any</option>
                    @for (d of days; track d) { <option [ngValue]="d">{{ d }}</option> }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="small fw-bold text-muted mb-1">Month</label>
                  <select class="form-select form-select-sm" [ngModel]="monthFilter()" (ngModelChange)="monthFilter.set($event)">
                    <option [ngValue]="null">Any Month</option>
                    @for (m of months; track m.value) { <option [ngValue]="m.value">{{ m.label }}</option> }
                  </select>
                </div>
                <div class="col-md-1">
                  <label class="small fw-bold text-muted mb-1">Year</label>
                  <select class="form-select form-select-sm" [ngModel]="yearFilter()" (ngModelChange)="yearFilter.set($event)">
                    <option [ngValue]="null">Any</option>
                    @for (y of years(); track y) { <option [ngValue]="y">{{ y }}</option> }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="small fw-bold text-muted mb-1">Amount Range (R)</label>
                  <div class="input-group input-group-sm">
                    <input type="number" class="form-control" placeholder="Min" [ngModel]="minAmount()" (ngModelChange)="minAmount.set($event)">
                    <input type="number" class="form-control" placeholder="Max" [ngModel]="maxAmount()" (ngModelChange)="maxAmount.set($event)">
                  </div>
                </div>
                <div class="col-md-2">
                   <label class="small fw-bold text-muted mb-1">Sort By</label>
                   <div class="d-flex gap-1">
                      <select class="form-select form-select-sm" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                      </select>
                      <button class="btn btn-sm btn-outline-secondary" (click)="sortOrder.set(sortOrder() === 'asc' ? 'desc' : 'asc')">
                        <i class="bi" [class.bi-sort-up]="sortOrder() === 'asc'" [class.bi-sort-down]="sortOrder() === 'desc'"></i>
                      </button>
                   </div>
                </div>
                <div class="col-md-1 text-end">
                  <button class="btn btn-sm btn-link text-decoration-none p-0" (click)="resetFilters()">Reset</button>
                </div>
              </div>
            </div>
            
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">Date</th>
                      @if (view() === 'group') { <th>Payer</th> }
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th class="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of filteredPayments(); track p.id) {
                      <tr>
                        <td class="ps-3">
                           <div class="fw-bold">{{ p.paidAt | date:'shortDate' }}</div>
                           <div class="small text-muted">{{ p.reference }}</div>
                        </td>
                        @if (view() === 'group') { 
                          <td><span class="badge bg-light text-dark border">{{ p.userName }}</span></td> 
                        }
                        <td>R {{ p.amount }}</td>
                        <td><small class="text-muted">{{ p.method }}</small></td>
                        <td>
                          <span class="badge rounded-pill" [ngClass]="{
                            'bg-success-subtle text-success': p.status === 'verified',
                            'bg-warning-subtle text-warning': p.status === 'pending',
                            'bg-danger-subtle text-danger': p.status === 'rejected'
                          }">{{ p.status }}</span>
                        </td>
                        <td class="text-end pe-3">
                            @if (auth.member()?.role === 'Admin' && p.status === 'pending') {
                              <button class="btn btn-sm btn-success px-3" (click)="verify(p.id)">Verify</button>
                            } @else {
                               <span class="text-muted small">--</span>
                            }
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td [attr.colspan]="view() === 'group' ? 6 : 5" class="text-center py-5 text-muted">
                           <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                           No {{ view() }} payments found
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card-footer bg-white py-3 border-0">
               <button class="btn btn-sm btn-outline-secondary" (click)="refresh()" [disabled]="listLoading()">
                <i class="bi bi-arrow-clockwise me-1" [class.spin]="listLoading()"></i> Refresh History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spin { animation: rotate 1s linear infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .nav-tabs .nav-link { color: #6c757d; }
    .nav-tabs .nav-link.active { color: #0d6efd; border-bottom: 3px solid #0d6efd !important; }
    .bg-success-subtle { background-color: #d1e7dd; }
    .bg-warning-subtle { background-color: #fff3cd; }
    .bg-danger-subtle { background-color: #f8d7da; }
  `]
})
export class PaymentsComponent implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  view = signal<'personal' | 'group'>('personal');
  amount = 0;
  reference = "";
  method = "EFT";
  proofFile: File | null = null;

  loading = signal(false);
  listLoading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  payments = signal<Payment[]>([]);

  // Filtering & Sorting Signals
  statusFilter = signal<string>('all');
  dayFilter = signal<number | null>(null);
  monthFilter = signal<number | null>(null);
  yearFilter = signal<number | null>(null);
  minAmount = signal<number | null>(null);
  maxAmount = signal<number | null>(null);
  sortBy = signal<'date' | 'amount'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  months = [
    { value: 0, label: 'January' }, { value: 1, label: 'February' }, { value: 2, label: 'March' },
    { value: 3, label: 'April' }, { value: 4, label: 'May' }, { value: 5, label: 'June' },
    { value: 6, label: 'July' }, { value: 7, label: 'August' }, { value: 8, label: 'September' },
    { value: 9, label: 'October' }, { value: 10, label: 'November' }, { value: 11, label: 'December' }
  ];

  years = computed(() => {
    const yearsSet = new Set<number>();
    this.payments().forEach(p => yearsSet.add(new Date(p.paidAt).getFullYear()));
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    return Array.from(yearsSet).sort((a, b) => b - a);
  });

  days = Array.from({ length: 31 }, (_, i) => i + 1);

  filteredPayments = computed(() => {
    let list = this.payments();
    
    // View filter
    if (this.view() === 'personal') {
        const userId = this.auth.member()?.id;
        list = list.filter(p => String(p.userId) === String(userId));
    }

    // Status filter
    if (this.statusFilter() !== 'all') {
      list = list.filter(p => p.status === this.statusFilter());
    }

    // Date filters
    list = list.filter(p => {
      const date = new Date(p.paidAt);
      if (this.dayFilter() !== null && date.getDate() !== Number(this.dayFilter())) return false;
      if (this.monthFilter() !== null && date.getMonth() !== Number(this.monthFilter())) return false;
      if (this.yearFilter() !== null && date.getFullYear() !== Number(this.yearFilter())) return false;
      return true;
    });

    // Amount range filter
    list = list.filter(p => {
      if (this.minAmount() !== null && p.amount < (this.minAmount() || 0)) return false;
      if (this.maxAmount() !== null && p.amount > (this.maxAmount() || Infinity)) return false;
      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (this.sortBy() === 'date') {
        comparison = new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime();
      } else {
        comparison = a.amount - b.amount;
      }
      return this.sortOrder() === 'asc' ? comparison : -comparison;
    });

    return list;
  });

  resetFilters() {
    this.statusFilter.set('all');
    this.dayFilter.set(null);
    this.monthFilter.set(null);
    this.yearFilter.set(null);
    this.minAmount.set(null);
    this.maxAmount.set(null);
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.listLoading.set(true);
    this.api.listPayments().subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.listLoading.set(false);
      },
      error: () => this.listLoading.set(false),
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.proofFile = file;
    }
  }

  submit(): void {
    if (!this.amount || this.amount <= 0) return;
    
    const form = new FormData();
    form.append("amount", String(this.amount));
    form.append("reference", this.reference);
    form.append("method", this.method);
    if (this.proofFile) {
        form.append("proof", this.proofFile);
    }
    if (this.auth.member()?.groupId) {
      form.append("groupId", String(this.auth.member()?.groupId));
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    
    this.api.createPayment(form).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set("Payment submitted for verification.");
        this.amount = 0;
        this.reference = "";
        this.proofFile = null;
        this.refresh();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || "Failed to submit payment");
      },
    });
  }

  verify(id: string): void {
    this.api.verifyPayment(id).subscribe({
      next: () => {
        this.refresh();
      }
    });
  }
}
