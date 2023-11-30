import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-page-routing.module';

@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    HomePageRoutingModule
  ],
  exports:[
    HomePageComponent
  ]
})
export class HomePageModule { }
