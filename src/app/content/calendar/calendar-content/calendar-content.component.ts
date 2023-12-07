import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { GetMeetingUsersGroupsResponse, MeetingsApi } from 'libs/api-client';
import { UserService } from 'src/app/service/user/user.service';
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component';
import * as moment from 'moment';

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
  selectedDate: string[] | undefined;

  constructor
    (
      private meetingsApi: MeetingsApi,
      private userService: UserService,
      private alertController: AlertController,
      private datePipe: DatePipe
    ) { }

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    this.meetings = []
    this.meetingsApi.getAllMeetings({
      page: 0,
      onPage: -1,
      sortColumn: 'DATE_MEETING',
      sortMode: 'ASC',
      idUser: this.userService.userDetails?.ID_USER
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
            const dateStr = dateObj.date;
            return self.findIndex(d => d.date === dateStr) === index;
          });
        this.isReady = true;
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Błąd',
          message: 'Wystąpił błąd',
          buttons: ['Ok'],
        });
        this.meetings = []
        this.isReady = true;
        await alert.present();
      }
    });
  }

  formatDate(date: string | null | undefined): string {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return formattedDate || '';
  }

  onDateChange(newDate: string[]) {
    this.meetingsSelected = [];
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
          idUser: this.userService.userDetails?.ID_USER
        }).subscribe({
          next: (response) => {
            for (let meeting of response) {
              this.meetingsSelected.push(meeting)
            }
            this.isReady = true;
          },
          error: async () => {
            const alert = await this.alertController.create({
              header: 'Błąd',
              message: 'Wystąpił błąd',
              buttons: ['Ok'],
            });
            this.meetingsSelected = []
            this.isReady = true;
            await alert.present();
          }
        });
      }
    }
  }
}
