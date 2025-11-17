import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MembersList } from '../features/members/members-list/members-list';
import { MemberDetailed } from '../features/members/member-detailed/member-detailed';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { authGuard } from '../core/guards/auth-guard';
import { TestErrors } from '../features/test-errors/test-errors';
import { NotFound } from '../shared/errors/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'members',
        component: MembersList,
      },
      {
        path: 'members/:id',
        component: MemberDetailed,
      },
      {
        path: 'lists',
        component: Lists,
      },
      {
        path: 'messages',
        component: Messages,
      },
    ],
  },
  {
    path: 'errors',
    component: TestErrors,
  },
  {
    path: '**',
    component: NotFound,
  },
];
