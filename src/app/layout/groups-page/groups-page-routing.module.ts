import { NgModule } from '@angular/core';
import { GroupsPageComponent } from './groups-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: GroupsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsPageRoutingModule { }
