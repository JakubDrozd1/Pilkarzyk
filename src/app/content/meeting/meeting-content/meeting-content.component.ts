import { CommonModule, DatePipe } from '@angular/common'
import { Component, OnInit, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  GuestsApi,
  MessagesApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { MeetingUserListComponent } from '../meeting-user-list/meeting-user-list.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'

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
  providers: [DatePipe],
})
export class MeetingContentComponent implements OnInit {
  @Input() meeting!: GetMeetingGroupsResponse
  @Input() isCurrent: boolean = true

  acceptMeeting: number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false
  temp: File | null = null
  images: string = ''
  user!: USERS

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    public translate: TranslateService,
    private usersApi: UsersApi,
    private guestsApi: GuestsApi
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    forkJoin({
      messages: this.messagesApi.getAllMessages({
        idMeeting: Number(this.meeting.IdMeeting),
        page: 0,
        onPage: -1,
        isAvatar: false,
      }),
      user: this.usersApi.getUserById({
        userId: this.meeting.IdAuthor ?? 0,
      }),
      guest: this.guestsApi.getAllGuestFromMeeting({
        meetingId: Number(this.meeting.IdMeeting),
      }),
    }).subscribe({
      next: (responses) => {
        this.filteredMessages = responses.messages.filter(
          (message) => message.Answer === 'yes'
        )
        this.user = responses.user
        const base64String = responses.user.AVATAR
        if (base64String != null) {
          convertBase64ToFile(base64String).then((file) => {
            this.temp = file
            const reader = new FileReader()
            reader.onload = () => {
              this.images = reader.result as string
              this.isReady = true
            }
            reader.readAsDataURL(this.temp)
          })
        } else {
          this.isReady = true
        }
        this.acceptMeeting =
          this.filteredMessages.length + responses.guest.length
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isReady = true
      },
    })
  }
}
