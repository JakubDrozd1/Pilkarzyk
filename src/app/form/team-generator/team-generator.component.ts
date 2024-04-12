import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { Router } from '@angular/router'
import { EditTeamGeneratorModalComponent } from 'src/app/modal/edit-team-generator-modal/edit-team-generator-modal.component'

@Component({
  selector: 'app-team-generator',
  templateUrl: './team-generator.component.html',
  styleUrls: ['./team-generator.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
    EditTeamGeneratorModalComponent,
  ],
})
export class TeamGeneratorComponent implements OnInit {
  @Output() dataEvent = new EventEmitter<{
    number: number
    name: string
    color: string
  }>()

  @Input() counter: number = 0
  @Input() color: string = ''
  @Input() name: string = ''
  @Input() idMeeting: number = 0

  isReady: boolean = false
  customColor: string = ''
  customName: string = ''
  disabled: boolean = false
  colorcode: string = ''
  colorPicker: any
  modalOpened: boolean = false

  constructor(
    public translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.name == '') {
      this.name = 'Team ' + this.counter
    }
    this.sendData()
  }

  sendData() {
    this.dataEvent.emit({
      number: this.counter,
      name: this.name,
      color: this.color,
    })
  }

  async openModalEditTeamGenerator() {
    const modal = await this.modalCtrl.create({
      component: EditTeamGeneratorModalComponent,
      componentProps: {
        color: this.color,
        name: this.name,
        isOpened: true,
      },
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?modalOpened=true')
    this.modalOpened = true
    modal.present()
    await modal.onWillDismiss()
    modal.onDidDismiss().then((data) => {
      if (data.data != null) {
        this.color = data.data.color
        this.name = data.data.name
        if (this.name == '') {
          this.name = 'Team ' + this.counter
        }
        this.sendData()
      }
    })
  }
}
