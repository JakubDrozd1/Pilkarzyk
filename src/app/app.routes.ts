import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Routes,
} from '@angular/router'
import { TabComponent } from './controller/tab/tab.component'
import { AuthComponent } from './controller/auth/auth.component'
import { LoginComponent } from './content/form/login/login.component'
import { RegisterComponent } from './content/form/register/register.component'
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
        path: 'groups/:idGroup',
        loadComponent: () =>
          import(
            './content/groups/groups-content/groups-content.component'
          ).then((m) => m.GroupsContentComponent),
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
        path: 'profile',
        loadComponent: () =>
          import('./layout/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: 'notification',
        loadComponent: () =>
          import('./layout/notification-page/notification-page.component').then(
            (m) => m.NotificationPageComponent
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
    path: '**',
    redirectTo: 'form/login',
    pathMatch: 'full',
  },
]
