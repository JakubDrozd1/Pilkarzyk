import { CommonModule } from '@angular/common'
import { Component, ElementRef, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  MeetingsApi,
  MessagesApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { forkJoin } from 'rxjs'
import {
  convertBase64ToFile,
  convertStringsToImages,
} from 'src/app/helper/convertBase64ToFile'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import * as moment from 'moment'

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    RouterLink,
    TranslateModule,
  ],
})
export class MeetingDetailsComponent implements OnInit {
  isReady: boolean = false
  idMeeting: number = 0
  meeting!: GetMeetingGroupsResponse
  user!: USERS
  temp: File | null = null
  image: string = ''
  acceptMeeting: number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  images: any[] = []
  counter: number = 5
  defautAnswer!: GetMessagesUsersMeetingsResponse
  public changeInputs: any
  selectedValue: string = ''
  currentDate: any
  public changeButtons = [
    {
      text: this.translate.instant('Save'),
      role: 'confirm',
      handler: () => {
        this.updateAnswer()
      },
    },
  ]
  
  constructor(
    private route: ActivatedRoute,
    private meetingsApi: MeetingsApi,
    private alert: Alert,
    private usersApi: UsersApi,
    private messagesApi: MessagesApi,
    private router: Router,
    public translate: TranslateService,
    private elementRef: ElementRef,
    private refreshDataService: RefreshDataService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.currentDate = moment().toISOString()
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.isReady = false
    this.meetingsApi
      .getMeetingById({
        meetingId: this.idMeeting,
      })
      .subscribe({
        next: (response) => {
          this.meeting = response
          forkJoin({
            messages: this.messagesApi.getAllMessages({
              idMeeting: Number(this.meeting.IdMeeting),
              page: 0,
              onPage: -1,
              isAvatar: true,
            }),
            user: this.usersApi.getUserById({
              userId: this.meeting.IdAuthor ?? 0,
            }),
          }).subscribe({
            next: (responses) => {
              let element: number = this.elementRef.nativeElement.offsetWidth
              this.counter = Math.round(element / 60)
              this.user = responses.user
              this.defautAnswer = responses.messages.filter(
                (message) =>
                  message.IdUser === this.userService.loggedUser.ID_USER
              )[0]
              this.setInputs()
              this.filteredMessages = responses.messages.filter(
                (message) => message.Answer === 'yes'
              )
              this.acceptMeeting = this.filteredMessages.length
              convertStringsToImages(this.filteredMessages).then((files) => {
                this.images = files
              })
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
          })
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  cancel() {
    this.router.navigate(['/home'])
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
          next: () => {
            this.alert.alertOk(this.translate.instant('Updated successfully'))
            this.getDetails()
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
