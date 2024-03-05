import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { GetGroupsUsersResponse } from 'libs/api-client'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'

@Component({
  selector: 'app-groups-user-list',
  templateUrl: './groups-user-list.component.html',
  styleUrls: ['./groups-user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class GroupsUserListComponent implements OnInit {
  @Input() user!: GetGroupsUsersResponse
  @Input() counter: number = 0

  temp: File | null = null
  images: string = ''
  isReady: boolean = false

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
  }
}
