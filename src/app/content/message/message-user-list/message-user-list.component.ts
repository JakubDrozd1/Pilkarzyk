import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MeetingUserListComponent } from '../../meeting/meeting-user-list/meeting-user-list.component'
import {
  GUESTS,
  GetMessagesUsersMeetingsResponse,
  GuestsApi,
  MessagesApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { IonRefresherCustomEvent } from '@ionic/core'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription, forkJoin } from 'rxjs'

@Component({
  selector: 'app-message-user-list',
  templateUrl: './message-user-list.component.html',
  styleUrls: ['./message-user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    MeetingUserListComponent,
    SpinnerComponent,
  ],
})
export class MessageUserListComponent implements OnInit {
  idMeeting: number = 0
  messages: GetMessagesUsersMeetingsResponse[] = []
  isReady: boolean = false
  acceptCounter: number = 0
  private subscription: Subscription = new Subscription()
  guests: GUESTS[] = []

  constructor(
    private route: ActivatedRoute,
    private messagesApi: MessagesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private guestsApi: GuestsApi,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.getDetails()
      }
    })
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'message-user-list') {
          this.getDetails()
        }
      })
    )
  }

  getDetails() {
    if (this.idMeeting > 0) {
      this.isReady = false
      forkJoin({
        messages: this.messagesApi.getAllMessages({
          idMeeting: this.idMeeting,
          page: 0,
          onPage: -1,
          isAvatar: true,
          sortColumn: 'DATE_RESPONSE',
          sortMode: 'ASC',
        }),
        guests: this.guestsApi.getAllGuestFromMeeting({
          meetingId: this.idMeeting,
        }),
      }).subscribe({
        next: (responses) => {
          this.messages = responses.guests.map((guest) => ({
            Answer: 'yes',
            Firstname: guest.NAME,
            Surname: this.translate.instant('(GUEST)'),
            IdMeeting: guest.IDMEETING,
            Avatar: null,
            Quantity: responses.messages[0].Quantity,
            IdAuthor: responses.messages[0].IdAuthor,
            IdGuest: guest.ID_GUEST,
          }))
          this.messages = this.messages
            .concat(responses.messages)
            .sort((a, b) => {
              const priority: { [key: string]: number } = {
                yes: 1,
                wait: 2,
                readed: 3,
                no: 4,
                null: 5,
              }
              const answerA = a.Answer || 'null'
              const answerB = b.Answer || 'null'
              return priority[answerA] - priority[answerB]
            })
          this.acceptCounter = responses.messages.filter(
            (message) => message.Answer === 'yes'
          ).length
          this.isReady = true
        },
        error: (error) => {
          this.isReady = true
          this.alert.handleError(error)
        },
      })
    }
  }

  cancel() {
    window.history.back()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
