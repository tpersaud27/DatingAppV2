import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { LikesServices } from './likes-services';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);
  private likesService = inject(LikesServices);

  public init(): Observable<null> {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);

    // If we have the user
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
    this.likesService.getLikeIds().subscribe();

    return of(null);
  }
}
