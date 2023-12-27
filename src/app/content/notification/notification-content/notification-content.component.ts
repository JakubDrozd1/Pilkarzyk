import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingUsersResponse,
  GetMessagesUsersMeetingsResponse,
  MessagesApi,
  UsersMeetingsApi,
} from 'libs/api-client'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { Observable, Subscription, forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { DataService } from 'src/app/service/data/data.service'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import * as moment from 'moment'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-notification-content',
  templateUrl: './notification-content.component.html',
  styleUrls: ['./notification-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MessageContentComponent, FormsModule],
})
export class NotificationContentComponent implements OnInit, OnDestroy {
  messagesNotification: GetMeetingUsersResponse[] = []
  messages: GetMessagesUsersMeetingsResponse[] = []
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  private meetingNotificationSubscription: Subscription = new Subscription()
  idUser: number = 0
  isReady: boolean = false
  selectedSegment: string = 'meetings'
  delay: number = 2

  constructor(
    private usersMeetingsApi: UsersMeetingsApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private messagesApi: MessagesApi,
    public notificationService: NotificationService,
    private dataService: DataService
  ) {}

  ngOnDestroy(): void {
    this.meetingNotificationSubscription.unsubscribe()
  }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'notification-leave') {
          this.leave()
        }
      })
    )
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'notification') {
          this.reload()
        }
      })
    )
    this.meetingNotificationSubscription = this.notificationService
      .getMeetingNotifications()
      .subscribe((notification) => {
        this.getNotification(notification.userid, notification.meetingid)
      })

    this.idUser = Number(localStorage.getItem('user_id'))
    this.getDetails()
  }

  reload() {
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getDetails()
  }

  getNotification(idUserNotification: number, idMeetingNotification: number) {
    if (idUserNotification == this.idUser && idMeetingNotification != 0) {
      this.usersMeetingsApi
        .getUserWithMeeting({
          userId: idUserNotification,
          meetingId: idMeetingNotification,
        })
        .subscribe({
          next: (response) => {
            this.messagesNotification.push(response)
            this.dataService.sendData(this.messagesNotification.length)
          },
        })
    }
  }

  updateNotification($event: GetMeetingUsersResponse) {
    const indexToRemove = this.messagesNotification.findIndex((item) => {
      return (
        Object.keys($event) as Array<keyof GetMeetingUsersResponse>
      ).every((key) => $event[key] === item[key])
    })
    if (indexToRemove !== -1) {
      this.messagesNotification.splice(indexToRemove, 1)
      this.dataService.sendData(this.messagesNotification.length)
    }
  }

  leave() {
    for (let message of this.messagesNotification) {
      this.messagesApi
        .updateAnswerMessageAsync({
          getMessageRequest: {
            IdMeeting: message.IdMeeting,
            IdUser: message.IdUser,
            Answer: 'readed',
          },
        })
        .subscribe({
          next: () => {
            this.messagesNotification = []
            this.dataService.sendData(this.messagesNotification.length)
          },
          error: () => {
            this.alert.alertNotOk()
          },
        })
    }
  }

  getDetails() {
    forkJoin([
      this.messagesApi.getAllMessages({
        idUser: this.idUser,
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: moment().add(this.delay, 'hours').format(),
      }),
    ]).subscribe({
      next: ([messagesResponse]) => {
        this.messages = messagesResponse.filter(
          (message) => message.Answer === 'readed'
        )
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      },
    })
  }
}
