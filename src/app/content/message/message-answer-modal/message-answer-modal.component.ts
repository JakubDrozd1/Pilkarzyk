import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GetMeetingUsersResponse, MessagesApi } from 'libs/api-client'
import * as moment from 'moment'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

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
  ],
})
export class MessageAnswerModalComponent implements OnInit {
  @Input() message!: GetMeetingUsersResponse

  displayDate: string = ''
  messageForm: FormGroup
  maxDate: string = ''

  constructor(
    private fb: FormBuilder,
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private modalCtrl: ModalController,
    public translate: TranslateService
  ) {
    this.displayDate = moment().format()
    this.messageForm = this.fb.group({
      dateMeeting: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.messageForm
      .get('dateMeeting')
      ?.setValue(moment().format())
    this.maxDate = moment(this.message.DateMeeting)
      .clone()
      .subtract(2, 'hours')
      .format()
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
            this.alert.alertOk(this.translate.instant('Answered successfully'))
            this.selectMessage(this.message)
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

  selectMessage(message: GetMeetingUsersResponse): void {
    this.modalCtrl.dismiss(message)
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }
}
