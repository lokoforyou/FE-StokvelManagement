import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Member } from '../../models/types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  member = signal<Member | null>(null);
  groups = signal<{ id: number; name: string; description: string }[]>([]);
  
  // Profile Form
  fullName = "";
  phone = "";
  idNumber = "";
  monthlyContribution = 0;
  monthlyTarget = 0;
  yearlyTarget = 0;

  // Group Form
  selectedGroupId: number | null = null;
  newGroupName = "";
  newGroupDesc = "";

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
    this.api.listGroups().subscribe(res => this.groups.set(res.groups));
  }

  loadData(): void {
    this.api.getMe().subscribe((res) => {
      this.member.set(res.member);
      this.fullName = res.member.fullName;
      this.phone = res.member.phone ?? "";
      this.idNumber = res.member.idNumber ?? "";
      this.monthlyContribution = res.member.monthlyContribution ?? 0;
      this.monthlyTarget = res.member.monthlyTarget ?? 0;
      this.yearlyTarget = res.member.yearlyTarget ?? 0;
      this.selectedGroupId = res.member.groupId || null;
    });
  }

  save(): void {
    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);
    this.api
      .updateMe({
        fullName: this.fullName,
        phone: this.phone,
        idNumber: this.idNumber,
        monthlyContribution: Number(this.monthlyContribution) || 0,
        monthlyTarget: Number(this.monthlyTarget) || 0,
        yearlyTarget: Number(this.yearlyTarget) || 0,
      } as any)
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.member.set(res.member);
          this.auth.setMember(res.member);
          this.success.set("Profile and goals updated.");
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.error || "Failed to update profile");
        },
      });
  }

  joinGroup(): void {
    if (!this.selectedGroupId) return;
    this.loading.set(true);
    this.api.joinGroup(this.selectedGroupId).subscribe({
      next: () => {
        this.success.set("Successfully joined the group.");
        this.loadData();
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Failed to join group.");
        this.loading.set(false);
      }
    });
  }

  createGroup(): void {
    if (!this.newGroupName) return;
    this.loading.set(true);
    this.api.createGroup({ name: this.newGroupName, description: this.newGroupDesc }).subscribe({
      next: () => {
        this.success.set("New group created and joined as Admin.");
        this.loadData();
        this.newGroupName = "";
        this.newGroupDesc = "";
        this.loading.set(false);
        this.api.listGroups().subscribe(res => this.groups.set(res.groups));
      },
      error: () => {
        this.error.set("Failed to create group.");
        this.loading.set(false);
      }
    });
  }
}
