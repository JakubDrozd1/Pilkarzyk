import {
  CdkDropListGroup,
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { GetMessagesUsersMeetingsResponse, TEAMS } from 'libs/api-client'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

@Component({
  selector: 'app-meeting-team-list',
  templateUrl: './meeting-team-list.component.html',
  styleUrls: ['./meeting-team-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    RouterLink,
    TranslateModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
})
export class MeetingTeamListComponent implements OnInit {
  @Output() changes = new EventEmitter<{
    [key: string]: GetMessagesUsersMeetingsResponse[]
  }>()

  @Input() teams: TEAMS[] = []
  @Input() messages: GetMessagesUsersMeetingsResponse[] = []
  @Input() images: string[] = []

  arrays: { [key: string]: GetMessagesUsersMeetingsResponse[] } = {}
  isReady: boolean = false
  connectedTo: string[] = []
  userWithoutTeam: string[] = []
  isNative: boolean = true
  temp: File | null = null

  constructor() {}

  ngOnInit() {
    this.isNative = Capacitor.isNativePlatform()
    this.createArrays()
  }

  drop(event: CdkDragDrop<GetMessagesUsersMeetingsResponse[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      )
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      )
      this.changes.emit(this.arrays)
    }
  }

  createArrays() {
    this.isReady = false
    this.arrays = {}
    for (let team of this.teams) {
      const teamId = team.ID_TEAM ?? '0'
      this.arrays[teamId] = this.messages.filter(
        (message) => message.IdTeam === teamId
      )
    }
    this.arrays['0'] = this.messages.filter(
      (message) => message.IdTeam === null
    )
    this.connectedTo = this.teams.map((team) => String(team.ID_TEAM ?? '0'))
    this.connectedTo.push('0')
    this.isReady = true
  }
}
