import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GetMeetingUsersGroupsResponse, MeetingsApi } from 'libs/api-client';
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component';
import * as moment from 'moment';
import { Alert } from 'src/app/helper/alert';

@Component({
  selector: 'app-calendar-content',
  templateUrl: './calendar-content.component.html',
  styleUrls: ['./calendar-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, MeetingContentComponent],
  providers: [DatePipe],
})
export class CalendarContentComponent implements OnInit {

  meetings: GetMeetingUsersGroupsResponse[] = []
  meetingsSelected: GetMeetingUsersGroupsResponse[] = []
  isReady: boolean = false
  highlightedDates: any
  selectedDate: string[] | undefined
  idUser: number = 0

  constructor
    (
      private meetingsApi: MeetingsApi,
      private datePipe: DatePipe,
      private alert: Alert
    ) { }

  ngOnInit() {
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getDetails()
  }

  getDetails() {
    this.meetings = []
    this.meetingsApi.getAllMeetings({
      page: 0,
      onPage: -1,
      sortColumn: 'DATE_MEETING',
      sortMode: 'ASC',
      idUser: this.idUser
    }).subscribe({
      next: (response) => {
        this.meetings = response
        this.highlightedDates = response
          .map(item => ({
            date: this.formatDate(item.DateMeeting),
            textColor: 'var(--ion-color-secondary-contrast)',
            backgroundColor: 'var(--ion-color-secondary)'
          }))
          .filter((dateObj, index, self) => {
            const dateStr = dateObj.date
            return self.findIndex(d => d.date === dateStr) === index
          })
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.meetings = []
        this.isReady = true
      }
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
        const startOfDay = moment(date).startOf('day').format()
        const endOfDay = moment(date).endOf('day').format()
        this.meetingsApi.getAllMeetings({
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          dateFrom: startOfDay,
          dateTo: endOfDay,
          idUser: this.idUser
        }).subscribe({
          next: (response) => {
            for (let meeting of response) {
              this.meetingsSelected.push(meeting)
            }
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.meetingsSelected = []
            this.isReady = true
          }
        })
      }
    }
  }
}
