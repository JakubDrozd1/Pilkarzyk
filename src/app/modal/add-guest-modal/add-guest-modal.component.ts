import { GuestsApi } from './../../../../libs/api-client/api/guests.api'
import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MeetingDetailsComponent } from 'src/app/content/meeting/meeting-details/meeting-details.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-add-guest-modal',
  templateUrl: './add-guest-modal.component.html',
  styleUrls: ['./add-guest-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    MeetingDetailsComponent,
  ],
})
export class AddGuestModalComponent implements OnInit {
  @Input() idMeeting: number = 0
  isReady: Boolean = false
  guestName: string = 'Guest'

  constructor(
    private route: ActivatedRoute,
    private alert: Alert,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router,
    private refreshDataService: RefreshDataService,
    private guestsApi: GuestsApi
  ) {}

  ngOnInit() {
    window.addEventListener('popstate', async () => {
      this.cancel()
    })
  }

  addGuest() {
    this.isReady = false
    if (this.guestName == '') {
      this.guestName = 'Guest'
    }
    this.guestsApi
      .addGuests({
        getGuestRequest: {
          IdMeeting: this.idMeeting,
          Name: this.guestName,
        },
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Guest added successfully.')
          )
          this.guestName = 'Guest'
          this.isReady = true
          this.refreshDataService.refresh('meeting-details')
          this.cancel()
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
          this.cancel()
        },
      })
  }

  cancel() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    this.modalCtrl.dismiss(null, 'cancel')
  }
}
