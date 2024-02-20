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
  GroupsUsersApi,
  MeetingsApi,
  UsersMeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Subscription, forkJoin } from 'rxjs'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { FormsModule } from '@angular/forms'
import { MessageWaitingContentComponent } from '../../message/message-waiting-content/message-waiting-content.component'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { RouterLink } from '@angular/router'

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
    TranslateModule,
    SpinnerComponent,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeContentComponent implements OnInit, OnDestroy {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  meetingsActive: GetMeetingGroupsResponse[] = []
  meetingsExpired: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  private subscription: Subscription = new Subscription()
  private intervalSubscription: Subscription | undefined
  messages: GetMessagesUsersMeetingsResponse[] = []
  segmentList: Array<string> = ['meetings', 'waiting']
  selectedSegment: string = this.segmentList[0]
  visitedWaiting: boolean = true
  visitedMeetings: boolean = true
  isOrganizer: boolean = false

  constructor(
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private userService: UserService,
    public translate: TranslateService,
    public notificationService: NotificationService,
    private groupsUsersApi: GroupsUsersApi,
    private meetingsApi: MeetingsApi
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'home') {
          this.reload()
        }
      })
    )
    this.getDetails()
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe()
    }
  }

  getDetails() {
    this.meetingsActive = []
    this.meetingsExpired = []
    forkJoin({
      activeMeeting: this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: moment().format(),
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      }),
      expiredMeetign: this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'DESC',
        dateTo: moment().format(),
        dateFrom: moment().subtract(1, 'month').startOf('day').format(),
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      }),
    }).subscribe({
      next: (responses) => {
        this.meetingsActive = responses.activeMeeting
        console.log(this.meetingsActive)
        this.meetingsExpired = responses.expiredMeetign
        this.isReady = true
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isReady = true
      },
    })
  }

  getPermission() {
    this.groupsUsersApi
      .getAllGroupsFromUserAsync({
        page: 0,
        onPage: -1,
        idUser: this.userService.loggedUser.ID_USER,
        isAvatar: false,
      })
      .subscribe({
        next: (response) => {
          this.isOrganizer =
            response.find((obj) => obj.AccountType === 1) !== undefined
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  reload() {
    this.isReady = false
    this.visitedWaiting = true
    this.visitedMeetings = true
    this.getDetails()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
