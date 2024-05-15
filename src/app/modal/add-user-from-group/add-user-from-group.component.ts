import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import { CheckboxChangeEventDetail, IonCheckboxCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupInviteResponse,
  GetGroupsUsersResponse,
  GroupInvitesApi,
  GroupsUsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'

function getUsersInGroupANotInGroupB(
  groupA: GetGroupsUsersResponse[],
  groupB: GetGroupsUsersResponse[]
): GetGroupsUsersResponse[] {
  const usersInGroupBIds = new Set(groupB.map((user) => user.IdUser))
  return groupA.filter((user) => !usersInGroupBIds.has(user.IdUser))
}

@Component({
  selector: 'app-add-user-from-group',
  templateUrl: './add-user-from-group.component.html',
  styleUrls: ['./add-user-from-group.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class AddUserFromGroupComponent implements OnInit {
  @Input() isOpened: boolean = false
  @Input() idGroup: number = 0
  @Input() groupUsers: GetGroupsUsersResponse[] = []
  groupUsersActive: GetGroupsUsersResponse[] = []
  groupUsersOther: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  numberArray: number[] = []
  groupsInvite: GetGroupInviteResponse[] = []

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    private groupsUsersApi: GroupsUsersApi,
    private alert: Alert,
    private groupInviteApi: GroupInvitesApi,
    private userService: UserService,
    private translate: TranslateService,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.getDetails()
    window.addEventListener('popstate', async () => {
      if (this.isOpened) {
        this.cancel()
      }
    })
  }

  cancel() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    this.isOpened = false
    this.modalCtrl.dismiss(null, 'cancel')
  }

  getGroupInvites() {
    this.isReady = false
    this.groupInviteApi
      .getGroupInviteByIdUser({
        page: 0,
        onPage: -1,
        idGroup: this.idGroup,
      })
      .subscribe({
        next: (response) => {
          this.groupsInvite = response
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  getDetails() {
    this.getGroupInvites()
    for (let group of this.groupUsers) {
      this.isReady = false
      this.groupsUsersApi
        .getAllGroupsFromUser({
          page: 0,
          onPage: -1,
          idGroup: group.IdGroup ?? 0,
          isAvatar: false,
        })
        .subscribe({
          next: (respose) => {
            if (group.IdGroup == this.idGroup) {
              this.groupUsersActive = respose
            } else {
              this.groupUsersOther.push(...respose)
            }
            this.groupUsersOther = this.groupUsersOther.reduce(
              (acc: GetGroupsUsersResponse[], curr: GetGroupsUsersResponse) => {
                const existing = acc.find((item) => item.IdUser === curr.IdUser)
                if (!existing) {
                  acc.push(curr)
                }
                return acc
              },
              []
            )
            if (this.groupUsersActive.length > 0) {
              this.groupUsersOther = getUsersInGroupANotInGroupB(
                this.groupUsersOther,
                this.groupUsersActive
              )
              console.log(this.groupUsers)
            }
            if (this.groupsInvite.length > 0) {
              const idUsersInTablica1 = new Set(
                this.groupsInvite.map((item) => item.IdUser)
              )
              this.groupUsersOther = this.groupUsersOther.filter(
                (item) => !idUsersInTablica1.has(item.IdUser)
              )
            }
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }

  changeContact(
    $event: IonCheckboxCustomEvent<CheckboxChangeEventDetail<any>>
  ) {
    console.log($event.detail.value)
    if ($event.detail.checked) {
      this.numberArray.push($event.detail.value)
    } else {
      const indexToRemove = this.numberArray.indexOf($event.detail.value)
      if (indexToRemove !== -1) {
        this.numberArray.splice(indexToRemove, 1)
      }
    }
  }

  sendInvites() {
    if (this.numberArray.length > 0) {
      this.isReady = false
      this.groupInviteApi
        .addMultipleGroupInvite({
          getMultipleGroupInviteRequest: {
            IdGroup: this.idGroup,
            IdAuthor: this.userService.loggedUser.ID_USER,
            PhoneNumbers: this.numberArray,
          },
        })
        .subscribe({
          next: () => {
            this.numberArray = []
            this.alert.presentToast(
              this.translate.instant('Invited successfully')
            )
            this.getDetails()
            this.refreshDataService.refresh('invite')
            this.isReady = true
          },
          error: (error) => {
            this.isReady = true
            this.numberArray = []
            this.alert.handleError(error)
          },
        })
    }
  }
}
