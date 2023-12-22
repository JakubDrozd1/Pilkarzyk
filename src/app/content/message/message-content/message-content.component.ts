import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { GetMeetingUsersResponse, MessagesApi } from 'libs/api-client'
import * as moment from 'moment'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
})
export class MessageContentComponent implements OnInit {
  @Output() messageUpdate: EventEmitter<GetMeetingUsersResponse> =
    new EventEmitter()

  @Input() message!: GetMeetingUsersResponse

  displayDate: string = ''
  messageForm: FormGroup
  maxDate: string = ''

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    this.messageForm = this.fb.group({
      dateMeeting: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.displayDate = moment().format()
    this.maxDate = moment(this.message.DateMeeting)
      .clone()
      .subtract(2, 'hours')
      .format()
    this.messageForm
      .get('dateMeeting')
      ?.setValue(moment().locale('pl').format())
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
          this.messageUpdate.emit(this.message)
          this.refreshDataService.refresh('notification')
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }

  onSubmitWait() {
    this.messageForm.markAllAsTouched()
    if (this.messageForm.valid) {
      this.messagesApi
        .updateAnswerMessageAsync({
          getMessageRequest: {
            IdMeeting: this.message.IdMeeting,
            IdUser: this.message.IdUser,
            Answer: 'wait',
            WaitingTime: this.messageForm.value.dateMeeting,
          },
        })
        .subscribe({
          next: () => {
            this.alert.alertOk('Odpowiedziano pomyślnie')
            this.messageUpdate.emit(this.message)
            this.refreshDataService.refresh('notification')
            this.cancel()
          },
          error: () => {
            this.alert.alertNotOk()
            this.cancel()
          },
        })
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }
}
