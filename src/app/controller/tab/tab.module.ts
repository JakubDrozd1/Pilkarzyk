import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TabComponent } from './tab.component';

@NgModule({
  declarations: [
    TabComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports:[
    TabComponent
  ]
})
export class TabModule { }
