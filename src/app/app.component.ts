import { CommonModule } from '@angular/common'
import { Component, NgZone, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { IonicModule } from '@ionic/angular'
import { HttpClientModule } from '@angular/common/http'
import { register } from 'swiper/element/bundle'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { UserService } from './service/user/user.service'
import { GetMeetingUsersResponse, UsersMeetingsApi } from 'libs/api-client'
import { DataService } from './service/data/data.service'
import {
  ActionPerformed,
  PushNotificationActionPerformed,
  PushNotifications,
} from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Device } from '@capacitor/device'

register()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HttpClientModule,
    TranslateModule,
  ],
})
export class AppComponent implements OnInit {
  title = 'pilkarzyk'
  meetingNotificationSubscription: Subscription = new Subscription()
  meeting: GetMeetingUsersResponse[] = []
  lang: string | null = ''

  constructor(
    public translate: TranslateService,
    private userService: UserService,
    private usersMeetingsApi: UsersMeetingsApi,
    private dataService: DataService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.setLanguage()

    if (Capacitor.isNativePlatform()) {
      this.registerNotifications()
      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          this.zone.run(() => {
            if (notification.notification.data.NotificationId) {
              this.router.navigate(['/notification'])
            }

            if (notification.notification.data.MeetingNotificationId) {
              this.router.navigate([
                '/meeting',
                Number(notification.notification.data.MeetingNotificationId),
              ])
            }

            if (notification.notification.data.TeamNotificationId) {
              this.router.navigate([
                '/meeting',
                Number(notification.notification.data.TeamNotificationId),
                'team',
              ])
            }
          })
        }
      )
    }
  }

  async setLanguage() {
    this.lang = localStorage.getItem('langUser')
    if (this.lang == null) {
      if (Capacitor.isNativePlatform()) {
        this.lang = (await Device.getLanguageCode()).value
      } else {
        this.lang = window.navigator.language
      }
      if (this.lang == 'pl' || this.lang == 'en') {
        this.translate.setDefaultLang(this.lang)
        this.translate.use(this.lang)
      } else {
        this.lang = 'en'
        this.translate.setDefaultLang(this.lang)
        this.translate.use(this.lang)
      }
    } else {
      this.translate.setDefaultLang(this.lang)
      this.translate.use(this.lang)
    }
  }

  getNotification(idUserNotification: number, idMeetingNotification: number) {
    if (this.userService.loggedUser != null) {
      if (
        idUserNotification == this.userService.loggedUser.ID_USER &&
        idMeetingNotification != 0
      ) {
        this.usersMeetingsApi
          .getUserWithMeeting({
            userId: idUserNotification,
            meetingId: idMeetingNotification,
          })
          .subscribe({
            next: (response) => {
              this.meeting.push(response)
              this.dataService.sendData(
                this.meeting.filter((meeting) => meeting.Answer === null).length
              )
            },
          })
      }
    }
  }

  registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
      await LocalNotifications.requestPermissions()
    }
    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!')
    }
  }
}
