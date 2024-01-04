import { CommonModule, DatePipe } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import {
  GetMeetingGroupsResponse,
  MeetingsApi,
  UsersMeetingsApi,
} from 'libs/api-client'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import * as moment from 'moment'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription } from 'rxjs'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { UserService } from 'src/app/service/user/user.service'

@Component({
  selector: 'app-calendar-content',
  templateUrl: './calendar-content.component.html',
  styleUrls: ['./calendar-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, MeetingContentComponent],
  providers: [DatePipe],
})
export class CalendarContentComponent implements OnInit {
  meetings: GetMeetingGroupsResponse[] = []
  meetingsSelected: GetMeetingGroupsResponse[] = []
  isReady: boolean = false
  highlightedDates: any
  selectedDate: string[] | undefined
  private subscription: Subscription = new Subscription()

  constructor(
    private meetingsApi: MeetingsApi,
    private datePipe: DatePipe,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private usersMeetingsApi: UsersMeetingsApi,
    public notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'calendar') {
          this.reload()
        }
      })
    )
    this.getDetails()
  }

  getDetails() {
    this.meetings = []
    this.usersMeetingsApi
      .getListMeetingsUsersAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        idUser: this.userService.loggedUser.ID_USER,
        answer: 'yes',
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
        },
        error: () => {
          this.alert.alertNotOk()
          this.meetings = []
          this.isReady = true
        },
      })
  }

  formatDate(date: string | null | undefined): string {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return formattedDate || ''
  }

  onDateChange(newDate: string[]) {
    this.meetingsSelected = []
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
          })
          .subscribe({
            next: (response) => {
              for (let meeting of response) {
                this.meetingsSelected.push(meeting)
              }
              console.log(this.meetingsSelected)
              this.isReady = true
            },
            error: () => {
              this.alert.alertNotOk()
              this.meetingsSelected = []
              this.isReady = true
            },
          })
      }
    }
  }

  reload() {
    this.getDetails()
  }
}
