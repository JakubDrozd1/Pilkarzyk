import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CalendarContentComponent } from "../../content/calendar/calendar-content/calendar-content.component";

@Component({
    selector: 'app-calendar-page',
    standalone: true,
    templateUrl: './calendar-page.component.html',
    styleUrl: './calendar-page.component.scss',
    imports: [CommonModule, IonicModule, CalendarContentComponent]
})
export class CalendarPageComponent {
}
