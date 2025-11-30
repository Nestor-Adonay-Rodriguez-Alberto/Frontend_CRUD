import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { LoginCredentials, LoginResponse } from '../models/auth.model';
import { ApiEnvelope, mapApiResponse } from '../models/response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'series_auth_state';
  private readonly currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.restoreSession());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const payload: Record<string, string> = {
      Nombre: credentials.username
    };
    payload['Contrase\u00f1a'] = credentials.password;

    return this.http
      .post<ApiEnvelope<LoginResponse>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        map(mapApiResponse),
        tap(response => {
          if (!response.status || !response.data) {
            throw new Error(response.message || 'No se pudo iniciar sesión');
          }
        }),
        map(response => response.data as LoginResponse),
        tap(user => this.persistSession(user)),
        catchError(error => {
          const message = error?.error?.message || error?.message || 'Error inesperado al iniciar sesión';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(shouldNavigate = true): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);

    if (shouldNavigate) {
      this.router.navigate(['/login']);
    }
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private persistSession(user: LoginResponse): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private restoreSession(): LoginResponse | null {
    const stored = localStorage.getItem(this.storageKey);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as LoginResponse;
    } catch (error) {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
