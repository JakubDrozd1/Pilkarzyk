import { MessagesApi } from './../../../../../libs/api-client/api/messages.api'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  AlertController,
  IonicModule,
  ModalController,
  RefresherEventDetail,
} from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  GuestsApi,
  MeetingsApi,
  TEAMS,
  TeamsApi,
} from 'libs/api-client'
import { Subscription, forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { UserService } from 'src/app/service/user/user.service'
import { MeetingTeamListComponent } from '../meeting-team-list/meeting-team-list.component'
import { FormsModule } from '@angular/forms'
import iro from '@jaames/iro'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { IonRefresherCustomEvent } from '@ionic/core'
import { AddTeamModalComponent } from 'src/app/modal/add-team-modal/add-team-modal.component'
import { EditTeamModalComponent } from 'src/app/modal/edit-team-modal/edit-team-modal.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-meeting-team',
  templateUrl: './meeting-team.component.html',
  styleUrls: ['./meeting-team.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    MeetingTeamListComponent,
    FormsModule,
    SpinnerComponent,
    EditTeamModalComponent,
  ],
})
export class MeetingTeamComponent implements OnInit {
  idMeeting: number = 0
  isReady: boolean = false
  meeting!: GetMeetingGroupsResponse
  teams: TEAMS[] = []
  filteredMessages: GetMessagesUsersMeetingsResponse[] = []
  images: any[] = []
  arrays: { [key: number]: GetMessagesUsersMeetingsResponse[] } = {}
  temp: File | null = null
  isEdit: boolean = false
  public changeButtons = [
    {
      text: this.translate.instant('Yes'),
      role: 'submit',
      handler: () => {
        this.isEdit = false
        this.getDetails()
      },
    },
    {
      text: this.translate.instant('No'),
      role: 'cancel',
    },
  ]
  public okButtons = [
    {
      text: this.translate.instant('Yes'),
      role: 'submit',
      handler: () => {
        this.saveTeams()
      },
    },
    {
      text: this.translate.instant('No'),
      role: 'cancel',
    },
  ]
  name: string = ''
  teamColor: string = ''
  disabled: boolean = false
  colorPicker: any
  isUserYes: boolean = false
  colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  idGroup: number = 0
  modalOpened: boolean = false
  private subscription: Subscription = new Subscription()
  alertOpened: boolean = false

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    public userService: UserService,
    private meetingsApi: MeetingsApi,
    private messagesApi: MessagesApi,
    private teamsApi: TeamsApi,
    private alert: Alert,
    private alertCtrl: AlertController,
    private guestsApi: GuestsApi,
    private router: Router,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'meeting-team') {
          this.reload()
        }
      })
    )
    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss(null, 'cancel')
        }
      }
    })
    this.reload()
  }

  async openModalEditTeam(team: TEAMS) {
    const modal = await this.modalCtrl.create({
      component: EditTeamModalComponent,
      componentProps: {
        idMeeting: this.idMeeting,
        team: team,
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
    this.teams = []
    this.filteredMessages = []
    this.arrays = {}
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
            teams: this.teamsApi.getAllTeamsFromMeeting({
              meetingId: this.idMeeting,
            }),
            guests: this.guestsApi.getAllGuestFromMeeting({
              meetingId: this.idMeeting,
            }),
          }).subscribe({
            next: (responses) => {
              this.teams = responses.teams

              this.filteredMessages = responses.guests.map((guest) => ({
                Answer: 'yes',
                Firstname: guest.NAME,
                Surname: this.translate.instant('(GUEST)'),
                IdMeeting: guest.IDMEETING,
                Avatar: null,
                IdGuest: guest.ID_GUEST,
                IdTeam: guest.IDTEAM,
              }))
              this.filteredMessages = this.filteredMessages.concat(
                responses.messages.filter((message) => message.Answer === 'yes')
              )
              for (let user of this.filteredMessages) {
                if (user.IdUser == this.userService.loggedUser.ID_USER) {
                  this.isUserYes = true
                  break
                } else {
                  this.isUserYes = false
                }
              }
              this.teams.forEach((team) => {
                const teamId = team.ID_TEAM || 0

                if (!this.arrays[teamId]) {
                  this.arrays[teamId] = []
                }

                const filteredMessagesForTeam = this.filteredMessages.filter(
                  (message) => message.IdTeam === teamId
                )
                this.arrays[teamId].push(...filteredMessagesForTeam)
              })

              const messagesWithoutTeam = this.filteredMessages.filter(
                (message) => message.IdTeam == null
              )
              if (messagesWithoutTeam.length > 0) {
                if (!this.arrays[0]) {
                  this.arrays[0] = []
                }
                this.arrays[0].push(...messagesWithoutTeam)
              }
              this.getAvatars()
            },
          })
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  getAvatars() {
    const promises = this.filteredMessages.map((user) => {
      return new Promise<void>((resolve) => {
        const base64String = user.Avatar
        if (base64String != null) {
          convertBase64ToFile(base64String).then((file) => {
            this.temp = file
            const reader = new FileReader()
            reader.onload = () => {
              const index = user.IdUser ?? 0
              this.images[index] = reader.result as string
              resolve()
            }
            reader.readAsDataURL(this.temp)
          })
        } else {
          const index = user.IdUser ?? 0
          this.images[index] = '0'
          resolve()
        }
      })
    })
    Promise.all(promises).then(() => {
      this.isReady = true
    })
  }

  cancel() {
    let meetingPath = '/meeting/' + this.idMeeting
    if (window.location.pathname.includes('home')) {
      this.router.navigate(['/home' + meetingPath])
    }
    if (window.location.pathname.includes('groups')) {
      this.router.navigate(['/groups/' + this.idGroup + meetingPath])
    }
    if (window.location.pathname.includes('notification')) {
      this.router.navigate(['/notification' + meetingPath])
    }
    if (window.location.pathname.includes('calendar')) {
      this.router.navigate(['/calendar' + meetingPath])
    }
  }

  swapEdit() {
    this.isEdit = !this.isEdit
  }

  async leave() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        'Are you sure you want to exit without saving your changes?'
      ),
      buttons: this.changeButtons,
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    this.alertOpened = true
    alert.present()
    alert.onDidDismiss().then(() => {
      this.cancelAlert()
    })
  }

  async save() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('Save changes?'),
      buttons: this.okButtons,
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    this.alertOpened = true
    alert.present()
    alert.onDidDismiss().then(() => {
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

  saveTeams() {
    this.messagesApi
      .updateTeamMessageAsync({
        getTeamTableMessageRequest: {
          Teams: this.teams,
          UpdatedTeams: this.arrays,
        },
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Changes successfully saved')
          )
          this.isEdit = false
          this.getDetails()
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  getChanges($event: { [key: string]: GetMessagesUsersMeetingsResponse[] }) {
    this.arrays = $event
  }

  addToTeam(team: TEAMS) {
    this.isReady = false
    const updatedTeams: {
      [key: string]: Array<GetMessagesUsersMeetingsResponse>
    } = {}
    updatedTeams[String(team.ID_TEAM)] = [
      {
        IdMeeting: this.idMeeting,
        IdUser: this.userService.loggedUser.ID_USER,
        IdAuthor: this.userService.loggedUser.ID_USER,
      },
    ]
    this.messagesApi
      .updateTeamMessageAsync({
        getTeamTableMessageRequest: {
          Teams: [team],
          UpdatedTeams: updatedTeams,
        },
      })
      .subscribe({
        next: () => {
          this.getDetails()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  isUserInTeam(team: TEAMS) {
    for (let user of this.arrays[team.ID_TEAM ?? 0]) {
      return !(user.IdUser == this.userService.loggedUser.ID_USER)
    }
    return true
  }

  onWillDismiss() {
    this.disabled = false
  }

  getPicker(team: TEAMS) {
    this.colorPicker = iro.ColorPicker('#picker' + team.ID_TEAM, {
      width: 100,
      color: '#fff',
    })
    this.colorPicker.on('color:change', (color: { hexString: any }) => {
      this.teamColor = color.hexString
    })
    this.disabled = true
  }

  genHexColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16)
    return `#${randomColor}`
  }

  removeFromTeam(team: TEAMS) {
    this.isReady = false
    const updatedTeams: {
      [key: string]: Array<GetMessagesUsersMeetingsResponse>
    } = {}
    updatedTeams[String(0)] = [
      {
        IdMeeting: this.idMeeting,
        IdUser: this.userService.loggedUser.ID_USER,
        IdAuthor: this.userService.loggedUser.ID_USER,
        IdTeam: team.ID_TEAM,
      },
    ]
    this.messagesApi
      .updateTeamMessageAsync({
        getTeamTableMessageRequest: {
          Teams: [team],
          UpdatedTeams: updatedTeams,
        },
      })
      .subscribe({
        next: () => {
          this.getDetails()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
