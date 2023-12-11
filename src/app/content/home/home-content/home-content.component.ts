import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GetMeetingUsersGroupsResponse, MeetingsApi, USERS, UsersApi } from 'libs/api-client';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { MeetingContentComponent } from "../../meeting/meeting-content/meeting-content.component";
import { Alert } from 'src/app/helper/alert';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeetingContentComponent]
})
export class HomeContentComponent implements OnInit {

  idUser: number = 0
  meetings: GetMeetingUsersGroupsResponse[] = []
  user: USERS | undefined
  isReady: boolean = false
  currentTime: string = ''

  constructor
    (
      private usersApi: UsersApi,
      private meetingsApi: MeetingsApi,
      private alert: Alert
    ) { }

  ngOnInit() {
    this.idUser = Number(localStorage.getItem("user_id"))
    this.currentTime = moment().locale('pl').format('DD MMMM YYYY')
    this.getDetails()
  }

  getDetails() {
    this.meetings = []
    const startOfDay = moment().startOf('day').format()
    const endOfDay = moment().endOf('day').format()
    forkJoin([
      this.usersApi.getUserById({ userId: this.idUser }),
      this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        dateFrom: startOfDay,
        dateTo: endOfDay,
        idUser: this.idUser
      })
    ]).subscribe({
      next: ([userResponse, meetingsResponse]) => {
        this.user = userResponse
        this.meetings = meetingsResponse;
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      }
    })
  }
}
