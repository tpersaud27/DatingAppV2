import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { Conversation } from '../../Types/Message';
import { LoadingService } from '../services/loading-service';
import { MessagesService } from '../services/messages-service';

export const messagesResolver: ResolveFn<Conversation[]> = (): Observable<Conversation[]> => {
  const messagesService = inject(MessagesService);
  const loading = inject(LoadingService);

  loading.show('Loading inbox...');

  return messagesService.getAllConversations().pipe(
    finalize(() => loading.hide()),
    // Optional: fail soft so navigation still works if the request errors
    // catchError(() => of([]))
  );
};
