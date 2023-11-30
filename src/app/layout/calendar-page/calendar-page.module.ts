import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarPageComponent } from './calendar-page.component';
import { IonicModule } from '@ionic/angular';
import { CalendarPageRoutingModule } from './calendar-page-routing.module';

@NgModule({
  declarations: [
    CalendarPageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    CalendarPageRoutingModule
  ],
  exports: [
    CalendarPageComponent
  ]
})
export class CalendarPageModule { }
