import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SettingsPageComponent } from './settings-page.component';
import { SettingsPageRoutingModule } from './settings-page-routing.module';

@NgModule({
  declarations: [
    SettingsPageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SettingsPageRoutingModule
  ],
  exports: [
    SettingsPageComponent
  ]
})
export class SettingsPageModule { }
