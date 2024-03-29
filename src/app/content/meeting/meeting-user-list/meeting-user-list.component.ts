import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { AlertController, IonicModule } from '@ionic/angular'
import {
  GetMessagesUsersMeetingsResponse,
  GuestsApi,
  MessagesApi,
} from 'libs/api-client'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { UserService } from 'src/app/service/user/user.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Alert } from 'src/app/helper/alert'
import { Router, ActivatedRoute, RouterLink } from '@angular/router'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import * as moment from 'moment'
import { MeetingComponent } from 'src/app/form/meeting/meeting.component'

@Component({
  selector: 'app-meeting-user-list',
  templateUrl: './meeting-user-list.component.html',
  styleUrls: ['./meeting-user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    TranslateModule,
    RouterLink,
    MeetingComponent,
  ],
})
export class MeetingUserListComponent implements OnInit {
  @Input() user!: GetMessagesUsersMeetingsResponse
  @Input() counter: number = 0

  temp: File | null = null
  images: string = ''
  isReady: boolean = false
  color: string = ''
  defaultAnswer!: GetMessagesUsersMeetingsResponse
  selectedValue: string = ''
  acceptMeeting: number = 0
  public changeInputs: any
  public changeButtons = [
    {
      text: this.translate.instant('Save'),
      role: 'submit',
      handler: () => {
        this.updateAnswer()
      },
    },
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
      handler: () => {
        this.setInputs()
      },
    },
  ]
  idMeeting: number = 0
  idGroup: number = 0
  currentDate: any
  alertOpened: boolean = false

  constructor(
    public userService: UserService,
    public translate: TranslateService,
    private messagesApi: MessagesApi,
    private alert: Alert,
    private alertCtrl: AlertController,
    private router: Router,
    private refreshDataService: RefreshDataService,
    private guestsApi: GuestsApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
      }
    })
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
      }
    })
    this.currentDate = moment().toISOString()
    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss()
        }
      }
    })
    this.getDetails()
  }

  getDetails() {
    const base64String = this.user.Avatar
    if (base64String != null) {
      convertBase64ToFile(base64String).then((file) => {
        this.temp = file
        const reader = new FileReader()
        reader.onload = () => {
          this.images = reader.result as string
          this.isReady = true
        }
        reader.readAsDataURL(this.temp)
      })
    } else {
      this.isReady = true
    }
    switch (this.user.Answer) {
      case 'yes': {
        this.color = 'success'
        break
      }
      case 'no': {
        this.color = 'danger'
        break
      }
      case 'wait': {
        this.color = 'warning'
        break
      }
      case 'readed': {
        this.color = 'medium'
        break
      }
      default: {
        this.color = ''
        break
      }
    }
    if (this.user) {
      this.defaultAnswer = this.user
      this.setInputs()
    }
  }

  updateAnswer() {
    if (this.selectedValue == 'yes' || this.selectedValue == 'no') {
      this.messagesApi
        .updateAnswerMessage({
          getMessageRequest: {
            IdMeeting: this.user.IdMeeting,
            IdUser: this.userService.loggedUser.ID_USER,
            Answer: this.selectedValue,
          },
        })
        .subscribe({
          next: () => {
            this.alert.presentToast(
              this.translate.instant('Successfully updated answer')
            )
            if (
              this.selectedValue == 'yes' &&
              this.acceptMeeting >= (this.user.Quantity ?? 0)
            ) {
              this.alert.presentInfinityToast(
                this.translate.instant('Full meeting')
              )
            }
            this.selectedValue = ''
            this.reload()
            this.refreshDataService.refresh('message-user-list')
          },
          error: (error) => {
            this.alert.handleError(error)
          },
        })
    } else if (this.selectedValue == 'wait') {
      this.selectedValue = ''
      this.setInputs()
      this.answer()
    }
  }

  answer() {
    var answerPath =
      '/meeting/' +
      this.idMeeting +
      '/message/answer/' +
      this.defaultAnswer.IdMessage
    if (window.location.pathname.includes('home')) {
      this.router.navigate(['/home' + answerPath])
    }
    if (window.location.pathname.includes('groups')) {
      this.router.navigate(['/groups/' + this.idGroup + answerPath])
    }
    if (window.location.pathname.includes('notification')) {
      this.router.navigate(['/notification' + answerPath])
    }
    if (window.location.pathname.includes('calendar')) {
      this.router.navigate(['/calendar' + answerPath])
    }
  }

  async showAlert() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('Change decision'),
      inputs: this.changeInputs,
      buttons: this.changeButtons,
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    this.alertOpened = true
    alert.present()
    alert.onDidDismiss().then(() => {
      this.selectedValue = ''
      this.cancelAlert()
    })
  }

  cancelAlert() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { alertOpened: null },
      replaceUrl: true,
    })
    this.alertOpened = false
  }

  setInputs() {
    this.changeInputs = [
      {
        label: this.translate.instant('I WILL COME'),
        type: 'radio',
        value: 'yes',
        checked: this.defaultAnswer.Answer == 'yes',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('I WONT COME'),
        type: 'radio',
        value: 'no',
        checked: this.defaultAnswer.Answer == 'no',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('GIVE ME TIME'),
        type: 'radio',
        value: 'wait',
        checked: this.defaultAnswer.Answer == 'wait',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
    ]
  }

  reload() {
    this.getDetails()
  }

  async deleteGuest(guest: GetMessagesUsersMeetingsResponse) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        'Are you sure you want to remove the guest?'
      ),
      buttons: [
        {
          text: this.translate.instant('Yes'),
          role: 'submit',
          handler: () => {
            this.delete(guest)
          },
        },
        {
          text: this.translate.instant('No'),
          role: 'cancel',
        },
      ],
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    alert.present()
    this.alertOpened = true
    alert.onDidDismiss().then(() => {
      this.selectedValue = ''
      this.cancelAlert()
    })
  }

  delete(guest: GetMessagesUsersMeetingsResponse) {
    this.isReady = false
    this.guestsApi
      .deleteGuests({
        guestsId: guest.IdGuest ?? 0,
      })
      .subscribe({
        next: () => {
          this.isReady = true
          this.alert.presentToast(
            this.translate.instant('The guest was successfully removed.')
          )
          this.refreshDataService.refresh('message-user-list')
        },
        error: (error) => {
          this.isReady = true
          this.alert.handleError(error)
        },
      })
  }
}
