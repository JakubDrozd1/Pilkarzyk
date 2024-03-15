import { MessagesApi } from './../../../../../libs/api-client/api/messages.api'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AlertController, IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetMeetingGroupsResponse,
  GetMessagesUsersMeetingsResponse,
  MeetingsApi,
  TEAMS,
  TeamsApi,
} from 'libs/api-client'
import { forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { UserService } from 'src/app/service/user/user.service'
import { MeetingTeamListComponent } from '../meeting-team-list/meeting-team-list.component'

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
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    public userService: UserService,
    private meetingsApi: MeetingsApi,
    private messagesApi: MessagesApi,
    private teamsApi: TeamsApi,
    private alert: Alert,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.getDetails()
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
          }).subscribe({
            next: (responses) => {
              this.teams = responses.teams
              this.filteredMessages = responses.messages.filter(
                (message) => message.Answer === 'yes'
              )
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
    window.history.back()
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
    alert.present()
  }

  async save() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('Save changes?'),
      buttons: this.okButtons,
      backdropDismiss: false,
    })
    alert.present()
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
}
