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
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'

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
    SpinnerComponent,
  ],
})
export class GroupsInviteComponent implements OnInit {
  @Input() invite!: GetGroupInviteResponse
  isReady: boolean = true
  temp: File | null = null
  image: string = ''
  user!: USERS

  constructor(
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupInvite: GroupInvitesApi,
    private groupUserApi: GroupsUsersApi,
    public translate: TranslateService,
    private usersApi: UsersApi
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  getDetails() {
    this.isReady = false
    this.usersApi
      .getUserById({
        userId: this.invite.IdAuthor ?? 0,
      })
      .subscribe({
        next: (response) => {
          this.user = response
          const base64String = response.AVATAR
          if (base64String != null) {
            convertBase64ToFile(base64String).then((file) => {
              this.temp = file
              const reader = new FileReader()
              reader.onload = () => {
                this.image = reader.result as string
                this.isReady = true
              }
              reader.readAsDataURL(this.temp)
            })
          } else {
            this.isReady = true
          }
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

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
                  this.alert.presentToast(
                    this.translate.instant('Successfully joined') +
                      this.invite.Name
                  )
                  this.refreshDataService.refresh('notification')
                  this.isReady = true
                },
                error: (error) => {
                  this.alert.handleError(error)
                  this.isReady = true
                },
              })
          },
          error: (error) => {
            this.alert.handleError(error)
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
            this.alert.presentToast(
              this.translate.instant('Successfully rejected') + this.invite.Name
            )
            this.refreshDataService.refresh('notification')
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }
}
