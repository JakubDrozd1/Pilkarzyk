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
  GetMessagesUsersMeetingsResponse,
  GroupInvitesApi,
  MessagesApi,
  UsersMeetingsApi,
} from 'libs/api-client'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { Observable, Subscription, forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { DataService } from 'src/app/service/data/data.service'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import * as moment from 'moment'
import { FormsModule } from '@angular/forms'
import { GroupsInviteComponent } from '../../groups/groups-invite/groups-invite.component'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

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
    SpinnerComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationContentComponent implements OnInit, OnDestroy {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  messages: GetMessagesUsersMeetingsResponse[] = []
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  private meetingNotificationSubscription: Subscription = new Subscription()
  isReady: boolean = false
  delay: number = 1
  invite: GetGroupInviteResponse[] = []
  segmentList: Array<string> = ['meetings', 'groups']
  selectedSegment: string = this.segmentList[0]
  visitedMeetings: boolean = true
  visitedGroups: boolean = true

  constructor(
    private usersMeetingsApi: UsersMeetingsApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private messagesApi: MessagesApi,
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
    this.getDetails()
  }

  reload() {
    this.isReady = false
    this.visitedGroups = true
    this.visitedMeetings = true
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
            this.messages.unshift(response)
            this.dataService.sendData(
              this.messages.filter((message) => message.Answer === null).length
            )
          },
        })
    }
  }

  updateNotification() {
    this.dataService.sendData(
      this.messages.filter(
        (message) =>
          message.Answer === 'readed' ||
          message.Answer === null ||
          message.Answer === 'wait'
      ).length + this.invite.length
    )
  }

  leave() {
    for (let message of this.messages.filter(
      (message) => message.Answer === null
    )) {
      this.isReady = false
      this.messagesApi
        .updateAnswerMessage({
          getMessageRequest: {
            IdMeeting: message.IdMeeting,
            IdUser: message.IdUser,
            Answer: 'readed',
          },
        })
        .subscribe({
          next: () => {
            this.updateNotification()
          },
          error: (error) => {
            this.alert.handleError(error)
          },
        })
    }
  }

  getDetails() {
    forkJoin({
      messages: this.messagesApi.getAllMessages({
        idUser: this.userService.loggedUser.ID_USER,
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: moment().add(this.delay, 'hours').format(),
        isAvatar: false,
      }),
      invites: this.groupInvite.getGroupInviteByIdUser({
        idUser: Number(this.userService.loggedUser.ID_USER),
        page: 0,
        onPage: -1,
        sortColumn: 'NAME',
        sortMode: 'ASC',
      }),
    }).subscribe({
      next: (responses) => {
        this.messages = responses.messages
          .filter(
            (message) =>
              message.Answer === 'readed' ||
              message.Answer === null ||
              message.Answer === 'wait'
          )
          .sort((a, b) => {
            const priority: { [key: string]: number } = {
              null: 1,
              wait: 2,
              readed: 3,
            }
            const answerA = a.Answer || 'null'
            const answerB = b.Answer || 'null'
            return priority[answerA] - priority[answerB]
          })
        this.updateNotification()
        this.invite = responses.invites
        this.isReady = true
        this.visitedGroups = false
        this.visitedMeetings = false
        this.isReady = true
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isReady = true
        this.visitedMeetings = false
        this.visitedGroups = false
      },
    })
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.leave()
    this.getDetails()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
      this.leave()
      this.getDetails()
    }
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.leave()
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
