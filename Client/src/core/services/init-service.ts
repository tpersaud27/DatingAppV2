import { MessagesSocketService } from './messages-socket-service';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { firstValueFrom, Observable, of } from 'rxjs';
import { LikesServices } from './likes-services';
import { User } from '../../Types/User';
import { AuthService } from './auth-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private likesService = inject(LikesServices);
  private messagesSocketService = inject(MessagesSocketService);
  private http = inject(HttpClient);

  // Loaded once at app startup
  public config!: AppConfig;

  public async loadConfig(): Promise<void> {
    // This must run before any services try to read apiUrl/wsUrl/cognito config
    const cfg = await firstValueFrom(this.http.get<AppConfig>('/assets/config.json'));
    const env = environment;

    if (env.production === true) {
      this.config = cfg;
      console.log('✅ Runtime production config loaded');
    } else {
      this.config = environment;

      console.log('✅ Runtime dev config loaded:', {
        production: this.config.production,
        apiUrl: this.config.apiUrl,
        wsUrl: this.config.wsUrl,
        cognito: this.config.cognito,
      });
    }
  }

  public init(): Observable<null> {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);

    // If we have the user
    const user: User = JSON.parse(userString);
    this.accountService.currentUser.set(user);

    // We we have the currentUser then we open the websocket
    const token = this.authService.getIdToken();
    if (!token) {
      throw new Error('Cannot connect websocket: missing id_token');
    }
    this.messagesSocketService.onConnect();
    this.likesService.getLikeIds().subscribe();

    return of(null);
  }
}
