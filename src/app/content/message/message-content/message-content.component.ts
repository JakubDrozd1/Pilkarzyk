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
import { MessageAnswerModalComponent } from '../message-answer-modal/message-answer-modal.component'

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

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

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

  async openModalAddWaitingTime() {
    const modal = await this.modalCtrl.create({
      component: MessageAnswerModalComponent,
      componentProps: {
        message: this.message,
      },
    })
    modal.present()
    await modal.onWillDismiss()
    modal.onDidDismiss().then((data) => {
      this.messageUpdate.emit(data.data)
    })
  }
}
