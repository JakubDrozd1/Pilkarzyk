import { CommonModule, DatePipe } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  MeetingsApi,
} from 'libs/api-client'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import * as moment from 'moment'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription } from 'rxjs'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { IonRefresherCustomEvent } from '@ionic/core'
import { NotificationService } from 'src/app/service/notification/notification.service'

@Component({
  selector: 'app-calendar-content',
  templateUrl: './calendar-content.component.html',
  styleUrls: ['./calendar-content.component.scss'],
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MeetingContentComponent,
    SpinnerComponent,
    TranslateModule,
  ],
})
export class CalendarContentComponent implements OnInit {
  meetings: GetMeetingGroupsResponse[] = []
  meetingsSelected: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  highlightedDates: any
  selectedDate: string[] = []
  private subscription: Subscription = new Subscription()
  isReadyRefresh: boolean = false
  lang: string = ''

  constructor(
    private meetingsApi: MeetingsApi,
    private datePipe: DatePipe,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private userService: UserService,
    public translate: TranslateService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'calendar') {
          this.reload()
        }
      })
    )
    this.lang = localStorage.getItem('lang') ?? 'en'
    this.getDetails()
  }

  getDetails() {
    this.meetings = []
    this.isReady = false
    this.meetingsApi
      .getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
        withMessages: true,
      })
      .subscribe({
        next: (response) => {
          this.meetings = response.filter((item) => {
            const currentDate = moment()
            const meetingDate = moment(item.DateMeeting)
            return meetingDate.isSameOrAfter(currentDate, 'day')
          })
          this.highlightedDates = response
            .map((item) => {
              const meetingDate = moment(item.DateMeeting)
              const currentDate = moment()
              let textColor, backgroundColor
              if (meetingDate.isBefore(currentDate, 'day')) {
                textColor = 'var(--ion-color-tertiary-contrast)'
                backgroundColor = 'var( --ion-color-tertiary)'
              } else if (meetingDate.isAfter(currentDate, 'day')) {
                textColor = 'var(--ion-color-secondary-contrast)'
                backgroundColor = 'var(--ion-color-secondary)'
              } else {
                textColor = 'var(--ion-color-secondary-contrast)'
                backgroundColor = 'var(--ion-color-secondary)'
              }
              return {
                date: this.formatDate(item.DateMeeting),
                textColor: textColor,
                backgroundColor: backgroundColor,
              }
            })
            .filter((dateObj, index, self) => {
              const dateStr = dateObj.date
              return self.findIndex((d) => d.date === dateStr) === index
            })
          this.isReady = true
          this.isReadyRefresh = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.meetings = []
          this.isReady = true
          this.isReadyRefresh = true
        },
      })
  }

  formatDate(date: string | null | undefined): string {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return formattedDate || ''
  }

  onDateChange(newDate: string) {
    this.meetingsSelected = []
    this.isReadyRefresh = false
    if (newDate != null) {
      for (let date of newDate) {
        const startOfDay = moment(date).startOf('day').add(1, 'hours').format()
        const endOfDay = moment(date).endOf('day').add(1, 'hours').format()
        this.meetingsApi
          .getAllMeetings({
            page: 0,
            onPage: -1,
            sortColumn: 'DATE_MEETING',
            sortMode: 'ASC',
            dateFrom: startOfDay,
            dateTo: endOfDay,
            answer: 'yes',
            idUser: this.userService.loggedUser.ID_USER,
            withMessages: true,
          })
          .subscribe({
            next: (response) => {
              for (let meeting of response) {
                this.meetingsSelected.push(meeting)
              }
              this.isReadyRefresh = true
            },
            error: (error) => {
              this.alert.handleError(error)
              this.meetingsSelected = []
              this.isReadyRefresh = true
            },
          })
      }
    } else {
      this.isReadyRefresh = true
    }
  }

  reload() {
    this.isReady = false
    this.isReadyRefresh = false
    this.getDetails()
  }

  reset() {
    this.selectedDate = []
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
