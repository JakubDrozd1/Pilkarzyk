import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { RouterLink } from '@angular/router'
import { LogoutComponent } from '../../content/profile/logout/logout.component'
import { UserService } from 'src/app/service/user/user.service'
import { NotificationService } from 'src/app/service/notification/notification.service'

@Component({
  selector: 'app-account-option-list',
  templateUrl: './account-option-list.component.html',
  styleUrls: ['./account-option-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    TranslateModule,
    RouterLink,
    LogoutComponent,
  ],
})
export class AccountOptionListComponent implements OnInit {
  pickerColumns = [
    {
      name: 'languages',
      options: [
        {
          text: this.translate.instant('Polish'),
          value: 'pl',
        },
        {
          text: this.translate.instant('English'),
          value: 'en',
        },
      ],
    },
  ]
  pickerButtons = [
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
    },
    {
      text: 'Ok',
      handler: (value: { languages: { value: any } }) => {
        localStorage.setItem('langUser', value.languages.value)
        window.location.reload()
      },
    },
  ]
  isPickerOpen: boolean = false
  constructor(
    public userService: UserService,
    public translate: TranslateService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {}

  setOpen(isOpen: boolean) {
    this.isPickerOpen = isOpen
  }
}
