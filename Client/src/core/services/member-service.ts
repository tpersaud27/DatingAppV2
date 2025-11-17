import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../../Types/Member';
import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private accountService = inject(AccountService);

  public getMembers(): void {
    this.http.get<Member[]>(this.baseUrl + 'members', this.getHttpOptions());
  }

  public getMember(id: string): void {
    this.http.get<Member[]>(this.baseUrl + 'members/' + id, this.getHttpOptions());
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.accountService.currentUser()?.token,
      }),
    };
  }
}
