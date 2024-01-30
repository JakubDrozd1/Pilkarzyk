import { CommonModule } from '@angular/common'
import { Component, OnInit, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { MeetingUserListComponent } from '../meeting-user-list/meeting-user-list.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-meeting-content',
  templateUrl: './meeting-content.component.html',
  styleUrls: ['./meeting-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MeetingUserListComponent,
    TranslateModule,
    RouterLink,
  ],
})
export class MeetingContentComponent implements OnInit {
  @Input() meeting!: GetMeetingGroupsResponse
  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    public translate: TranslateService
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
}
