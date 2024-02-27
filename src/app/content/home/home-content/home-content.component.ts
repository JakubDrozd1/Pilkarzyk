import { CommonModule } from '@angular/common'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  GroupsUsersApi,
  MeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Subscription, forkJoin } from 'rxjs'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { MessageContentComponent } from '../../message/message-content/message-content.component'
import { FormsModule } from '@angular/forms'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { InfiniteScrollCustomEvent, IonRefresherCustomEvent } from '@ionic/core'
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
    TranslateModule,
    SpinnerComponent,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeContentComponent implements OnInit {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  meetingsActive: GetMeetingGroupsResponse[] = []
  meetingsExpired: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  private subscription: Subscription = new Subscription()
  messages: GetMessagesUsersMeetingsResponse[] = []
  segmentList: Array<string> = ['meetings', 'waiting']
  selectedSegment: string = this.segmentList[0]
  visitedWaiting: boolean = true
  visitedMeetings: boolean = true
  isOrganizer: boolean = false
  counter: number = 1
  formattedDateTime: string = ''

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
    this.updateFormattedDateTime()
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
        dateFrom: this.formattedDateTime,
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      }),
      expiredMeetign: this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: 5,
        sortColumn: 'DATE_MEETING',
        sortMode: 'DESC',
        dateTo: moment().format(),
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      }),
    }).subscribe({
      next: (responses) => {
        this.meetingsActive = responses.activeMeeting
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
      .getAllGroupsFromUser({
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
    this.getPermission()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }

  onIonInfinite(ev: InfiniteScrollCustomEvent) {
    this.generateItems()
    setTimeout(() => {
      ;(ev as InfiniteScrollCustomEvent).target.complete()
    }, 500)
  }

  generateItems() {
    this.meetingsApi
      .getAllMeetings({
        page: this.counter,
        onPage: 5,
        sortColumn: 'DATE_MEETING',
        sortMode: 'DESC',
        dateTo: moment().format(),
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      })
      .subscribe({
        next: (response) => {
          this.meetingsExpired = this.meetingsExpired.concat(response)
          this.counter++
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  updateFormattedDateTime() {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = this.formatTwoDigits(currentDate.getMonth() + 1)
    const day = this.formatTwoDigits(currentDate.getDate())
    const hours = this.formatTwoDigits(currentDate.getHours())
    const minutes = this.formatTwoDigits(currentDate.getMinutes())
    const seconds = this.formatTwoDigits(currentDate.getSeconds())
    this.formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }

  private formatTwoDigits(value: number): string {
    return value < 10 ? `0${value}` : value.toString()
  }
}
