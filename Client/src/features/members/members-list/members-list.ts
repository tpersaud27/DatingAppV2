import { Component, inject, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Member } from '../../../Types/Member';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { MatIconModule } from '@angular/material/icon';
import { LikesServices } from '../../../core/services/likes-services';

@Component({
  selector: 'app-members-list',
  imports: [MatCardModule, MatListModule, MatButtonModule, RouterLink, AgePipe, MatIconModule],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList {
  public memberService = inject(MemberService);
  public accountService = inject(AccountService);
  public likesService = inject(LikesServices);
  private route = inject(ActivatedRoute);

  public members = signal<Member[]>([]);

  ngOnInit(): void {
    // Create a reactive container (signal) to hold the members list,
    // then when the route finishes resolving,
    // copy the resolved data into that signal so the template can react to it.
    const members = this.route.snapshot.data['members'] as Member[];
    this.members.set(members);
  }

  public hasLiked(memberId: string): boolean {
    return this.likesService.likedIdSet().has(memberId);
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
