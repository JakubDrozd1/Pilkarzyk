import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss',
  imports: [CommonModule, IonicModule]
})
export class CalendarPageComponent {
}
