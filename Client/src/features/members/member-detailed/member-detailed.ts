import { Component, inject, OnInit } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { Member } from '../../../Types/Member';

@Component({
  selector: 'app-member-detailed',
  imports: [AsyncPipe],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css',
})
export class MemberDetailed implements OnInit {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);

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
}
