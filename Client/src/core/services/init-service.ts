import { MessagesSocketService } from './messages-socket-service';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { finalize, firstValueFrom, Observable, of } from 'rxjs';
import { LikesServices } from './likes-services';
import { User } from '../../Types/User';
import { AuthService } from './auth-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private likesService = inject(LikesServices);
  private messagesSocketService = inject(MessagesSocketService);
  private loadingService = inject(LoadingService);

  /**
   * Runs once on app startup (refresh, first load).
   * Restores user session from localStorage and reconnects “ambient” services.
   *
   * IMPORTANT:
   * - This should not throw. If something is missing/corrupt,
   *   fail gracefully and let the app load normally.
   */
  public init(): Observable<null> {
    this.loadingService.show('Restoring session...');

    try {
      const userString = localStorage.getItem('user');

      // No cached user = nothing to restore
      if (!userString) {
        this.loadingService.setMessage('Ready...');
        return of(null).pipe(finalize(() => this.loadingService.hide()));
      }

      // Parse cached user safely
      let user: User | null = null;
      try {
        user = JSON.parse(userString) as User;
      } catch {
        // Corrupt local storage entry — clear it and continue
        localStorage.removeItem('user');
        return of(null).pipe(finalize(() => this.loadingService.hide()));
      }

      // Set current user immediately so UI can render in "logged in" state
      this.loadingService.setMessage('Loading your profile...');
      this.accountService.currentUser.set(user);

      // Connect websocket (requires id_token)
      this.loadingService.setMessage('Connecting messaging...');
      const token = this.authService.getIdToken();

      if (!token) {
        // If no token, treat as logged out-ish state: clear and continue
        localStorage.removeItem('user');
        this.accountService.currentUser.set(null);
        return of(null).pipe(finalize(() => this.loadingService.hide()));
      }

      this.loadingService.setMessage('Ready...');
      return of(null).pipe(finalize(() => this.loadingService.hide()));
    } catch (e) {
      // Never break app startup
      console.error('InitService.init failed:', e);
      return of(null).pipe(finalize(() => this.loadingService.hide()));
    }
  }
}
