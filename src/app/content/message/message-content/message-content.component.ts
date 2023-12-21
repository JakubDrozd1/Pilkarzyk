import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GetMeetingUsersResponse, MessagesApi } from 'libs/api-client';
import { Alert } from 'src/app/helper/alert';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MessageContentComponent implements OnInit {

  @Output() messageUpdate: EventEmitter<GetMeetingUsersResponse> = new EventEmitter()

  @Input() message!: GetMeetingUsersResponse

  constructor(
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService
  ) { }

  ngOnInit() { }

  onSubmit(answer: string) {
    this.messagesApi.updateAnswerMessageAsync({
      getMessageRequest: {
        IdMeeting: this.message.IdMeeting,
        IdUser: this.message.IdUser,
        Answer: answer
      }
    }).subscribe({
      next: () => {
        this.alert.alertOk("Odpowiedziano pomyślnie")
        this.messageUpdate.emit(this.message)
        this.refreshDataService.refresh('home')
      },
      error: () => {
        this.alert.alertNotOk()
      }
    })
  }
}
