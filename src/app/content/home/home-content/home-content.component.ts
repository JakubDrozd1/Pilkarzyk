import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GetMeetingUsersResponse, GetMessagesUsersMeetingsResponse, MessagesApi, UsersMeetingsApi } from 'libs/api-client';
import * as moment from 'moment';
import { Observable, Subscription, forkJoin, interval } from 'rxjs';
import { MeetingContentComponent } from "../../meeting/meeting-content/meeting-content.component";
import { Alert } from 'src/app/helper/alert';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';
import { GetMeetingUsersGroupsResponse } from 'libs/api-client/model/get-meeting-users-groups-response';
import { TimeService } from 'src/app/service/time/time.service';
import { NotificationService } from 'src/app/service/notification/notification.service';
import { MessageContentComponent } from "../../message/message-content/message-content.component";
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/service/data/data.service';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeetingContentComponent, MessageContentComponent, FormsModule]
})
export class HomeContentComponent implements OnInit, OnDestroy {

  idUser: number = 0
  meetings: GetMeetingUsersGroupsResponse[] = []
  isReady: boolean = false
  currentTime: string = ''
  private subscription: Subscription = new Subscription()
  private intervalSubscription: Subscription | undefined
  meetingNotifications!: Observable<number>
  private meetingNotificationSubscription: Subscription = new Subscription()
  messagesNotification: GetMeetingUsersResponse[] = []
  messages: GetMessagesUsersMeetingsResponse[] = []
  selectedSegment: string = 'notification'
  delay: number = 2

  constructor
    (
      private usersMeetingsApi: UsersMeetingsApi,
      private alert: Alert,
      private refreshDataService: RefreshDataService,
      private timeService: TimeService,
      private messagesApi: MessagesApi,
      public notificationService: NotificationService,
      private dataService: DataService,
    ) { }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'home') {
            this.reload()
          }
        }
      )
    )
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'home-leave') {
            this.leave()
          }
        }
      )
    )
    this.timeService.updateCurrentTime()
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.timeService.updateCurrentTime()
    })
    this.timeService.currentTime$.subscribe((currentTime) => {
      this.currentTime = currentTime
    })
    this.meetingNotificationSubscription = this.notificationService.getMeetingNotifications().subscribe(
      (notification) => {
        this.getNotification(notification.userid, notification.meetingid)
      }
    )
    this.idUser = Number(localStorage.getItem("user_id"))
    this.getDetails()
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe()
    }
    this.meetingNotificationSubscription.unsubscribe()
  }

  getDetails() {
    this.meetings = []
    const startOfDay = moment().startOf('day').format()
    const endOfDay = moment().endOf('day').format()

    forkJoin([
      this.usersMeetingsApi.getListMeetingsUsersAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: startOfDay,
        dateTo: endOfDay,
        idUser: this.idUser,
        answer: "yes"
      }),
      this.messagesApi.getAllMessages({
        idUser: this.idUser,
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: moment().add(this.delay, 'hours').format()
      })
    ]).subscribe({
      next: ([meetingsResponse, messagesResponse]) => {
        this.meetings = meetingsResponse
        this.messages = messagesResponse.filter(message => message.Answer === "readed")
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      }
    })
  }

  reload() {
    this.idUser = Number(localStorage.getItem("user_id"))
    this.getDetails()
  }

  leave() {
    for (let message of this.messagesNotification) {
      this.messagesApi.updateAnswerMessageAsync({
        getMessageRequest: {
          IdMeeting: message.IdMeeting,
          IdUser: message.IdUser,
          Answer: "readed"
        }
      }).subscribe({
        next: () => {
          this.messagesNotification = []
          this.dataService.sendData(this.messagesNotification.length)
        },
        error: () => {
          this.alert.alertNotOk()
        }
      })
    }
  }

  getNotification(idUserNotification: number, idMeetingNotification: number) {
    if (idUserNotification == this.idUser && idMeetingNotification != 0) {
      this.usersMeetingsApi.getUserWithMeeting({
        userId: idUserNotification,
        meetingId: idMeetingNotification
      }).subscribe({
        next: (response) => {
          this.messagesNotification.push(response)
          this.dataService.sendData(this.messagesNotification.length)
        }
      })
    }
  }

  updateNotification($event: GetMeetingUsersResponse) {
    const indexToRemove = this.messagesNotification.findIndex((item) => {
      return (Object.keys($event) as Array<keyof GetMeetingUsersResponse>).every(key => $event[key] === item[key]);
    });
    if (indexToRemove !== -1) {
      this.messagesNotification.splice(indexToRemove, 1);
    }
  }

}
