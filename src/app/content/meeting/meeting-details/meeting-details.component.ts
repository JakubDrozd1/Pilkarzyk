import { TeamsApi } from './../../../../../libs/api-client/api/teams.api'
import { CommonModule } from '@angular/common'
import { Component, ElementRef, HostListener, OnInit } from '@angular/core'
import {
  AlertController,
  IonicModule,
  ModalController,
  NavController,
  RefresherEventDetail,
} from '@ionic/angular'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router'
import {
  GUESTS,
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  GuestsApi,
  MeetingsApi,
  MessagesApi,
  TEAMS,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { Subscription, forkJoin } from 'rxjs'
import {
  convertBase64ToFile,
  convertStringsToImages,
} from 'src/app/helper/convertBase64ToFile'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import * as moment from 'moment'
import { IonRefresherCustomEvent } from '@ionic/core'
import { MeetingTeamListComponent } from '../meeting-team-list/meeting-team-list.component'
import { FormsModule } from '@angular/forms'
import iro from '@jaames/iro'
import { AddTeamModalComponent } from 'src/app/modal/add-team-modal/add-team-modal.component'
import { AddGuestModalComponent } from 'src/app/modal/add-guest-modal/add-guest-modal.component'
import { MeetingComponent } from 'src/app/form/meeting/meeting.component'

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    RouterLink,
    TranslateModule,
    MeetingTeamListComponent,
    FormsModule,
    AddTeamModalComponent,
    MeetingComponent,
  ],
})
export class MeetingDetailsComponent implements OnInit {
  isReady: boolean = false
  idMeeting: number = 0
  meeting!: GetMeetingGroupsResponse
  user!: USERS
  temp: File | null = null
  image: string = ''
  acceptMeeting: number = 0
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  images: any[] = []
  counter: number = 5
  defaultAnswer!: GetMessagesUsersMeetingsResponse
  public changeInputs: any
  selectedValue: string = ''
  currentDate: any
  private subscription: Subscription = new Subscription()
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
  color: string = ''
  teams: TEAMS[] = []
  guests: GUESTS[] = []
  idGroup: number = 0
  modalOpened: boolean = false
  alertOpened: boolean = false

  constructor(
    private route: ActivatedRoute,
    private meetingsApi: MeetingsApi,
    private alert: Alert,
    private usersApi: UsersApi,
    private messagesApi: MessagesApi,
    private router: Router,
    public translate: TranslateService,
    private elementRef: ElementRef,
    private refreshDataService: RefreshDataService,
    public userService: UserService,
    private alertCtrl: AlertController,
    private teamsApi: TeamsApi,
    private modalCtrl: ModalController,
    private guestsApi: GuestsApi
  ) {}

  ngOnInit() {
    this.defaultAnswer = {
      Answer: null,
    }
    this.currentDate = moment().toISOString()
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'meeting-details') {
          this.reload()
        }
      })
    )
    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss()
        }
      }
    })
    this.reload()
  }

  async openModalAddTeam() {
    const modal = await this.modalCtrl.create({
      component: AddTeamModalComponent,
      componentProps: {
        idMeeting: this.idMeeting,
      },
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?modalOpened=true')
    this.modalOpened = true
    modal.present()
    await modal.onWillDismiss()
  }

  async openModalAddGuest() {
    const modal = await this.modalCtrl.create({
      component: AddGuestModalComponent,
      componentProps: {
        idMeeting: this.idMeeting,
      },
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?modalOpened=true')
    this.modalOpened = true
    modal.present()
    await modal.onWillDismiss()
  }

  reload() {
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.getDetails()
      }
    })
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
      }
    })
  }

  getDetails() {
    this.isReady = false
    this.meetingsApi
      .getMeetingById({
        meetingId: this.idMeeting,
      })
      .subscribe({
        next: (response) => {
          this.meeting = response
          forkJoin({
            messages: this.messagesApi.getAllMessages({
              idMeeting: Number(this.meeting.IdMeeting),
              page: 0,
              onPage: -1,
              isAvatar: true,
            }),
            user: this.usersApi.getUserById({
              userId: this.meeting.IdAuthor ?? 0,
            }),
            teams: this.teamsApi.getAllTeamsFromMeeting({
              meetingId: this.idMeeting,
            }),
            guests: this.guestsApi.getAllGuestFromMeeting({
              meetingId: this.idMeeting,
            }),
          }).subscribe({
            next: (responses) => {
              this.guests = responses.guests
              this.teams = responses.teams
              let element: number = this.elementRef.nativeElement.offsetWidth
              this.counter = Math.round(element / 60)
              this.user = responses.user
              this.defaultAnswer = responses.messages.filter(
                (message) =>
                  message.IdUser === this.userService.loggedUser.ID_USER
              )[0]
              this.setInputs()
              this.setColor(this.defaultAnswer)
              this.filteredMessages = responses.guests.map((guest) => ({
                Answer: 'yes',
                Firstname: guest.NAME,
                Surname: this.translate.instant('(GUEST)'),
                IdMeeting: guest.IDMEETING,
                Avatar: null,
                IdGuest: guest.ID_GUEST,
              }))
              this.filteredMessages = this.filteredMessages.concat(
                responses.messages.filter((message) => message.Answer === 'yes')
              )
              this.acceptMeeting = this.filteredMessages.length
              convertStringsToImages(this.filteredMessages).then((files) => {
                this.images = files
              })
              const base64String = responses.user.AVATAR
              if (base64String != null) {
                convertBase64ToFile(base64String).then((file) => {
                  this.temp = file
                  const reader = new FileReader()
                  reader.onload = () => {
                    this.image = reader.result as string
                    this.isReady = true
                  }
                  reader.readAsDataURL(this.temp)
                })
              } else {
                this.isReady = true
              }
              this.isReady = true
            },
          })
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  setColor(defautAnswer: GetMessagesUsersMeetingsResponse) {
    switch (defautAnswer.Answer) {
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
  }

  cancel() {
    if (window.location.pathname.includes('home')) {
      this.router.navigate(['/home'])
    }
    if (window.location.pathname.includes('groups')) {
      this.router.navigate(['/groups/' + this.idGroup])
    }
    if (window.location.pathname.includes('notification')) {
      this.router.navigate(['/notification'])
    }
    if (window.location.pathname.includes('calendar')) {
      this.router.navigate(['/calendar'])
    }
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

  updateAnswer() {
    if (this.selectedValue == 'yes' || this.selectedValue == 'no') {
      this.messagesApi
        .updateAnswerMessage({
          getMessageRequest: {
            IdMeeting: this.meeting.IdMeeting,
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
              this.acceptMeeting >= (this.meeting.Quantity ?? 0)
            ) {
              this.alert.presentInfinityToast(
                this.translate.instant('Full meeting')
              )
            }
            this.selectedValue = ''
            this.reload()
            this.refreshDataService.refresh('calendar')
            this.refreshDataService.refresh('groups-content')
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
      '/meeting/' + this.idMeeting + '/answer/' + this.defaultAnswer.IdMessage

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

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
