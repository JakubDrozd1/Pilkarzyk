import { CommonModule } from '@angular/common'
import { Component, OnInit, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'

@Component({
  selector: 'app-meeting-content',
  templateUrl: './meeting-content.component.html',
  styleUrls: ['./meeting-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MeetingContentComponent implements OnInit {
  @Input() meeting!: GetMeetingGroupsResponse
  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []

  constructor(private messagesApi: MessagesApi, private alert: Alert) {}

  ngOnInit() {
    this.messagesApi
      .getAllMessages({
        idMeeting: Number(this.meeting.IdMeeting),
        page: 0,
        onPage: -1,
      })
      .subscribe({
        next: (response) => {
          this.filteredMessages = response.filter(
            (message) => message.Answer === 'yes'
          )
          console.log(this.meeting.IdMeeting)
          this.acceptMeeting = this.filteredMessages.length
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }
}
