import { MessagesSocketService } from './messages-socket-service';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { LikesServices } from './likes-services';
import { User } from '../../Types/User';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);
  private likesService = inject(LikesServices);
  private messagesSocketService = inject(MessagesSocketService);

  public init(): Observable<null> {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);

    // If we have the user
    const user: User = JSON.parse(userString);
    this.accountService.currentUser.set(user);
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      this.messagesSocketService.connect(currentUser.id);
    }
    this.likesService.getLikeIds().subscribe();

    return of(null);
  }
}
