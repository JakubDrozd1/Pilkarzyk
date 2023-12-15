import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { TabComponent } from './controller/tab/tab.component';
import { AuthComponent } from './controller/auth/auth.component';
import { LoginComponent } from './content/form/login/login.component';
import { RegisterComponent } from './content/form/register/register.component';
import { inject } from '@angular/core';
import { IsLogged } from './helper/isLogged';
import { RegisterLinkComponent } from './content/form/register-link/register-link.component';

const IsLoggedFn: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(IsLogged).canActivate(route, state)
    };

export const routes: Routes = [
    {
        path: 'logged',
        canActivate: [IsLoggedFn],
        component: TabComponent,
        children: [
            {
                path: 'groups',
                loadComponent: () => import('./layout/groups-page/groups-page.component').then(m => m.GroupsPageComponent),
            },
            {
                path: 'groups/:idGroup',
                loadComponent: () => import('./content/groups/groups-content/groups-content.component').then(m => m.GroupsContentComponent),
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
                path: '',
                redirectTo: 'logged/home',
                pathMatch: 'full',
            },
        ],
    },
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
        path: 'register/:idGroup',
        component: RegisterLinkComponent,
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
    },
]