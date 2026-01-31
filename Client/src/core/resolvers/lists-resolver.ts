import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { LikesPredicate } from '../../Types/Like';
import { Member } from '../../Types/Member';
import { LikesServices } from '../services/likes-services';
import { LoadingService } from '../services/loading-service';

export const listsResolver: ResolveFn<Member[]> = (): Observable<Member[]> => {
  const likesService = inject(LikesServices);
  const loading = inject(LoadingService);

  // This is the default tab you show on first render
  loading.show('Loading liked list...');

  return likesService.getLikes(LikesPredicate.Liked).pipe(finalize(() => loading.hide()));
};
