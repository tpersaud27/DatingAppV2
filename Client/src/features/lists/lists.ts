import { AgePipe } from './../../core/pipes/age-pipe';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LikesServices } from '../../core/services/likes-services';
import { Member } from '../../Types/Member';
import { LikesPredicate } from '../../Types/Like';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lists',
  imports: [MatTabsModule, MatCardModule, RouterModule, AgePipe],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists implements OnInit {
  // Dependencies
  private likesService = inject(LikesServices);

  // State
  public members = signal<Member[]>([]);
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

  // Methods
  public loadLikes(): void {
    this.likesService.getLikes(this.predicate).subscribe({
      next: (members) => {
        this.members.set(members);
      },
    });
  }
}
