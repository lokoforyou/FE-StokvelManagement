import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Member, MemberStats, Notification, Payment } from "../models/types";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  getMe(): Observable<{ member: Member; stats: MemberStats }> {
    return this.http.get<{ member: Member; stats: MemberStats }>("/api/members/me");
  }

  updateMe(
    patch: Partial<Pick<Member, "fullName" | "phone" | "idNumber" | "monthlyContribution">>,
  ): Observable<{ member: Member }> {
    return this.http.put<{ member: Member }>("/api/members/me", patch);
  }

  listPayments(): Observable<{ payments: Payment[] }> {
    return this.http.get<{ payments: Payment[] }>("/api/payments");
  }

  createPayment(form: FormData): Observable<{ payment: Payment }> {
    return this.http.post<{ payment: Payment }>("/api/payments", form);
  }

  verifyPayment(id: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`/api/payments/${id}/verify`, {});
  }

  listNotifications(): Observable<{ unread: number; notifications: Notification[] }> {
    return this.http.get<{ unread: number; notifications: Notification[] }>("/api/notifications");
  }

  markNotificationRead(id: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`/api/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>("/api/notifications/read-all", {});
  }

  chat(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>("/api/chat", { message });
  }
}
