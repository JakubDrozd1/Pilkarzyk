import { CommonModule, DatePipe } from '@angular/common'
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
import { Router, RouterLink } from '@angular/router'
import { UserService } from 'src/app/service/user/user.service'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

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
  @Input() component: string = ''

  acceptMeeting: Number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  userAnswer: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false
  defautAnswer!: GetMessagesUsersMeetingsResponse
  public changeButtons = [
    {
      text: this.translate.instant('Save'),
      role: 'confirm',
      handler: () => {
        this.updateAnswer()
      },
    },
  ]
  public changeInputs: any
  selectedValue: string = ''

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    public translate: TranslateService,
    private userService: UserService,
    private router: Router,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    this.messagesApi
      .getAllMessages({
        idMeeting: Number(this.meeting.IdMeeting),
        page: 0,
        onPage: -1,
        isAvatar: false,
      })
      .subscribe({
        next: (response) => {
          this.userAnswer = response.filter(
            (message) => message.IdUser === this.userService.loggedUser.ID_USER
          )

          this.defautAnswer = this.userAnswer[0]
          this.filteredMessages = response.filter(
            (message) => message.Answer === 'yes'
          )
          this.acceptMeeting = this.filteredMessages.length
          this.setInputs()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  setInputs() {
    this.changeInputs = [
      {
        label: this.translate.instant('I WILL COME'),
        type: 'radio',
        value: 'yes',
        checked: this.defautAnswer.Answer == 'yes',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('I WONT COME'),
        type: 'radio',
        value: 'no',
        checked: this.defautAnswer.Answer == 'no',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('GIVE ME TIME'),
        type: 'radio',
        value: 'wait',
        checked: this.defautAnswer.Answer == 'wait',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
    ]
  }

  updateAnswer() {
    if (this.selectedValue == 'yes' || this.selectedValue == 'no') {
      this.messagesApi
        .updateAnswerMessageAsync({
          getMessageRequest: {
            IdMeeting: this.meeting.IdMeeting,
            IdUser: this.userService.loggedUser.ID_USER,
            Answer: this.selectedValue,
          },
        })
        .subscribe({
          next: (response) => {
            this.alert.alertOk(this.translate.instant('Updated successfully'))
            this.refreshDataService.refresh('calendar')
            this.refreshDataService.refresh('groups-content')
          },
          error: (error) => {
            this.alert.handleError(error)
          },
        })
    } else if (this.selectedValue == 'wait') {
      this.router.navigate(['/message-add', this.defautAnswer.IdMessage])
    }
  }
}
