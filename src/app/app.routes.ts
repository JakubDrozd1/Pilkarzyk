import { Routes } from '@angular/router';
import { TabComponent } from './controller/tab/tab.component';

export const routes: Routes = [
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
