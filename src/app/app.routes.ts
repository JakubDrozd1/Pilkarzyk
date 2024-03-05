import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Routes,
} from '@angular/router'
import { inject } from '@angular/core'
import { IsLogged } from './helper/isLogged'
import { RegisterLinkComponent } from './content/form/register-link/register-link.component'
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

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./controller/tab/tab.component').then((m) => m.TabComponent),
    canActivate: [IsLoggedFn, MainCanActivateFn],
    children: [
      {
        path: 'groups',
        loadComponent: () =>
          import('./layout/groups-page/groups-page.component').then(
            (m) => m.GroupsPageComponent
          ),
      },
      {
        path: 'groups/add',
        loadComponent: () =>
          import('./content/form/groups/groups.component').then(
            (m) => m.GroupsComponent
          ),
      },
      {
        path: 'groups/:idGroup',
        loadComponent: () =>
          import(
            './content/groups/groups-content/groups-content.component'
          ).then((m) => m.GroupsContentComponent),
      },
      {
        path: 'groups/:idGroup/add-meeting',
        loadComponent: () =>
          import('./content/form/meeting/meeting.component').then(
            (m) => m.MeetingComponent
          ),
      },
      {
        path: 'groups/:idGroup/add-user',
        loadComponent: () =>
          import(
            './content/groups/groups-user-add/groups-user-add.component'
          ).then((m) => m.GroupsUserAddComponent),
      },
      {
        path: 'groups/:idGroup/add-user/:mode',
        loadComponent: () =>
          import('./content/form/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'groups/:idGroup/add-organizer',
        loadComponent: () =>
          import(
            './content/groups/groups-organizer/groups-organizer.component'
          ).then((m) => m.GroupsOrganizerComponent),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./layout/calendar-page/calendar-page.component').then(
            (m) => m.CalendarPageComponent
          ),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./layout/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'home/add-meeting',
        loadComponent: () =>
          import('./content/form/meeting/meeting.component').then(
            (m) => m.MeetingComponent
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./layout/account-page/account-page.component').then(
            (m) => m.AccountPageComponent
          ),
      },
      {
        path: 'account/profile',
        loadComponent: () =>
          import(
            './content/profile/profile-details/profile-details.component'
          ).then((m) => m.ProfileDetailsComponent),
      },
      {
        path: 'account/edit',
        loadComponent: () =>
          import('./content/profile/profile-edit/profile-edit.component').then(
            (m) => m.ProfileEditComponent
          ),
      },
      {
        path: 'account/edit/:mode',
        loadComponent: () =>
          import('./content/form/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'account/edit-pass',
        loadComponent: () =>
          import(
            './content/form/profile-password/profile-password.component'
          ).then((m) => m.ProfilePasswordComponent),
      },
      {
        path: 'account/about',
        loadComponent: () =>
          import(
            './content/account/account-about/account-about.component'
          ).then((m) => m.AccountAboutComponent),
      },
      {
        path: 'notification',
        loadComponent: () =>
          import('./layout/notification-page/notification-page.component').then(
            (m) => m.NotificationPageComponent
          ),
      },
      {
        path: 'message/:idMeeting',
        loadComponent: () =>
          import(
            './content/message/message-user-list/message-user-list.component'
          ).then((m) => m.MessageUserListComponent),
      },
      {
        path: 'message-add/:idMessage',
        loadComponent: () =>
          import(
            './content/message/message-answer-modal/message-answer-modal.component'
          ).then((m) => m.MessageAnswerModalComponent),
      },
      {
        path: 'meeting/:idMeeting',
        loadComponent: () =>
          import(
            './content/meeting/meeting-details/meeting-details.component'
          ).then((m) => m.MeetingDetailsComponent),
      },
      {
        path: 'meeting/:idMeeting/edit',
        loadComponent: () =>
          import('./content/form/meeting/meeting.component').then(
            (m) => m.MeetingComponent
          ),
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
      import('./controller/auth/auth.component').then((m) => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./content/form/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./content/form/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'recovery',
        loadComponent: () =>
          import(
            './content/form/password-recovery/password-recovery.component'
          ).then((m) => m.PasswordRecoveryComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'register/:idGroup',
    component: RegisterLinkComponent,
  },
  {
    path: 'recovery/:idResetPassword',
    loadComponent: () =>
      import('./content/form/password-reset/password-reset.component').then(
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
