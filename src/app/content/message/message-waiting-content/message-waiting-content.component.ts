import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingUsersResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { CountdownComponent } from '../../../helper/countdown/countdown.component'
import * as moment from 'moment'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MeetingUserListComponent } from '../../meeting/meeting-user-list/meeting-user-list.component'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-message-waiting-content',
  templateUrl: './message-waiting-content.component.html',
  styleUrls: ['./message-waiting-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    CountdownComponent,
    TranslateModule,
    MeetingUserListComponent,
    RouterLink,
  ],
})
export class MessageWaitingContentComponent implements OnInit {
  @Input() message!: GetMeetingUsersResponse
  currentDate!: Date
  futureDate!: Date
  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.currentDate = moment().toDate()
    this.futureDate = moment(this.message.WaitingTime).toDate()
    if (this.currentDate >= this.futureDate) {
      this.resetMeeting(true)
    }
    this.isReady = false
    this.messagesApi
      .getAllMessages({
        idMeeting: Number(this.message.IdMeeting),
        page: 0,
        onPage: -1,
        isAvatar: false,
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

  onSubmit(answer: string) {
    this.messagesApi
      .updateAnswerMessageAsync({
        getMessageRequest: {
          IdMeeting: this.message.IdMeeting,
          IdUser: this.message.IdUser,
          Answer: answer,
        },
      })
      .subscribe({
        next: () => {
          this.alert.alertOk(this.translate.instant('Answered successfully'))
          this.refreshDataService.refresh('home')
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }

  resetMeeting($event: boolean) {
    if ($event) {
      this.messagesApi
        .updateAnswerMessageAsync({
          getMessageRequest: {
            IdMeeting: this.message.IdMeeting,
            IdUser: this.message.IdUser,
            Answer: 'readed',
          },
        })
        .subscribe({
          next: () => {
            this.refreshDataService.refresh('home')
            this.refreshDataService.refresh('notification')
          },
          error: () => {
            this.alert.alertNotOk()
          },
        })
    }
  }
}
