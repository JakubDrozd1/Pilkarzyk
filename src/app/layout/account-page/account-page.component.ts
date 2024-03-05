import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CalendarContentComponent } from 'src/app/controller/calendar-content/calendar-content.component'
import { GaduGaduComponent } from 'src/app/helper/gadu-gadu/gadu-gadu.component'
import { AccountOptionListComponent } from '../../controller/account-option-list/account-option-list.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    CalendarContentComponent,
    TranslateModule,
    GaduGaduComponent,
    AccountOptionListComponent,
  ],
})
export class AccountPageComponent implements OnInit {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}
  ngOnInit(): void {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('profile-details')
  }
}
