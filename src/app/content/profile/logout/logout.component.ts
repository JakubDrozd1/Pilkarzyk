import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NotificationTokensApi } from 'libs/api-client'
import { AuthService } from 'src/app/service/auth/auth.service'
import { UserService } from 'src/app/service/user/user.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class LogoutComponent implements OnInit {
  public alertButtons = [
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.logout()
      },
    },
  ]

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService,
    private notificationTokensApi: NotificationTokensApi,
    private userService: UserService
  ) {}

  ngOnInit() {}

  async logout() {
    if (Capacitor.isNativePlatform()) {
      this.addListeners()
      await PushNotifications.register()
    } else {
      this.refresh()
    }
  }

  addListeners = async () => {
    await PushNotifications.addListener('registration', (token) => {
      this.notificationTokensApi
        .deleteNotificationToken({
          userId: this.userService.loggedUser.ID_USER ?? 0,
          token: token.value,
        })
        .subscribe({
          next: () => {
            console.log('OK')
            this.refresh()
          },
          error: (error) => {
            console.error(error.error)
          },
        })
    })

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error)
    })
  }

  refresh() {
    this.authService.logout()
    this.router.navigate(['/form/login'])
    window.location.reload()
  }
}
