import { ResolveFn } from '@angular/router';
import { MemberService } from '../../core/services/member-service';
import { inject } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from '../../core/services/loading-service';
import { Member } from '../../Types/Member';

export const membersResolver: ResolveFn<Member[]> = (): Observable<Member[]> => {
  const memberService = inject(MemberService);
  const loading = inject(LoadingService);

  loading.show('Loading members...');

  return memberService.getMembers().pipe(finalize(() => loading.hide()));
};
