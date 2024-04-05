import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { TeamsApi } from 'libs/api-client'
import { MeetingDetailsComponent } from 'src/app/content/meeting/meeting-details/meeting-details.component'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-add-team-modal',
  templateUrl: './add-team-modal.component.html',
  styleUrls: ['./add-team-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    MeetingDetailsComponent,
  ],
})
export class AddTeamModalComponent implements OnInit {
  @Input() idMeeting: number = 0
  @Input() isOpened: boolean = false

  teamName: string = 'Team'
  teamColor: string = '#000000'
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
  colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

  constructor(
    private teamsApi: TeamsApi,
    private route: ActivatedRoute,
    private alert: Alert,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    window.addEventListener('popstate', async () => {
      if (this.isOpened) {
        this.cancel()
      }
    })
  }

  addTeam() {
    if (this.teamName == '') {
      this.teamName = 'Team ' + Math.floor(Math.random() * 100) + 1
    }
    if (this.teamColor == '' || !this.colorRegex.test(this.teamColor)) {
      this.teamColor = this.genHexColor()
    }
    this.teamsApi
      .addTeams({
        color: this.teamColor,
        idMeeting: this.idMeeting,
        name: this.teamName,
      })
      .subscribe({
        next: () => {
          this.teamName = 'Team'
          this.teamColor = '#000000'
          this.alert.presentToast(
            this.translate.instant('Team added successfully.')
          )
          this.refreshDataService.refresh('meeting-details')
          this.cancel()
        },
        error: (error) => {
          this.alert.handleError(error)
          this.teamName = 'Team'
          this.teamColor = '#000000'
          this.cancel()
        },
      })
  }

  cancel() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    this.isOpened = false
    this.modalCtrl.dismiss(null, 'cancel')
  }

  setColor(color: string) {
    this.teamColor = color
  }

  genHexColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16)
    return `#${randomColor}`
  }
}
