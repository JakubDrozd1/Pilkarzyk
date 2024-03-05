import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import { MeetingsApi, MessagesApi, USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { LogoutComponent } from '../logout/logout.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription, forkJoin } from 'rxjs'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { convertFileToBase64 } from 'src/app/helper/convertFileToBase64'
import { UserService } from 'src/app/service/user/user.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { GaduGaduComponent } from '../../../helper/gadu-gadu/gadu-gadu.component'
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router'
import { NotificationService } from 'src/app/service/notification/notification.service'
import * as moment from 'moment'
import { IonRefresherCustomEvent } from '@ionic/core'

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
    RouterLink,
  ],
})
export class ProfileDetailsComponent implements OnInit {
  user!: USERS
  image: File | null = null
  isReady: boolean = false
  temp: string = ''
  idUser: number = 0
  allMeetings: number = 0
  acceptMeetings: number = 0

  constructor(
    private usersApi: UsersApi,
    private alert: Alert,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private messagesApi: MessagesApi
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idUser'] > 0) {
        this.idUser = parseInt(params?.['idUser'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    forkJoin({
      user: this.usersApi.getUserById({
        userId: this.idUser,
      }),
      messages: this.messagesApi.getAllMessages({
        page: 0,
        onPage: -1,
        dateTo: moment().toISOString(),
        idUser: this.idUser,
      }),
    }).subscribe({
      next: (responses) => {
        this.acceptMeetings = responses.messages.filter(
          (message) => message.Answer === 'yes'
        ).length
        this.allMeetings =
          Math.round(
            (this.acceptMeetings / responses.messages.length) * 100 * 100
          ) / 100
        this.user = responses.user
        const base64String = responses.user.AVATAR
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

  cancel() {
    window.history.back()
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
