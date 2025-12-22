import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCredentials, RegisterCredentials, User } from '../../Types/User';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesServices } from './likes-services';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  public currentUser = signal<User | null>(null);

  private likesService = inject(LikesServices);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  public register(registerCredentials: RegisterCredentials) {
    // After user is register we need to log them in
    return this.http.post<User>(this.baseUrl + 'account/register', registerCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  public login(userCredentials: LoginCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/login', userCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  public logout(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.likesService.clearLikeIds();
  }

  public setCurrentUser(user: User): void {
    // Store user into local storage
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikeIds().subscribe();
  }
}
