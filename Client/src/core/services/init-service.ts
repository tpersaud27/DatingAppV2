import { MessagesSocketService } from './messages-socket-service';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { LikesServices } from './likes-services';
import { User } from '../../Types/User';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private likesService = inject(LikesServices);
  private messagesSocketService = inject(MessagesSocketService);

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
