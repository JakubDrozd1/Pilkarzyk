import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabComponent } from './controller/tab/tab.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        component: TabComponent,
        children: [
          {
            path: 'groups',
            loadChildren: () => import('./layout/groups-page/groups-page.module').then(m => m.GroupsPageModule),
          },
          {
            path: 'calendar',
            loadChildren: () => import('./layout/calendar-page/calendar-page.module').then(m => m.CalendarPageModule),
          },
          {
            path: 'home',
            loadChildren: () => import('./layout/home-page/home-page.module').then(m => m.HomePageModule),
          },
          {
            path: 'profile',
            loadChildren: () => import('./layout/profile-page/profile-page.module').then(m => m.ProfilePageModule),
          },
          {
            path: 'settings',
            loadChildren: () => import('./layout/settings-page/settings-page.module').then(m => m.SettingsPageModule),
          },
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
