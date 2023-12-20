import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MessagesApi, UsersMeetingsApi } from 'libs/api-client';
import * as moment from 'moment';
import { Subscription, interval } from 'rxjs';
import { MeetingContentComponent } from "../../meeting/meeting-content/meeting-content.component";
import { Alert } from 'src/app/helper/alert';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';
import { GetMeetingUsersGroupsResponse } from 'libs/api-client/model/get-meeting-users-groups-response';
import { TimeService } from 'src/app/service/time/time.service';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeetingContentComponent]
})
export class HomeContentComponent implements OnInit, OnDestroy {

  idUser: number = 0
  meetings: GetMeetingUsersGroupsResponse[] = []
  isReady: boolean = false
  currentTime: string = ''
  private subscription: Subscription = new Subscription()
  private intervalSubscription: Subscription | undefined

  constructor
    (
      private usersMeetingsApi: UsersMeetingsApi,
      private alert: Alert,
      private refreshDataService: RefreshDataService,
      private timeService: TimeService,
      private messagesApi: MessagesApi
    ) { }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'home') {
            this.reload()
          }
        }
      )
    )
    this.timeService.updateCurrentTime()
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.timeService.updateCurrentTime()
    })
    this.timeService.currentTime$.subscribe((currentTime) => {
      this.currentTime = currentTime
    })
    this.idUser = Number(localStorage.getItem("user_id"))
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
    this.usersMeetingsApi.getListMeetingsUsersAsync({
      page: 0,
      onPage: -1,
      sortColumn: 'DATE_MEETING',
      sortMode: 'ASC',
      dateFrom: startOfDay,
      dateTo: endOfDay,
      idUser: this.idUser
    }).subscribe({
      next: (response) => {
        this.meetings = response
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      }
    })
  }

  reload() {
    this.idUser = Number(localStorage.getItem("user_id"))
    this.getDetails()
  }
  
}
