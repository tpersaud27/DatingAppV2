import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../../Types/Member';

@Component({
  selector: 'app-member-profile',
  imports: [],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit {
  private route = inject(ActivatedRoute);
  public member = signal<Member | undefined>(undefined);

  public ngOnInit(): void {
    // Getting access to our member
    this.route.parent?.data.subscribe((data) => {
      this.member.set(data['member']);
    });
  }
}
