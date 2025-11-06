import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);

  public baseUrl = 'https://localhost:5001/api/';

  public login(userCredentials: any) {
    return this.http.post(this.baseUrl + 'account/login', userCredentials);
  }
}
