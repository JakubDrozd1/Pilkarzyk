import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import { MessagesApi, USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { LogoutComponent } from '../logout/logout.component'
import { forkJoin } from 'rxjs'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
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
  idMeeting: number = 0

  constructor(
    private usersApi: UsersApi,
    private alert: Alert,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private messagesApi: MessagesApi,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idUser'] > 0) {
        this.idUser = parseInt(params?.['idUser'])
        this.getDetails()
      }
    })
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
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
    if (window.location.pathname.includes('message')) {
      var meetingPath = '/meeting/' + this.idMeeting + '/message'
    } else {
      var meetingPath = '/meeting/' + this.idMeeting
    }
    if (window.location.pathname.includes('home')) {
      this.router.navigate(['/home' + meetingPath])
    }
    if (window.location.pathname.includes('groups')) {
      if (window.location.pathname.includes('meeting')) {
        this.router.navigate(['/groups' + meetingPath])
      } else {
        this.router.navigate(['/groups'])
      }
    }
    if (window.location.pathname.includes('notification')) {
      this.router.navigate(['/notification' + meetingPath])
    }
    if (window.location.pathname.includes('calendar')) {
      this.router.navigate(['/calendar' + meetingPath])
    }
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
