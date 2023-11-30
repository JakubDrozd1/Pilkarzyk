import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProfilePageComponent } from './profile-page.component';
import { ProfilePageRoutingModule } from './profile-page-routing.module';

@NgModule({
  declarations: [
    ProfilePageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ProfilePageRoutingModule
  ],
  exports: [
    ProfilePageComponent
  ]
})
export class ProfilePageModule { }
