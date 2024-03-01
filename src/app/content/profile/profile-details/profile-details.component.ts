import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { LogoutComponent } from '../logout/logout.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription } from 'rxjs'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { convertFileToBase64 } from 'src/app/helper/convertFileToBase64'
import { UserService } from 'src/app/service/user/user.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { GaduGaduComponent } from '../../../helper/gadu-gadu/gadu-gadu.component'
import { RouterLink } from '@angular/router'
import { NotificationService } from 'src/app/service/notification/notification.service'

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    LogoutComponent,
    TranslateModule,
    SpinnerComponent,
    GaduGaduComponent,
    RouterLink,
  ],
})
export class ProfileDetailsComponent implements OnInit {
  user: USERS | undefined
  selectedFile: File | null = null
  image: File | null = null
  isReady: boolean = false
  temp: string = ''
  private subscription: Subscription = new Subscription()
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
    private usersApi: UsersApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private userService: UserService,
    public translate: TranslateService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'profile-details') {
          this.reload()
        }
      })
    )
    this.getDetails()
    window.addEventListener('popstate', (event) => {
      this.setOpen(false)
    })
  }

  getDetails() {
    this.usersApi
      .getUserById({
        userId: Number(this.userService.loggedUser.ID_USER),
      })
      .subscribe({
        next: (response) => {
          this.user = response
          const base64String = response.AVATAR
          if (base64String != null) {
            convertBase64ToFile(base64String).then((file) => {
              this.image = file
              const reader = new FileReader()
              reader.onload = () => {
                this.temp = reader.result as string
              }
              reader.readAsDataURL(this.image)
              this.isReady = true
            })
          } else {
            this.isReady = true
          }
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  openFileInput() {
    document.getElementById('fileInput')?.click()
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0]
    const maxSizeInBytes = 5 * 1024 * 1024
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif']

    if (selectedFile && selectedFile.size <= maxSizeInBytes) {
      const fileExtension = selectedFile.name
        .toLowerCase()
        .substring(selectedFile.name.lastIndexOf('.'))
      if (!allowedExtensions.includes(fileExtension)) {
        this.alert.alertNotOk(
          this.translate.instant(
            'Invalid file format. Only .jpeg, .jpg, .png, .gif are allowed.'
          )
        )
        return
      }

      this.isReady = false
      convertFileToBase64(selectedFile).then((base64String) => {
        this.usersApi
          .updateColumnUser({
            userId: Number(this.userService.loggedUser.ID_USER),
            getUpdateUserRequest: {
              Column: ['AVATAR'],
              Avatar: base64String,
            },
          })
          .subscribe({
            next: () => {
              this.alert.presentToast(
                this.translate.instant(
                  'You have successfully changed your avatar.'
                )
              )
              this.isReady = true
              this.refreshDataService.refresh('profile-details')
            },
            error: (error) => {
              this.alert.handleError(error)
            },
          })
      })
    } else {
      this.alert.alertNotOk(
        this.translate.instant('The file is too large (max 5MB)')
      )
    }
  }

  reload() {
    this.temp = ''
    this.isReady = false
    this.getDetails()
  }

  setOpen(isOpen: boolean) {
    this.isPickerOpen = isOpen
  }
}
