import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { NotificationsModalComponent } from "../notifications-modal/notifications-modal.component";
import { ChatboxComponent } from "../chatbox/chatbox.component";
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../notifications.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationsModalComponent, ChatboxComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  notifs = inject(NotificationsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.notifs.refresh();
    setInterval(() => this.notifs.refresh(), 30_000);
  }

  openNotifs(): void {
    this.notifs.refresh();
    this.notifs.open();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
