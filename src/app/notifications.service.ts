import { Injectable, signal } from "@angular/core";
import { ApiService } from "./services/api.service";
import { Notification } from "./models/types";

@Injectable({ providedIn: "root" })
export class NotificationsService {
  notifications = signal<Notification[]>([]);
  unread = signal<number>(0);
  showModal = signal<boolean>(false);

  constructor(private api: ApiService) {}

  refresh(): void {
    this.api.listNotifications().subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.unread.set(res.unread);
      },
      error: () => {},
    });
  }

  open(): void {
    this.showModal.set(true);
  }

  close(): void {
    this.showModal.set(false);
  }

  markRead(id: string): void {
    this.api.markNotificationRead(id).subscribe(() => this.refresh());
  }

  markAllRead(): void {
    this.api.markAllRead().subscribe(() => this.refresh());
  }
}
