import { CommonModule } from '@angular/common'
import { Component, OnInit, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { GetMeetingUsersGroupsResponse } from 'libs/api-client/model/get-meeting-users-groups-response'

@Component({
  selector: 'app-meeting-content',
  templateUrl: './meeting-content.component.html',
  styleUrls: ['./meeting-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MeetingContentComponent implements OnInit {
  @Input() meeting!: GetMeetingUsersGroupsResponse

  constructor() {}

  ngOnInit() {}
}
