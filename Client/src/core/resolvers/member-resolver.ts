import { ResolveFn, Router } from '@angular/router';
import { MemberService } from '../services/member-service';
import { inject } from '@angular/core';
import { Member } from '../../Types/Member';
import { EMPTY, finalize } from 'rxjs';
import { LoadingService } from '../services/loading-service';

export const memberResolver: ResolveFn<Member> = (route, state) => {
  const memberService = inject(MemberService);
  const router = inject(Router);
  const loading = inject(LoadingService);

  const memberId = route.paramMap.get('id');

  if (!memberId) {
    router.navigateByUrl('/not-found');
    return EMPTY;
  }

  loading.show('Loading profile...');
  // Ensuring we have the member before the route is loaded
  return memberService.getMember(memberId).pipe(finalize(() => loading.hide()));
};
