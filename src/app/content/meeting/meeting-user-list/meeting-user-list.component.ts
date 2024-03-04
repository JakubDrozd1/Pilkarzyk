import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { AlertController, IonicModule } from '@ionic/angular'
import { GetMessagesUsersMeetingsResponse, MessagesApi } from 'libs/api-client'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { UserService } from 'src/app/service/user/user.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Alert } from 'src/app/helper/alert'
import { Router, ActivatedRoute } from '@angular/router'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-meeting-user-list',
  templateUrl: './meeting-user-list.component.html',
  styleUrls: ['./meeting-user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, SpinnerComponent, TranslateModule],
})
export class MeetingUserListComponent implements OnInit {
  @Input() user!: GetMessagesUsersMeetingsResponse
  @Input() counter: number = 0

  temp: File | null = null
  images: string = ''
  isReady: boolean = false
  color: string = ''
  defautAnswer!: GetMessagesUsersMeetingsResponse
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

  constructor(
    public userService: UserService,
    public translate: TranslateService,
    private messagesApi: MessagesApi,
    private alert: Alert,
    private alertCtrl: AlertController,
    private router: Router,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
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
      this.defautAnswer = this.user
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
      this.router.navigate(['/message-add', this.defautAnswer.IdMessage])
    }
  }

  async showAlert() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('Change decision'),
      inputs: this.changeInputs,
      buttons: this.changeButtons,
      backdropDismiss: false,
    })
    alert.present()
    alert.onDidDismiss().then(() => {
      this.selectedValue = ''
    })
  }

  setInputs() {
    this.changeInputs = [
      {
        label: this.translate.instant('I WILL COME'),
        type: 'radio',
        value: 'yes',
        checked: this.defautAnswer.Answer == 'yes',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('I WONT COME'),
        type: 'radio',
        value: 'no',
        checked: this.defautAnswer.Answer == 'no',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
      {
        label: this.translate.instant('GIVE ME TIME'),
        type: 'radio',
        value: 'wait',
        checked: this.defautAnswer.Answer == 'wait',
        handler: (input: { value: any }) => {
          this.selectedValue = input.value
        },
      },
    ]
  }

  reload() {
    this.getDetails()
  }
}
