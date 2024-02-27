import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { GetMessagesUsersMeetingsResponse } from 'libs/api-client'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'

@Component({
  selector: 'app-meeting-user-list',
  templateUrl: './meeting-user-list.component.html',
  styleUrls: ['./meeting-user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, SpinnerComponent],
})
export class MeetingUserListComponent implements OnInit {
  @Input() user!: GetMessagesUsersMeetingsResponse
  @Input() counter: number = 0

  temp: File | null = null
  images: string = ''
  isReady: boolean = false
  color: string = ''

  constructor() {}

  ngOnInit() {
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
  }
}
