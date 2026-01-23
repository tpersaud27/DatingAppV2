import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCredentials, RegisterCredentials, User, UserDTO } from '../../Types/User';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesServices } from './likes-services';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  public currentUser = signal<any>(null);

  private likesService = inject(LikesServices);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  public bootstrapUser() {
    this.http.post<any>(this.baseUrl + 'account/bootstrap', {}).subscribe((user) => {
      this.setCurrentUser(user);
      console.log('Current User ', this.currentUser());
    });
  }

  public register(registerCredentials: RegisterCredentials) {
    // After user is register we need to log them in
    return this.http.post<User>(this.baseUrl + 'account/register', registerCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  public login(userCredentials: LoginCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/login', userCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
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
