import { inject, Injectable, signal, computed } from '@angular/core';
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

  /**
   * Internal, writable signal (service owns mutations).
   * Only this service should ever call .set() / .update().
   */
  private readonly _likedIds = signal<string[]>([]);

  /**
   * Public, read-only view of liked ids.
   * Components can read likedIds(), but cannot mutate it.
   */
  public readonly likedIds = this._likedIds.asReadonly();

  /**
   * Derived Set for O(1) membership checks.
   * Automatically recomputed any time _likedIds changes.
   */
  public readonly likedIdSet = computed(() => new Set(this._likedIds()));

  /**
   * Toggles a "like" on the backend AND updates local signal state.
   *
   * Why update local state here?
   * - Immediate UI feedback (no extra getLikeIds() round-trip)
   * - Keeps all likes logic in one place
   *
   * Assumption: POST /likes/{id} toggles like/unlike.
   * If your API behaves differently (e.g. separate like/unlike endpoints),
   * adjust the local update accordingly.
   */
  public toggleLike(targetMemberId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}likes/${targetMemberId}`, {}).pipe(
      tap(() => {
        // Optimistically update local cache
        const ids = this._likedIds();
        const isLiked = ids.includes(targetMemberId);

        this._likedIds.set(
          isLiked ? ids.filter((id) => id !== targetMemberId) : [...ids, targetMemberId],
        );
      }),
    );
  }

  /**
   * Returns full Member objects for likes pages (e.g. "liked" or "likedBy").
   * This does not affect the likedIds cache.
   */
  public getLikes(predicate: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}likes?predicate=${predicate}`);
  }

  /**
   * Fetches liked member IDs for the current user and caches them in a signal.
   * Useful on:
   * - app refresh init
   * - after login
   * - any time you suspect server truth may differ from local cache
   */
  public getLikeIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}likes/list`).pipe(
      tap((ids) => this._likedIds.set(ids)),
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to load likes', err);

        // Decide your preferred behavior on error:
        // Option A: keep existing cached likes (do nothing)
        // Option B: clear cache (uncomment below)
        // this._likedIds.set([]);

        return of([]);
      }),
    );
  }

  /**
   * Fast membership check for UI.
   * Prefer Set lookup over array.includes for performance.
   */
  public hasLiked(memberId: string): boolean {
    return this.likedIdSet().has(memberId);
  }

  /**
   * Clears local likes cache.
   * Use on logout or when switching accounts.
   */
  public clearLikeIds(): void {
    this._likedIds.set([]);
  }
}
