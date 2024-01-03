import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { MeetingComponent } from '../../form/meeting/meeting.component'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import {
  GetGroupInviteResponse,
  GetGroupsUsersResponse,
  GroupInvitesApi,
  GroupsUsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-groups-invite',
  templateUrl: './groups-invite.component.html',
  styleUrls: ['./groups-invite.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MeetingComponent,
    MeetingContentComponent,
    FormsModule,
  ],
})
export class GroupsInviteComponent implements OnInit {
  @Input() invite!: GetGroupInviteResponse
  groupUser!: GetGroupsUsersResponse
  isReady: boolean = false
  constructor(
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupInvite: GroupInvitesApi,
    private groupUserApi: GroupsUsersApi
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    this.groupUserApi
      .getUserWithGroup({
        userId: this.invite.IdAuthor ?? 0,
        groupId: this.invite.IdGroup ?? 0,
      })
      .subscribe({
        next: (response) => {
          this.groupUser = response
          this.isReady = true
        },
        error: () => {
          this.alert.alertNotOk()
          this.isReady = true
        },
      })
  }

  onSubmit(answer: string) {
    if (answer == 'yes') {
      this.groupUserApi
        .addUserToGroupAsync({
          idGroup: this.invite.IdGroup ?? 0,
          idUser: this.invite.IdUser ?? 0,
          accountType: 0,
        })
        .subscribe({
          next: () => {
            this.groupInvite
              .deleteGroupInviteAsync({
                groupInvitedId: this.invite.IdGroupInvite ?? 0,
              })
              .subscribe({
                next: () => {
                  this.alert.alertOk('Pomyslnie dołaczono')
                  this.refreshDataService.refresh('notification')
                  this.getDetails()
                },
                error: () => {
                  this.alert.alertNotOk()
                  this.isReady = true
                },
              })
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    } else {
      this.groupInvite
        .deleteGroupInviteAsync({
          groupInvitedId: this.invite.IdGroupInvite ?? 0,
        })
        .subscribe({
          next: () => {
            this.alert.alertOk('Pomyslnie odrzucono')
            this.refreshDataService.refresh('notification')
            this.getDetails()
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    }
  }
}
