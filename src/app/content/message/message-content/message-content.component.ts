import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import {
  GROUPS,
  GetMeetingUsersResponse,
  GetMessagesUsersMeetingsResponse,
  GroupsApi,
  MessagesApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MeetingUserListComponent } from '../../meeting/meeting-user-list/meeting-user-list.component'
import { RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { CountdownComponent } from '../../../helper/countdown/countdown.component'
import * as moment from 'moment'

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
    CountdownComponent,
  ],
})
export class MessageContentComponent implements OnInit {
  @Output() messageUpdate: EventEmitter<any> = new EventEmitter()

  @Input() message!: GetMessagesUsersMeetingsResponse
  acceptMeeting: number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = true
  group!: GROUPS
  user!: USERS
  temp: File | null = null
  image: string = ''
  currentDate!: Date
  futureDate!: Date
  isToastOpen = false
  public toastButtons = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ]

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    public translate: TranslateService,
    private usersApi: UsersApi,
    private groupsApi: GroupsApi
  ) {}

  ngOnInit() {
    this.currentDate = moment().toDate()
    this.futureDate = moment(this.message.WaitingTime).toDate()
    if (this.currentDate >= this.futureDate) {
      this.resetMeeting(true)
    }
    this.getDetails()
  }

  getDetails() {
    this.isReady = false
    forkJoin({
      messages: this.messagesApi.getAllMessages({
        idMeeting: Number(this.message.IdMeeting),
        page: 0,
        onPage: -1,
        isAvatar: false,
      }),
      user: this.usersApi.getUserById({
        userId: this.message.IdAuthor ?? 0,
      }),
      group: this.groupsApi.getGroupById({
        groupId: this.message.IdGroup ?? 0,
      }),
    }).subscribe({
      next: (responses) => {
        this.filteredMessages = responses.messages.filter(
          (message) => message.Answer === 'yes'
        )
        this.acceptMeeting = this.filteredMessages.length
        this.user = responses.user
        this.group = responses.group
        const base64String = responses.user.AVATAR
        if (base64String != null) {
          convertBase64ToFile(base64String).then((file) => {
            this.temp = file
            const reader = new FileReader()
            reader.onload = () => {
              this.image = reader.result as string
              this.isReady = true
            }
            reader.readAsDataURL(this.temp)
          })
        } else {
          this.isReady = true
        }
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isReady = true
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
          this.alert.presentToast(
            this.translate.instant('Answered successfully')
          )
          this.refreshDataService.refresh('notification')
          if (
            answer == 'yes' &&
            this.acceptMeeting >= (this.message.Quantity ?? 0)
          ) {
            this.alert.presentInfinityToast(
              this.translate.instant('Full meeting')
            )
          }
          this.messageUpdate.emit()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
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
          error: (error) => {
            this.alert.handleError(error)
          },
        })
    }
  }
}
