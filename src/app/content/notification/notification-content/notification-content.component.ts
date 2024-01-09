import { CommonModule } from '@angular/common'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import {
  GetGroupInviteResponse,
  GetMeetingUsersResponse,
  GetMessagesUsersMeetingsResponse,
  GroupInvitesApi,
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
import { GroupsInviteComponent } from '../../groups/groups-invite/groups-invite.component'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-notification-content',
  templateUrl: './notification-content.component.html',
  styleUrls: ['./notification-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MessageContentComponent,
    FormsModule,
    GroupsInviteComponent,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationContentComponent implements OnInit, OnDestroy {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  messagesNotification: GetMeetingUsersResponse[] = []
  messages: GetMessagesUsersMeetingsResponse[] = []
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  private meetingNotificationSubscription: Subscription = new Subscription()
  isReady: boolean = false
  delay: number = 2
  invite: GetGroupInviteResponse[] = []
  segmentList: Array<string> = ['meetings', 'groups']
  selectedSegment: string = this.segmentList[0]

  constructor(
    private usersMeetingsApi: UsersMeetingsApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private messagesApi: MessagesApi,
    public notificationService: NotificationService,
    private dataService: DataService,
    private groupInvite: GroupInvitesApi,
    private userService: UserService,
    public translate: TranslateService
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

    this.getDetails()
  }

  reload() {
    this.isReady = false
    this.getDetails()
  }

  getNotification(idUserNotification: number, idMeetingNotification: number) {
    if (
      idUserNotification == this.userService.loggedUser.ID_USER &&
      idMeetingNotification != 0
    ) {
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
      this.isReady = false
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
    if (this.selectedSegment == 'meetings') {
      this.messagesApi
        .getAllMessages({
          idUser: this.userService.loggedUser.ID_USER,
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          dateFrom: moment().add(this.delay, 'hours').format(),
        })
        .subscribe({
          next: (response) => {
            this.messages = response.filter(
              (message) =>
                message.Answer === 'readed' || message.Answer === null
            )
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    } else if (this.selectedSegment == 'groups') {
      this.groupInvite
        .getGroupInviteByIdUserAsync({
          userId: Number(this.userService.loggedUser.ID_USER),
        })
        .subscribe({
          next: (response) => {
            this.invite = response
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    }
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.leave()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
    }
    this.leave()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
