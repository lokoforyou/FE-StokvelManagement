import { Injectable, signal, computed, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { AuthResponse, Member } from "../models/types";

const TOKEN_KEY = "stokvel.token";
const MEMBER_KEY = "stokvel.member";

@Injectable({ providedIn: "root" })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private _member = signal<Member | null>(this.readMember());
  private _token = signal<string | null>(this.readToken());

  member = this._member.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  private readToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private readMember(): Member | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const raw = localStorage.getItem(MEMBER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Member;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`https://stokvel-backend-113092091685.us-central1.run.app/api/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  signup(payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    monthlyContribution?: number;
    groupName?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`https://stokvel-backend-113092091685.us-central1.run.app/api/auth/signup`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  setMember(member: Member): void {
    this._member.set(member);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
    }
  }

  private setSession(res: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(MEMBER_KEY, JSON.stringify(res.member));
    }
    this._token.set(res.token);
    this._member.set(res.member);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(MEMBER_KEY);
    }
    this._token.set(null);
    this._member.set(null);
  }
}
