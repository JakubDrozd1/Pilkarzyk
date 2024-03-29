import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { TeamGeneratorComponent } from 'src/app/form/team-generator/team-generator.component'

@Component({
  selector: 'app-edit-team-generator-modal',
  templateUrl: './edit-team-generator-modal.component.html',
  styleUrls: ['./edit-team-generator-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    TeamGeneratorComponent,
  ],
})
export class EditTeamGeneratorModalComponent implements OnInit {
  @Input() color: string = '#000000'
  @Input() name: string = 'Team'

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
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    window.addEventListener('popstate', async () => {
      this.cancel(false)
    })
  }

  setColor(color: string) {
    this.color = color
  }

  cancel(isSendData: boolean) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    if (isSendData) {
      this.modalCtrl.dismiss({ color: this.color, name: this.name }, 'cancel')
    } else {
      this.modalCtrl.dismiss(null, 'cancel')
    }
  }
}
