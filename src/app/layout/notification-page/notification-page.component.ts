import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GaduGaduComponent } from '../../helper/gadu-gadu/gadu-gadu.component'
import { NotificationContentComponent } from 'src/app/content/notification/notification-content/notification-content.component'

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    GaduGaduComponent,
    NotificationContentComponent,
  ],
})
export class NotificationPageComponent implements OnInit {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('notification')
  }

  ionViewWillLeave() {
    this.refreshDataService.refresh('notification-leave')
  }
}
