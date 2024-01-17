import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { CalendarContentComponent } from '../../content/calendar/calendar-content/calendar-content.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GaduGaduComponent } from "../../helper/gadu-gadu/gadu-gadu.component";

@Component({
    selector: 'app-calendar-page',
    standalone: true,
    templateUrl: './calendar-page.component.html',
    styleUrl: './calendar-page.component.scss',
    imports: [
        CommonModule,
        IonicModule,
        CalendarContentComponent,
        TranslateModule,
        GaduGaduComponent
    ]
})
export class CalendarPageComponent {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('calendar')
  }
}
