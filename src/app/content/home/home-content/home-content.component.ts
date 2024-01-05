import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  UsersMeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Subscription, forkJoin, interval } from 'rxjs'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TimeService } from 'src/app/service/time/time.service'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { FormsModule } from '@angular/forms'
import { MessageWaitingContentComponent } from '../../message/message-waiting-content/message-waiting-content.component'
import { UserService } from 'src/app/service/user/user.service'

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MeetingContentComponent,
    MessageContentComponent,
    FormsModule,
    MessageWaitingContentComponent,
  ],
})
export class HomeContentComponent implements OnInit, OnDestroy {
  meetings: GetMeetingGroupsResponse[] = []
  meetingsWaiting: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  currentTime: string = ''
  private subscription: Subscription = new Subscription()
  private intervalSubscription: Subscription | undefined
  messages: GetMessagesUsersMeetingsResponse[] = []
  selectedSegment: string = 'waiting'

  constructor(
    private usersMeetingsApi: UsersMeetingsApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private timeService: TimeService,
    public notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'home') {
          this.reload()
        }
      })
    )
    this.timeService.updateCurrentTime()
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.timeService.updateCurrentTime()
    })
    this.timeService.currentTime$.subscribe((currentTime) => {
      this.currentTime = currentTime
    })
    this.getDetails()
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe()
    }
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
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
      }),
      this.usersMeetingsApi.getListMeetingsUsersAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        idUser: this.userService.loggedUser.ID_USER,
        dateFrom: moment().add(2, 'hours').format(),
        answer: 'wait',
      }),
    ]).subscribe({
      next: ([meetingsResponse, meetingWaitResponse]) => {
        this.meetings = meetingsResponse
        this.meetingsWaiting = meetingWaitResponse
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      },
    })
  }

  reload() {
    this.isReady = false
    this.getDetails()
  }
}
