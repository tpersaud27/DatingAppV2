import { Component, computed, inject } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Member } from '../../../Types/Member';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { MatIconModule } from '@angular/material/icon';
import { LikesServices } from '../../../core/services/likes-services';

@Component({
  selector: 'app-members-list',
  imports: [
    AsyncPipe,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    RouterLink,
    AgePipe,
    MatIconModule,
  ],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList {
  public memberService = inject(MemberService);
  public accountService = inject(AccountService);
  public likesService = inject(LikesServices);

  // Create a Set so lookups are O(1)
  public likedIdSet = computed(() => new Set(this.likesService.likedIds()));

  public hasLiked(memberId: string): boolean {
    return this.likedIdSet().has(memberId);
  }

  public members$: Observable<Member[]>;

  constructor() {
    this.members$ = this.memberService.getMembers();
  }

  public onLike(event: MouseEvent, memberId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.likesService.toggleLike(memberId).subscribe({
      next: () => {
        this.likesService.getLikeIds().subscribe();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
