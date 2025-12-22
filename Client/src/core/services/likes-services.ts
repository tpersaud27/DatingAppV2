import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { Member } from '../../Types/Member';

@Injectable({
  providedIn: 'root',
})
export class LikesServices {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  public likedIds = signal<string[]>([]);

  public toggleLike(targetMemberId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}likes/${targetMemberId}`, {});
  }

  public getLikes(predicate: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}likes?predicate=${predicate}`);
  }

  public getLikeIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}likes/list`).pipe(
      tap((ids) => this.likedIds.set(ids)),
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to load likes', err);
        return of([]);
      })
    );
  }

  // Just for resetting the signal in the case of the user logging out and logging into a new user
  public clearLikeIds(): void {
    this.likedIds.set([]);
  }
}
