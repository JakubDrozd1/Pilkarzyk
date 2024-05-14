import { UsersApi } from 'libs/api-client'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { CheckboxChangeEventDetail, IonicModule } from '@ionic/angular'
import { IonCheckboxCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { UserService } from 'src/app/service/user/user.service'
import { Alert } from 'src/app/helper/alert'

@Component({
  selector: 'app-account-privacy',
  templateUrl: './account-privacy.component.html',
  styleUrls: ['./account-privacy.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    TranslateModule,
    RouterLink,
    TranslateModule,
  ],
})
export class AccountPrivacyComponent implements OnInit {
  permission: boolean = true
  isReady: boolean = true

  constructor(
    private router: Router,
    public userService: UserService,
    private usersApi: UsersApi,
    private alert: Alert,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.permission = !this.userService.loggedUser.SEND_INVITE ?? true
  }

  cancel() {
    if (window.location.pathname.includes('account')) {
      this.router.navigate(['/account'])
    }
    if (window.location.pathname.includes('notification')) {
      this.router.navigate(['/notification'])
    }
  }

  changePermission(
    $event: IonCheckboxCustomEvent<CheckboxChangeEventDetail<any>>
  ) {
    this.isReady = false
    this.usersApi
      .updateColumnUser({
        userId: Number(this.userService.loggedUser.ID_USER),
        getUpdateUserRequest: {
          Column: ['SEND_INVITE'],
          SendInvite: !$event.detail.checked,
        },
      })
      .subscribe({
        next: async () => {
          this.alert.presentToast(
            this.translate.instant('Changes successfully saved')
          )
          await this.userService
            .getDetails()
            .then(
              () => (
                (this.isReady = true),
                (this.permission =
                  !this.userService.loggedUser.SEND_INVITE ?? true)
              )
            )
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }
}
