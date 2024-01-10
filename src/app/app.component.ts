import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BackgroundRunner } from '@capacitor/background-runner'
import { Capacitor } from '@capacitor/core'
import { IonicModule } from '@ionic/angular'
import { HttpClientModule } from '@angular/common/http'
import { register } from 'swiper/element/bundle'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { NotificationService } from './service/notification/notification.service'
import { UserService } from './service/user/user.service'
import { GetMeetingUsersResponse, UsersMeetingsApi } from 'libs/api-client'
import { DataService } from './service/data/data.service'

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

  constructor(
    public translate: TranslateService,
    public notificationService: NotificationService,
    private userService: UserService,
    private usersMeetingsApi: UsersMeetingsApi,
    private dataService: DataService
  ) {
    this.setLanguage()
    this.init()
    this.testSave()
  }
  ngOnInit(): void {
    this.meetingNotificationSubscription = this.notificationService
      .getMeetingNotifications()
      .subscribe((notification) => {
        this.getNotification(notification.userid, notification.meetingid)
      })
  }

  async init() {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissions = await BackgroundRunner.requestPermissions({
          apis: ['notifications'],
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
  async testSave() {
    if (Capacitor.isNativePlatform()) {
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.proman.pilkarzyk.notification',
        event: 'push-notification',
        details: {},
      })
    }
  }

  setLanguage() {
    let lang = localStorage.getItem('lang')
    if (lang != null) {
      this.translate.setDefaultLang(lang)
      this.translate.use(lang)
    } else {
      const userLang = navigator.language.split('-')[0]
      const defaultLang = this.translate.getBrowserLang()
      let langToUse = this.translate.getLangs().includes(userLang)
        ? userLang
        : defaultLang
      if (langToUse == 'pl' || langToUse == 'en') {
        this.translate.setDefaultLang(langToUse)
        this.translate.use(langToUse)
        localStorage.setItem('lang', langToUse)
      } else {
        langToUse = 'en'
        this.translate.setDefaultLang(langToUse)
        this.translate.use(langToUse)
        localStorage.setItem('lang', langToUse)
      }
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
}
