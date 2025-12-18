import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMemberFields, Member, Photo } from '../../Types/Member';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  public editMode = signal(false);
  public member = signal<Member | null>(null);

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  public getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'members');
  }

  public getMember(id: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + 'members/' + id).pipe(
      tap((member) => {
        this.member.set(member);
        console.log('Member loaded:', member);
      })
    );
  }

  public getMemberPhotos(id: string) {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }

  public updateMemberDetails(member: EditableMemberFields) {
    return this.http.put(this.baseUrl + 'members', member);
  }
}
