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
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  UsersMeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Subscription, interval } from 'rxjs'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TimeService } from 'src/app/service/time/time.service'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { FormsModule } from '@angular/forms'
import { MessageWaitingContentComponent } from '../../message/message-waiting-content/message-waiting-content.component'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent } from '@ionic/core'

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeContentComponent implements OnInit, OnDestroy {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  meetings: GetMeetingGroupsResponse[] = []
  meetingsWaiting: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  currentTime: string = ''
  private subscription: Subscription = new Subscription()
  private intervalSubscription: Subscription | undefined
  messages: GetMessagesUsersMeetingsResponse[] = []
  segmentList: Array<string> = ['waiting', 'meetings']
  selectedSegment: string = this.segmentList[0]

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
    if (this.selectedSegment == 'waiting') {
      this.meetingsWaiting = []
      this.usersMeetingsApi
        .getListMeetingsUsersAsync({
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          idUser: this.userService.loggedUser.ID_USER,
          dateFrom: moment().add(2, 'hours').format(),
          answer: 'wait',
        })
        .subscribe({
          next: (response) => {
            this.meetingsWaiting = response
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    } else if (this.selectedSegment == 'meetings') {
      this.meetings = []
      const startOfDay = moment().startOf('day').format()
      const endOfDay = moment().endOf('day').format()
      this.usersMeetingsApi
        .getListMeetingsUsersAsync({
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          dateFrom: startOfDay,
          dateTo: endOfDay,
          idUser: this.userService.loggedUser.ID_USER,
          answer: 'yes',
        })
        .subscribe({
          next: (response) => {
            this.meetings = response
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    }
  }

  reload() {
    this.isReady = false
    this.getDetails()
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.reload()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
    }
    this.reload()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
