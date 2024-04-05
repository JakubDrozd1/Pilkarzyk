import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertController, IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { TEAMS, TeamsApi } from 'libs/api-client'
import { MeetingTeamComponent } from 'src/app/content/meeting/meeting-team/meeting-team.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-edit-team-modal',
  templateUrl: './edit-team-modal.component.html',
  styleUrls: ['./edit-team-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    MeetingTeamComponent,
  ],
})
export class EditTeamModalComponent implements OnInit {
  @Input() idMeeting: number = 0
  @Input() team!: TEAMS
  isReady: boolean = false
  isEdit: boolean = false
  colors: string[] = [
    '#ff0000',
    '#0000ff',
    '#008000',
    '#ffffff',
    '#000000',
    '#ff84fe',
    '#ffff00',
    '#800080',
    '#ffa500',
    '#808080',
  ]
  name: string = ''
  teamColor: string = ''
  colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  alertOpened: boolean = false

  constructor(
    private teamsApi: TeamsApi,
    private route: ActivatedRoute,
    private alert: Alert,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router,
    private refreshDataService: RefreshDataService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.name = this.team.NAME ?? 'Team'
    this.teamColor = this.team.COLOR ?? '#000000'
    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss(null, 'cancel')
        }
      } else {
        this.cancel()
      }
    })
  }

  cancel() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    this.modalCtrl.dismiss(null, 'cancel')
  }

  async deleteTeam() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        'Are you sure you want to delete the team?'
      ),
      buttons: [
        {
          text: this.translate.instant('Yes'),
          role: 'submit',
          handler: () => {
            this.isEdit = false
            this.delete(this.team)
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

  delete(team: TEAMS) {
    this.isReady = false
    this.teamsApi
      .deleteTeam({
        teamId: team.ID_TEAM ?? 0,
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Team successfully deleted.')
          )
          this.isReady = true
          this.refreshDataService.refresh('meeting-team')
          this.cancel()
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
          this.cancel()
        },
      })
  }

  setColor(color: string) {
    this.teamColor = color
  }

  editTeam() {
    if (this.name == '') {
      this.name = 'Team ' + Math.floor(Math.random() * 100) + 1
    }
    if (this.teamColor == '' || !this.colorRegex.test(this.teamColor)) {
      this.teamColor = this.genHexColor()
    }
    this.isReady = false
    this.teamsApi
      .updateTeam({
        idMeeting: this.idMeeting,
        color: this.teamColor,
        name: this.name,
        teamId: this.team.ID_TEAM ?? 0,
      })
      .subscribe({
        next: () => {
          this.alert.presentToast('Zaaktualizowano pomyslnie')
          this.isReady = true
          this.refreshDataService.refresh('meeting-team')
          this.cancel()
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
          this.cancel()
        },
      })
  }

  genHexColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16)
    return `#${randomColor}`
  }
}
