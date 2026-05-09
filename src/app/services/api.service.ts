import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Member, MemberStats, Notification, Payment } from "../models/types";

@Injectable({ providedIn: "root" })
export class ApiService {
  private baseUrl = "https://stokvel-backend-113092091685.us-central1.run.app";

  constructor(private http: HttpClient) {}

  getMe(): Observable<{ member: Member; stats: MemberStats }> {
    return this.http.get<{ member: Member; stats: MemberStats }>(`${this.baseUrl}/api/members/me`);
  }

  updateMe(
    patch: Partial<Pick<Member, "fullName" | "phone" | "idNumber" | "monthlyContribution">>,
  ): Observable<{ member: Member }> {
    return this.http.put<{ member: Member }>(`${this.baseUrl}/api/members/me`, patch);
  }

  listPayments(): Observable<{ payments: Payment[] }> {
    return this.http.get<{ payments: Payment[] }>(`${this.baseUrl}/api/payments`);
  }

  createPayment(form: FormData): Observable<{ payment: Payment }> {
    return this.http.post<{ payment: Payment }>(`${this.baseUrl}/api/payments`, form);
  }

  verifyPayment(id: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/api/payments/${id}/verify`, {});
  }

  listNotifications(): Observable<{ unread: number; notifications: Notification[] }> {
    return this.http.get<{ unread: number; notifications: Notification[] }>(`${this.baseUrl}/api/notifications`);
  }

  markNotificationRead(id: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/api/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/api/notifications/read-all`, {});
  }

  chat(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.baseUrl}/api/chat`, { message });
  }

  // Group Management
  listGroups(): Observable<{ groups: { id: number; name: string; description: string }[] }> {
    return this.http.get<{ groups: { id: number; name: string; description: string }[] }>(`${this.baseUrl}/api/groups`);
  }

  createGroup(group: { name: string; description: string; monthlyTarget?: number; yearlyTarget?: number }): Observable<{ success: boolean; groupId: number }> {
    return this.http.post<{ success: boolean; groupId: number }>(`${this.baseUrl}/api/groups/create`, group);
  }

  joinGroup(groupId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/api/groups/join`, { groupId });
  }

  // Admin Management
  adminUserList(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.baseUrl}/api/admin/users`);
  }

  updateAnyUserRole(userId: number, role: string, groupId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/api/admin/users/${userId}/role`, { role, groupId });
  }

  updateGroupMemberRole(groupId: number, userId: number, role: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/api/groups/${groupId}/members/${userId}/role`, { role });
  }
}
