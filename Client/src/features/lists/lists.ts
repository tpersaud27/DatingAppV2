import { AgePipe } from './../../core/pipes/age-pipe';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LikesServices } from '../../core/services/likes-services';
import { Member } from '../../Types/Member';
import { LikesPredicate } from '../../Types/Like';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lists',
  imports: [MatTabsModule, MatCardModule, RouterModule, AgePipe, MatIconModule, MatButtonModule],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists implements OnInit {
  // Dependencies

  private likesService = inject(LikesServices);

  // State

  // Members returned from the "likes" list endpoint (per predicate/tab)
  public members = signal<Member[]>([]);
  // Which tab we are currently viewing
  public predicate: LikesPredicate = LikesPredicate.Liked;

  // LifeCycle

  public ngOnInit(): void {
    this.loadLikes();
  }

  // Actions

  public onTabChange(event: MatTabChangeEvent): void {
    switch (event.index) {
      case 0:
        this.predicate = LikesPredicate.Liked;
        break;
      case 1:
        this.predicate = LikesPredicate.LikedBy;
        break;
      case 2:
        this.predicate = LikesPredicate.Mutual;
        break;
    }

    this.loadLikes();
  }

  public onLike(event: MouseEvent, memberId: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.likesService.toggleLike(memberId).subscribe({
      next: () => {
        // The heart button updates immediately because toggleLike() updates the service signal.
        // Reload the list so the card set matches the current tab predicate (e.g. remove from "Liked" after unliking).
        this.loadLikes();
      },
      error: (err) => console.error(err),
    });
  }

  // Methods
  public hasLiked(memberId: string): boolean {
    return this.likesService.likedIdSet().has(memberId);
  }

  private loadLikes(): void {
    this.likesService.getLikes(this.predicate).subscribe({
      next: (members) => this.members.set(members),
      error: (err) => console.error(err),
    });
  }
}
