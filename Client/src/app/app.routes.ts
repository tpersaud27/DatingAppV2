import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MembersList } from '../features/members/members-list/members-list';
import { MemberDetailed } from '../features/members/member-detailed/member-detailed';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { authGuard } from '../core/guards/auth-guard';
import { TestErrors } from '../features/test-errors/test-errors';
import { NotFound } from '../shared/errors/not-found/not-found';
import { ServerError } from '../shared/errors/server-error/server-error';
import { MemberProfile } from '../features/members/member-profile/member-profile';
import { MemberPhotos } from '../features/members/member-photos/member-photos';
import { MemberMessages } from '../features/members/member-messages/member-messages';
import { memberResolver } from '../core/resolvers/member-resolver';
import { preventUnsavedChangesGuard } from '../core/guards/prevent-unsaved-changes-guard';
import { AuthCallback } from '../features/account/auth-callback/auth-callback';
import { membersResolver } from '../core/resolvers/members-resolver';
import { listsResolver } from '../core/resolvers/lists-resolver';
import { messagesResolver } from '../core/resolvers/messages-resolver';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  { path: 'auth/callback', component: AuthCallback },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'members',
        component: MembersList,
        runGuardsAndResolvers: 'always',
        resolve: { members: membersResolver },
      },
      {
        path: 'members/:id',
        resolve: { member: memberResolver },
        runGuardsAndResolvers: 'always',
        component: MemberDetailed,
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
          },
          {
            path: 'profile',
            component: MemberProfile,
            title: 'Profile',
            canDeactivate: [preventUnsavedChangesGuard],
          },
          {
            path: 'photos',
            component: MemberPhotos,
            title: 'Photos',
          },
          {
            path: 'messages',
            component: MemberMessages,
            title: 'Messages',
          },
        ],
      },
      {
        path: 'lists',
        resolve: { members: listsResolver },
        component: Lists,
      },
      {
        path: 'messages',
        component: Messages,
        resolve: { conversations: messagesResolver },
        // Recommended for inbox-style pages:
        // Clicking Messages again re-runs resolver and shows loader
        runGuardsAndResolvers: 'always',
      },
    ],
  },
  {
    path: 'errors',
    component: TestErrors,
  },
  {
    path: 'server-error',
    component: ServerError,
  },
  {
    path: '**',
    component: NotFound,
  },
];
