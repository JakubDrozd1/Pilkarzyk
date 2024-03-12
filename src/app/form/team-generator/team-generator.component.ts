import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import iro from '@jaames/iro'
import { IonModalCustomEvent, OverlayEventDetail } from '@ionic/core'

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
  name: string = ''
  isReady: boolean = false
  customColor: string = ''
  customName: string = ''
  disabled: boolean = false
  colorcode: string = ''
  colorPicker: any
  constructor(
    public translate: TranslateService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.name = 'Team ' + this.counter
    this.sendData()
  }

  getPicker() {
    this.colorPicker = iro.ColorPicker('#picker' + this.counter, {
      width: 100,
      color: '#fff',
    })
    this.colorPicker.on('color:change', (color: { hexString: any }) => {
      this.setHexColor(color.hexString)
    })
    this.disabled = true
  }
  onWillDismiss($event: IonModalCustomEvent<OverlayEventDetail<any>>) {
    this.disabled = false
  }
  updateTeam() {}

  setColor(arg0: string) {
    this.colorPicker.setColor(arg0)
  }

  setHexColor(arg0: string) {
    this.color = arg0
  }

  dismiss() {
    if (this.name == '') {
      this.name = 'Team ' + this.counter
    }
    this.sendData()
    this.modalCtrl.dismiss()
  }

  sendData() {
    this.dataEvent.emit({
      number: this.counter,
      name: this.name,
      color: this.color,
    })
  }
}
