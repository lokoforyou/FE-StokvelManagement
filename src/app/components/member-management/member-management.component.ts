import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-member-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Member Management</h2>
          <p class="text-muted mb-0">
            @if (auth.member()?.isSuperAdmin) {
              System-wide administrative control enabled.
            } @else {
              Manage members for <strong>{{ auth.member()?.groupId }}</strong>.
            }
          </p>
        </div>
      </div>

      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
           <h5 class="mb-0 fw-bold">User List</h5>
           <input type="text" class="form-control form-control-sm w-25" placeholder="Search users..." [(ngModel)]="search" />
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Group</th>
                <th>Role</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of filteredUsers(); track u.id) {
                <tr>
                  <td>
                    <div class="fw-bold">{{ u.name }}</div>
                    @if (u.isSuperAdmin) { <span class="badge bg-danger x-small">Super Admin</span> }
                  </td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.groupName || 'No Group' }}</td>
                  <td>
                    <span class="badge" [ngClass]="u.role === 'Admin' ? 'bg-primary' : 'bg-secondary'">{{ u.role || 'Member' }}</span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      @if (u.role === 'Admin') {
                        <button class="btn btn-outline-warning" (click)="updateRole(u, 'Member')">Make Member</button>
                      } @else {
                        <button class="btn btn-outline-primary" (click)="updateRole(u, 'Admin')">Promote Admin</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.x-small { font-size: 0.65rem; }`]
})
export class MemberManagementComponent implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  users = signal<any[]>([]);
  search = "";

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.auth.member()?.isSuperAdmin) {
      this.api.adminUserList().subscribe(res => this.users.set(res.users));
    } else {
        // Fallback for Group Admins: In a real app we'd fetch group members specifically
        // For now, we reuse the admin list if allowed, or filtered locally
        this.api.adminUserList().subscribe({
            next: res => this.users.set(res.users.filter((u: any) => u.groupId === this.auth.member()?.groupId)),
            error: () => console.error("Unauthorized to view full list")
        });
    }
  }

  filteredUsers() {
    return this.users().filter(u => 
        u.name.toLowerCase().includes(this.search.toLowerCase()) || 
        u.email.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  updateRole(user: any, newRole: string): void {
    if (this.auth.member()?.isSuperAdmin) {
      this.api.updateAnyUserRole(user.id, newRole, user.groupId).subscribe(() => this.loadUsers());
    } else {
      this.api.updateGroupMemberRole(user.groupId, user.id, newRole).subscribe(() => this.loadUsers());
    }
  }
}
