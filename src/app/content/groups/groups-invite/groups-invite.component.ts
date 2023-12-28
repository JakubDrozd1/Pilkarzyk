import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { MeetingComponent } from '../../form/meeting/meeting.component'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import {
  GROUPS,
  GetGroupInviteResponse,
  GroupInvitesApi,
  GroupsApi,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { forkJoin } from 'rxjs'
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
  user!: USERS
  group!: GROUPS
  isReady: boolean = false
  constructor(
    private userApi: UsersApi,
    private groupApi: GroupsApi,
    private alert: Alert,
    private groupUser: GroupsUsersApi,
    private refreshDataService: RefreshDataService,
    private groupInvite: GroupInvitesApi
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    forkJoin([
      this.userApi.getUserById({
        userId: this.invite.IdAuthor ?? 0,
      }),
      this.groupApi.getGroupById({
        groupId: this.invite.IdGroup ?? 0,
      }),
    ]).subscribe({
      next: ([userResponse, groupResponse]) => {
        this.user = userResponse
        this.group = groupResponse
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
      this.groupUser
        .addUserToGroupAsync({
          iDGROUP: this.invite.IdGroup ?? 0,
          iDUSER: this.invite.IdUser ?? 0,
          aCCOUNTTYPE: 0,
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
