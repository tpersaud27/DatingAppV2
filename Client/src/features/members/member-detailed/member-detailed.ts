import { Component, inject, OnInit } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { Member } from '../../../Types/Member';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-member-detailed',
  imports: [AsyncPipe, MatCardModule, MatButtonModule, MatIconModule, MatListModule, RouterModule],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css',
})
export class MemberDetailed implements OnInit {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public member$?: Observable<Member | null>;

  ngOnInit() {
    this.member$ = this.loadMember();
  }

  // Getting the member id to load their details
  public loadMember(): Observable<Member | null> {
    // This is will get us the root parameter that has the key of id
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return of(null);
    } else {
      return this.memberService.getMember(id);
    }
  }

  public onLike(member: Member | null): void {
    if (!member) return;
    // TODO: hook into your like API
    console.log('Liked member:', member.displayName);
  }

  public onBack(): void {
    this.router.navigate(['/members']);
  }
}
