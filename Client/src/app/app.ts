import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Nav } from '../layout/nav/nav';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, Nav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // Note: This is a new way of dependency injection
  private http = inject(HttpClient);
  protected readonly title = signal('Dating App');
  protected members = signal<any>([]);

  ngOnInit(): void {
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

  // getMembers() {
  //       this.http.get('https://localhost:5001/api/members').subscribe({
  //         next: (response) => {
  //           this.members.set(response);
  //           console.log(response);
  //         },
  //         error: (error) => {
  //           console.log(error);
  //         },
  //         complete: () => console.log('Completed the http request'),
  //       });
  // }
}
