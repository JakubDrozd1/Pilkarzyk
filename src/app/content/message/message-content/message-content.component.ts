import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
        IdMeeting: this.message.IdUser,
        IdUser: this.message.IdMeeting,
        Answer: answer
      }
    }).subscribe({
      next: () => {
        this.alert.alertOk("Odpowiedziano pomyślnie")
        this.refreshDataService.refresh('home')
      },
      error: () => {
        this.alert.alertNotOk()
      }
    })
  }
}
