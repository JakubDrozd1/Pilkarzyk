import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { GetMeetingUsersResponse, MessagesApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { CountdownComponent } from '../../../helper/countdown/countdown.component'
import * as moment from 'moment'

@Component({
  selector: 'app-message-waiting-content',
  templateUrl: './message-waiting-content.component.html',
  styleUrls: ['./message-waiting-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CountdownComponent],
})
export class MessageWaitingContentComponent implements OnInit {
  @Input() message!: GetMeetingUsersResponse
  currentDate!: Date
  futureDate!: Date

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.currentDate = moment().toDate()
    this.futureDate = moment(this.message.WaitingTime).toDate()
    if (this.currentDate >= this.futureDate) {
      this.resetMeeting(true)
    }
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
          this.alert.alertOk('Odpowiedziano pomyślnie')
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
