import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { MeetingUserListComponent } from '../../meeting/meeting-user-list/meeting-user-list.component'
import { GetMessagesUsersMeetingsResponse, MessagesApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'

@Component({
  selector: 'app-message-user-list',
  templateUrl: './message-user-list.component.html',
  styleUrls: ['./message-user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    MeetingUserListComponent,
    SpinnerComponent,
  ],
})
export class MessageUserListComponent implements OnInit {
  idMeeting: number = 0
  messages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false

  constructor(
    private route: ActivatedRoute,
    private messagesApi: MessagesApi,
    private alert: Alert
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    if (this.idMeeting > 0) {
      this.isReady = false
      this.messagesApi
        .getAllMessages({
          idMeeting: this.idMeeting,
          page: 0,
          onPage: -1,
          isAvatar: true,
        })
        .subscribe({
          next: (response) => {
            this.messages = response
            this.isReady = true
          },
          error: (error) => {
            this.isReady = true
            this.alert.handleError(error)
          },
        })
    }
  }

  cancel() {
    window.history.back()
  }
}
