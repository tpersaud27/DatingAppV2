import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCredentials, User } from '../../Types/User';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);

  public baseUrl = 'https://localhost:5001/api/';

  public currentUser = signal<User | null>(null);

  public login(userCredentials: LoginCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/login', userCredentials).pipe(
      tap((user) => {
        if (user) {
          // Store user into local storage
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  public logout(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
