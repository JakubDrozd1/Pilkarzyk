import { CommonModule } from '@angular/common'
import { Component, OnInit, Input } from '@angular/core'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { MeetingUserListComponent } from '../meeting-user-list/meeting-user-list.component'

@Component({
  selector: 'app-meeting-content',
  templateUrl: './meeting-content.component.html',
  styleUrls: ['./meeting-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeetingUserListComponent],
})
export class MeetingContentComponent implements OnInit {
  @Input() meeting!: GetMeetingGroupsResponse
  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  messages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.messagesApi
      .getAllMessages({
        idMeeting: Number(this.meeting.IdMeeting),
        page: 0,
        onPage: -1,
      })
      .subscribe({
        next: (response) => {
          this.messages = response
          this.filteredMessages = response.filter(
            (message) => message.Answer === 'yes'
          )
          this.acceptMeeting = this.filteredMessages.length
          this.isReady = true
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }
}
