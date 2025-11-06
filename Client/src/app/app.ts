import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Nav } from '../layout/nav/nav';
import { Home } from '../features/home/home';
import { AccountService } from '../core/services/account-service';
import { User } from '../Types/User';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, Nav, Home],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // Note: This is a new way of dependency injection
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  protected readonly title = signal('Dating App');
  protected members = signal<any>([]);

  ngOnInit(): void {
    this.setCurrentUser();

    this.http.get('https://localhost:5001/api/members').subscribe({
      next: (response) => {
        this.members.set(response);
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => console.log('Completed the http request'),
    });
  }

  // This is primarily used for when the user refreshes the page but is still logged in
  public setCurrentUser(): void {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    // If we have the user
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }
}
