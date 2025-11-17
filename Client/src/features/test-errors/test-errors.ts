import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-errors',
  imports: [MatButtonModule],
  templateUrl: './test-errors.html',
  styleUrl: './test-errors.css',
})
export class TestErrors {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api';

  public get404Error() {
    this.http.get(`${this.baseUrl}/buggy/not-found`).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  public get400Error() {
    this.http.get(`${this.baseUrl}/buggy/bad-request`).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  public get500Error() {
    this.http.get(`${this.baseUrl}/buggy/server-error`).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  public get401Error() {
    this.http.get(`${this.baseUrl}/buggy/auth`).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  public get400ValidationError() {
    this.http.post(`${this.baseUrl}/account/register`, {}).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
