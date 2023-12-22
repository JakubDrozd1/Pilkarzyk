import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { NotificationContentComponent } from '../../content/notification/notification-content/notification-content.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NotificationContentComponent],
})
export class NotificationPageComponent implements OnInit {
  constructor(private refreshDataService: RefreshDataService) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('notification')
  }

  ionViewWillLeave() {
    this.refreshDataService.refresh('notification-leave')
  }
}
