import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Routes,
} from '@angular/router'
import { inject } from '@angular/core'
import { IsLogged } from './helper/isLogged'
import { RegisterLinkComponent } from './form/register-link/register-link.component'
import { UserService } from './service/user/user.service'
import { DownloadComponent } from './helper/download/download.component'

const MainCanActivateFn: CanActivateFn = () => {
  return inject(UserService).getDetails()
}
const IsLoggedFn: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(IsLogged).canActivate(route, state)
}

const meetingChildren = [
  {
    path: '',
    loadComponent: () =>
      import(
        './content/meeting/meeting-details/meeting-details.component'
      ).then((m) => m.MeetingDetailsComponent),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./form/meeting/meeting.component').then(
        (m) => m.MeetingComponent
      ),
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./content/meeting/meeting-team/meeting-team.component').then(
        (m) => m.MeetingTeamComponent
      ),
  },
  {
    path: 'answer/:idMessage',
    loadComponent: () =>
      import(
        './content/message/message-answer-modal/message-answer-modal.component'
      ).then((m) => m.MessageAnswerModalComponent),
  },
  {
    path: 'profile/:idUser',
    loadComponent: () =>
      import(
        './content/profile/profile-details/profile-details.component'
      ).then((m) => m.ProfileDetailsComponent),
  },
  {
    path: 'message',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './content/message/message-user-list/message-user-list.component'
          ).then((m) => m.MessageUserListComponent),
      },
      {
        path: 'profile/:idUser',
        loadComponent: () =>
          import(
            './content/profile/profile-details/profile-details.component'
          ).then((m) => m.ProfileDetailsComponent),
      },
      {
        path: 'answer/:idMessage',
        loadComponent: () =>
          import(
            './content/message/message-answer-modal/message-answer-modal.component'
          ).then((m) => m.MessageAnswerModalComponent),
      },
    ],
  },
]

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tabs/tab/tab.component').then((m) => m.TabComponent),
    canActivate: [IsLoggedFn, MainCanActivateFn],
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./layout/home-page/home-page.component').then(
                (m) => m.HomePageComponent
              ),
          },
          {
            path: 'add-meeting',
            loadComponent: () =>
              import('./form/meeting/meeting.component').then(
                (m) => m.MeetingComponent
              ),
          },
          {
            path: 'meeting/:idMeeting',
            children: meetingChildren,
          },
        ],
      },
      {
        path: 'notification',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './layout/notification-page/notification-page.component'
              ).then((m) => m.NotificationPageComponent),
          },
          {
            path: 'message-add/:idMessage',
            loadComponent: () =>
              import(
                './content/message/message-answer-modal/message-answer-modal.component'
              ).then((m) => m.MessageAnswerModalComponent),
          },
          {
            path: 'profile/:idUser',
            loadComponent: () =>
              import(
                './content/profile/profile-details/profile-details.component'
              ).then((m) => m.ProfileDetailsComponent),
          },
          {
            path: 'privacy',
            loadComponent: () =>
              import(
                './content/account/account-privacy/account-privacy.component'
              ).then((m) => m.AccountPrivacyComponent),
          },
          {
            path: 'meeting/:idMeeting',
            children: meetingChildren,
          },
        ],
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./layout/groups-page/groups-page.component').then(
                (m) => m.GroupsPageComponent
              ),
          },
          {
            path: 'profile/:idUser',
            loadComponent: () =>
              import(
                './content/profile/profile-details/profile-details.component'
              ).then((m) => m.ProfileDetailsComponent),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./form/groups/groups.component').then(
                (m) => m.GroupsComponent
              ),
          },
          {
            path: ':idGroup',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './content/groups/groups-content/groups-content.component'
                  ).then((m) => m.GroupsContentComponent),
              },
              {
                path: 'edit',
                loadComponent: () =>
                  import(
                    './content/groups/groups-edit/groups-edit.component'
                  ).then((m) => m.GroupsEditComponent),
              },
              {
                path: 'add-meeting',
                loadComponent: () =>
                  import('./form/meeting/meeting.component').then(
                    (m) => m.MeetingComponent
                  ),
              },
              {
                path: 'add-user',
                loadComponent: () =>
                  import(
                    './content/groups/groups-user-add/groups-user-add.component'
                  ).then((m) => m.GroupsUserAddComponent),
              },
              {
                path: 'add-organizer',
                loadComponent: () =>
                  import(
                    './content/groups/groups-organizer/groups-organizer.component'
                  ).then((m) => m.GroupsOrganizerComponent),
              },
              {
                path: 'profile/:idUser',
                loadComponent: () =>
                  import(
                    './content/profile/profile-details/profile-details.component'
                  ).then((m) => m.ProfileDetailsComponent),
              },
              {
                path: 'meeting/:idMeeting',
                children: meetingChildren,
              },
            ],
          },
        ],
      },
      {
        path: 'calendar',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./layout/calendar-page/calendar-page.component').then(
                (m) => m.CalendarPageComponent
              ),
          },
          {
            path: 'meeting/:idMeeting',
            children: meetingChildren,
          },
        ],
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./layout/account-page/account-page.component').then(
                (m) => m.AccountPageComponent
              ),
          },
          {
            path: 'edit',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './content/profile/profile-edit/profile-edit.component'
                  ).then((m) => m.ProfileEditComponent),
              },
              {
                path: ':mode',
                loadComponent: () =>
                  import('./form/profile/profile.component').then(
                    (m) => m.ProfileComponent
                  ),
              },
            ],
          },
          {
            path: 'edit-pass',
            loadComponent: () =>
              import('./form/profile-password/profile-password.component').then(
                (m) => m.ProfilePasswordComponent
              ),
          },
          {
            path: 'notification',
            loadComponent: () =>
              import(
                './content/account/account-notification/account-notification.component'
              ).then((m) => m.AccountNotificationComponent),
          },
          {
            path: 'privacy',
            loadComponent: () =>
              import(
                './content/account/account-privacy/account-privacy.component'
              ).then((m) => m.AccountPrivacyComponent),
          },
          {
            path: 'about',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './content/account/account-about/account-about.component'
                  ).then((m) => m.AccountAboutComponent),
              },
              {
                path: 'info',
                loadComponent: () =>
                  import(
                    './content/account/account-about-info/account-about-info.component'
                  ).then((m) => m.AccountAboutInfoComponent),
              },
              {
                path: 'contact',
                loadComponent: () =>
                  import(
                    './content/account/account-about-contact/account-about-contact.component'
                  ).then((m) => m.AccountAboutContactComponent),
              },
              {
                path: 'policy',
                loadComponent: () =>
                  import(
                    './helper/privacy-policy/privacy-policy.component'
                  ).then((m) => m.PrivacyPolicyComponent),
              },
              {
                path: 'delete-info',
                loadComponent: () =>
                  import(
                    './helper/delete-account-info/delete-account-info.component'
                  ).then((m) => m.DeleteAccountInfoComponent),
              },
            ],
          },
          {
            path: 'profile/:idUser',
            loadComponent: () =>
              import(
                './content/profile/profile-details/profile-details.component'
              ).then((m) => m.ProfileDetailsComponent),
          },
        ],
      },
      {
        path: 'download',
        component: DownloadComponent,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./tabs/auth/auth.component').then((m) => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./form/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./form/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'recovery',
        loadComponent: () =>
          import('./form/password-recovery/password-recovery.component').then(
            (m) => m.PasswordRecoveryComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'register/:idGroupInvite',
    component: RegisterLinkComponent,
  },
  {
    path: 'recovery/:idResetPassword',
    loadComponent: () =>
      import('./form/password-reset/password-reset.component').then(
        (m) => m.PasswordResetComponent
      ),
  },
  {
    path: 'policy',
    loadComponent: () =>
      import('./helper/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'delete-info',
    loadComponent: () =>
      import('./helper/delete-account-info/delete-account-info.component').then(
        (m) => m.DeleteAccountInfoComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'form/login',
    pathMatch: 'full',
  },
]
