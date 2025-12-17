import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../Types/Member';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AgePipe } from '../../../core/pipes/age-pipe';

@Component({
  selector: 'app-member-detailed',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterModule,
    MatDividerModule,
    DatePipe,
    TitleCasePipe,
    AgePipe,
  ],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css',
})
export class MemberDetailed implements OnInit {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public member = signal<Member | undefined>(undefined);
  public title = signal<string | undefined>('Profile');

  ngOnInit() {
    // This will give us access to the member object
    this.route.data.subscribe({
      next: (data) => this.member.set(data['member']),
    });
    // This allowes us to get the child routes title
    this.title.set(this.route.firstChild?.snapshot?.title);

    // listen to router events to get the child component name so we can update the title details
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.title.set(this.route.firstChild?.snapshot?.title);
      },
    });
  }

  // This code is no longer needed because we are getting the memeber object from the route instead
  // Getting the member id to load their details
  // public loadMember(): Observable<Member | null> {
  //   // This is will get us the root parameter that has the key of id
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (!id) {
  //     return of(null);
  //   } else {
  //     return this.memberService.getMember(id);
  //   }
  // }

  public onLike(member: Member | null): void {
    if (!member) return;
    // TODO: hook into your like API
    console.log('Liked member:', member.displayName);
  }

  public onBack(): void {
    this.router.navigate(['/members']);
  }
}
