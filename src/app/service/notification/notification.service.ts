import { Injectable, OnDestroy, OnInit } from '@angular/core'
import { Subscription, forkJoin, interval } from 'rxjs'
import { GroupInvitesApi, MessagesApi } from 'libs/api-client'
import { UserService } from '../user/user.service'
import * as moment from 'moment'
import { DataService } from '../data/data.service'

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  delay: number = 1
  notificationNumber: number = 0
  refreshSubscription: Subscription = new Subscription()

  constructor(
    private messagesApi: MessagesApi,
    private userService: UserService,
    private groupInvite: GroupInvitesApi,
    private dataService: DataService
  ) {
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.getDetails()
    })
    this.getDetails()
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe()
  }

  getDetails() {
    forkJoin({
      messages: this.messagesApi.getAllMessages({
        idUser: this.userService.loggedUser.ID_USER,
        page: 0,
        onPage: -1,
        dateFrom: moment().add(this.delay, 'hours').format(),
        isAvatar: false,
      }),
      invites: this.groupInvite.getGroupInviteByIdUser({
        page: 0,
        onPage: -1,
        idUser: Number(this.userService.loggedUser.ID_USER),
      }),
    }).subscribe({
      next: (responses) => {
        this.notificationNumber =
          responses.invites.length +
          responses.messages.filter(
            (message) => message.Answer === 'readed' || message.Answer === null
          ).length
        this.dataService.sendData(this.notificationNumber)
      },
      error: () => {
        this.notificationNumber = 0
      },
    })
  }
}
