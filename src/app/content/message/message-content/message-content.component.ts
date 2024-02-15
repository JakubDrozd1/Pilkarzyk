import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GetMeetingUsersResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { MessageAnswerModalComponent } from '../message-answer-modal/message-answer-modal.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MeetingUserListComponent } from '../../meeting/meeting-user-list/meeting-user-list.component'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    MeetingUserListComponent,
    RouterLink,
  ],
})
export class MessageContentComponent implements OnInit {
  @Output() messageUpdate: EventEmitter<GetMeetingUsersResponse> =
    new EventEmitter()

  @Input() message!: GetMessagesUsersMeetingsResponse
  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = true

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
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
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  onSubmit(answer: string) {
    this.isReady = false
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
          this.refreshDataService.refresh('notification')
          this.messageUpdate.emit(this.message)
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }
}
