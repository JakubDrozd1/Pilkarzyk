import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { UserService } from 'src/app/service/user/user.service'
import { Router, RouterLink } from '@angular/router'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { Subscription } from 'rxjs'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { convertFileToBase64 } from 'src/app/helper/convertFileToBase64'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { IonRefresherCustomEvent } from '@ionic/core'

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterLink,
    SpinnerComponent,
  ],
})
export class ProfileEditComponent implements OnInit {
  user: USERS | undefined
  isReady: boolean = false
  private subscription: Subscription = new Subscription()
  temp: string = ''
  image: File | null = null

  constructor(
    private usersApi: UsersApi,
    private alert: Alert,
    private userService: UserService,
    public translate: TranslateService,
    private router: Router,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'profile-edit') {
          this.getDetails()
        }
      })
    )
    this.getDetails()
  }

  getDetails() {
    this.isReady = false
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

  cancel() {
    this.router.navigate(['account'])
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
              this.getDetails()
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

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
