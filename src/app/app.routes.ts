import { Routes } from '@angular/router';
import { TabComponent } from './controller/tab/tab.component';
import { AuthComponent } from './controller/auth/auth.component';
import { LoginComponent } from './content/form/login/login.component';
import { RegisterComponent } from './content/form/register/register.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
            },
            {
                path: 'register',
                component: RegisterComponent,
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
            },
        ],
    }, 
    {
        path: '',
        component: TabComponent,
        children: [
            {
                path: 'groups',
                loadComponent: () => import('./layout/groups-page/groups-page.component').then(m => m.GroupsPageComponent),
            },
            {
                path: 'calendar',
                loadComponent: () => import('./layout/calendar-page/calendar-page.component').then(m => m.CalendarPageComponent),
            },
            {
                path: 'home',
                loadComponent: () => import('./layout/home-page/home-page.component').then(m => m.HomePageComponent),
            },
            {
                path: 'profile',
                loadComponent: () => import('./layout/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
            },
            {
                path: 'settings',
                loadComponent: () => import('./layout/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full',
            },
        ],
    },
]

// export const routes: Routes = [
//     {
//       path: '',
//       component: AuthComponent,
//       children: [
//         {
//           path: 'login',
//           component: LoginComponent,
//         },
//         {
//           path: 'register',
//           component: RegisterComponent,
//         },
//         {
//           path: '',
//           redirectTo: 'login', // Domyślnie przekierowuj do /login
//           pathMatch: 'full',
//         },
//       ],
//     },
//     {
//       path: 'home',
//       component: TabComponent,
//       children: [
//         {
//           path: 'groups',
//           loadChildren: () => import('./layout/groups-page/groups-page.module').then(m => m.GroupsPageModule),
//         },
//         {
//           path: 'calendar',
//           loadChildren: () => import('./layout/calendar-page/calendar-page.module').then(m => m.CalendarPageModule),
//         },
//         {
//           path: 'profile',
//           loadChildren: () => import('./layout/profile-page/profile-page.module').then(m => m.ProfilePageModule),
//         },
//         {
//           path: 'settings',
//           loadChildren: () => import('./layout/settings-page/settings-page.module').then(m => m.SettingsPageModule),
//         },
//         {
//           path: '',
//           redirectTo: 'groups', // Domyślnie przekierowuj do /home/groups
//           pathMatch: 'full',
//         },
//       ],
//     },
//     {
//       path: '**',
//       redirectTo: 'login', // Przekieruj na /login dla dowolnego niepasującego URL-a
//     },
//   ];