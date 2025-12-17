import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-members-list',
  imports: [AsyncPipe, MatCardModule, MatListModule, MatButtonModule, RouterLink, AgePipe],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList {
  public memberService = inject(MemberService);
  public accountService = inject(AccountService);
  public members$: Observable<Member[]>;

  constructor() {
    this.members$ = this.memberService.getMembers();
  }
}
