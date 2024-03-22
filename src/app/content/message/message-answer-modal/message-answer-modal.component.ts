import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertController, IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetMeetingGroupsResponse,
  MESSAGES,
  MeetingsApi,
  MessagesApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'

@Component({
  selector: 'app-message-answer-modal',
  templateUrl: './message-answer-modal.component.html',
  styleUrls: ['./message-answer-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class MessageAnswerModalComponent implements OnInit {
  displayDate: string = ''
  messageForm: FormGroup
  maxDate: string = ''
  idMessage: number = 0
  message!: MESSAGES
  isReady: boolean = true
  meeting!: GetMeetingGroupsResponse
  lang: string = ''
  idMeeting: number = 0
  idGroup: number = 0

  constructor(
    private fb: FormBuilder,
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private meetingsApi: MeetingsApi,
    private router: Router
  ) {
    this.displayDate = moment().format()
    this.messageForm = this.fb.group({
      dateMeeting: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.lang = localStorage.getItem('langUser') ?? 'en'
    this.route.params.subscribe((params) => {
      if (params?.['idMessage'] > 0) {
        this.idMessage = parseInt(params?.['idMessage'])
        this.getDetails()
      }
    })
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
      }
    })
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
      }
    })
    this.messageForm.get('dateMeeting')?.setValue(moment().format())
  }

  getDetails() {
    this.isReady = false
    this.messagesApi
      .getMessageById({
        messageId: this.idMessage,
      })
      .subscribe({
        next: (response) => {
          this.message = response
          this.meetingsApi
            .getMeetingById({
              meetingId: response.IDMEETING ?? 0,
            })
            .subscribe({
              next: (response) => {
                this.maxDate = moment(response.DateMeeting)
                  .clone()
                  .subtract(2, 'hours')
                  .format()
                this.isReady = true
              },
              error: (error) => {
                this.cancel()
                this.isReady = true
                this.alert.handleError(error)
              },
            })
        },
        error: (error) => {
          this.isReady = true
          this.cancel()
          this.alert.handleError(error)
        },
      })
  }

  onSubmitWait() {
    this.messageForm.markAllAsTouched()
    if (this.messageForm.valid) {
      this.isReady = false
      this.messagesApi
        .updateAnswerMessage({
          getMessageRequest: {
            IdMeeting: this.message.IDMEETING,
            IdUser: this.message.IDUSER,
            Answer: 'wait',
            WaitingTime: this.messageForm.value.dateMeeting,
          },
        })
        .subscribe({
          next: () => {
            this.alert.presentToast(
              this.translate.instant('Answered successfully')
            )
            this.refreshDataService.refresh('notification')
            this.refreshDataService.refresh('calendar')
            this.isReady = true
            this.cancel()
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
            this.cancel()
          },
        })
    }
  }

  cancel() {
    if (window.location.pathname.includes('message')) {
      var answerPath = '/meeting/' + this.idMeeting + '/message'
    } else {
      var answerPath = '/meeting/' + this.idMeeting
    }
    if (window.location.pathname.includes('home')) {
      this.router.navigate(['/home' + answerPath])
    }
    if (window.location.pathname.includes('groups')) {
      this.router.navigate(['/groups/' + this.idGroup + answerPath])
    }
    if (window.location.pathname.includes('notification')) {
      if (window.location.pathname.includes('meeting')) {
        this.router.navigate(['/notification' + answerPath])
      } else {
        this.router.navigate(['/notification'])
      }
    }
    if (window.location.pathname.includes('calendar')) {
      this.router.navigate(['/calendar' + answerPath])
    }
  }
}
