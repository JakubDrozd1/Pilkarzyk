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
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from "../../../helper/spinner/spinner.component";

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
        TranslateModule,
        SpinnerComponent
    ]
})
export class GroupsInviteComponent implements OnInit {
  @Input() invite!: GetGroupInviteResponse
  isReady: boolean = true

  constructor(
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupInvite: GroupInvitesApi,
    private groupUserApi: GroupsUsersApi,
    public translate: TranslateService
  ) {}

  ngOnInit() {}

  onSubmit(answer: string) {
    if (answer == 'yes') {
      this.isReady = false
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
                  this.alert.alertOk(
                    this.translate.instant('Successfully joined')
                  )
                  this.refreshDataService.refresh('notification')
                  this.isReady = true
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
            this.alert.alertOk(this.translate.instant('Successfully rejected'))
            this.refreshDataService.refresh('notification')
            this.isReady = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReady = true
          },
        })
    }
  }
}
