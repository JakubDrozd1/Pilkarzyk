import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GroupsPageComponent } from './groups-page.component';
import { GroupsPageRoutingModule } from './groups-page-routing.module';

@NgModule({
  declarations: [
    GroupsPageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    GroupsPageRoutingModule
  ],
  exports: [
    GroupsPageComponent
  ]
})
export class GroupsPageModule { }
