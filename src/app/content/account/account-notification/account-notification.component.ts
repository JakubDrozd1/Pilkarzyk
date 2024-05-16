import { UserService } from 'src/app/service/user/user.service'
import { NotificationsApi } from './../../../../../libs/api-client/api/notifications.api'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { NOTIFICATION } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { FormsModule } from '@angular/forms'

function areNotificationsEqual(
  notification1: NOTIFICATION,
  notification2: NOTIFICATION
): boolean {
  return (
    notification1.MEETING_NOTIFICATION === notification2.MEETING_NOTIFICATION &&
    notification1.GROUP_INV_NOTIFICATION ===
      notification2.GROUP_INV_NOTIFICATION &&
    notification1.MEETING_ORGANIZER_NOTIFICATION ===
      notification2.MEETING_ORGANIZER_NOTIFICATION &&
    notification1.TEAM_NOTIFICATION === notification2.TEAM_NOTIFICATION &&
    notification1.UPDATE_MEETING_NOTIFICATION ===
      notification2.UPDATE_MEETING_NOTIFICATION &&
    notification1.TEAM_ORGANIZER_NOTIFICATION ===
      notification2.TEAM_ORGANIZER_NOTIFICATION &&
    notification1.GROUP_ADD_NOTIFICATION ===
      notification2.GROUP_ADD_NOTIFICATION &&
    notification1.MEETING_CANCEL_NOTIFICATION ===
      notification2.MEETING_CANCEL_NOTIFICATION
  )
}

@Component({
  selector: 'app-account-notification',
  templateUrl: './account-notification.component.html',
  styleUrls: ['./account-notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    TranslateModule,
    RouterLink,
    FormsModule,
  ],
})
export class AccountNotificationComponent implements OnInit {
  notifications!: NOTIFICATION
  notificationsCopy!: NOTIFICATION
  isReady: boolean = true
  areEqual: boolean = true

  constructor(
    private router: Router,
    private notificationsApi: NotificationsApi,
    private userService: UserService,
    private alert: Alert,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    this.isReady = false
    this.notificationsApi
      .getAllNotificationFromUser({
        userId: this.userService.loggedUser.ID_USER ?? 0,
      })
      .subscribe({
        next: (response) => {
          this.notifications = response
          this.notificationsCopy = { ...response }
          this.changeNotification()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = false
        },
      })
  }

  cancel() {
    this.notifications = this.notificationsCopy
    this.router.navigate(['/account'])
  }

  changeNotification() {
    this.areEqual = !areNotificationsEqual(
      this.notifications,
      this.notificationsCopy
    )
  }

  addNotification() {
    this.isReady = false

    this.notificationsApi
      .addNotificationToUser({
        getNotificationRequest: {
          IdUser: this.userService.loggedUser.ID_USER,
          MeetingNotification: this.notifications.MEETING_NOTIFICATION,
          GroupInvNotification: this.notifications.GROUP_INV_NOTIFICATION,
          MeetingOrganizerNotification:
            this.notifications.MEETING_ORGANIZER_NOTIFICATION,
          TeamNotofication: this.notifications.TEAM_NOTIFICATION,
          UpdateMeetingNotification:
            this.notifications.UPDATE_MEETING_NOTIFICATION,
          TeamOrganizerNotification:
            this.notifications.TEAM_ORGANIZER_NOTIFICATION,
          GroupAddNotification: this.notifications.GROUP_ADD_NOTIFICATION,
          MeetingCancelNotification:
            this.notifications.MEETING_CANCEL_NOTIFICATION,
        },
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Changes successfully saved')
          )
          this.isReady = true
          this.getDetails()
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }
}
