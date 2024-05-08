import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import {
  IonicModule,
  ModalController,
  RefresherEventDetail,
} from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import {
  GetGroupInviteResponse,
  GetGroupsUsersResponse,
  GroupInvitesApi,
  GroupsUsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { UsersComponent } from '../../../form/users/users.component'
import { IonRefresherCustomEvent } from '@ionic/core'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription, forkJoin } from 'rxjs'
import { UserService } from 'src/app/service/user/user.service'
import { AddUserFromGroupComponent } from 'src/app/modal/add-user-from-group/add-user-from-group.component'

@Component({
  selector: 'app-groups-user-add',
  templateUrl: './groups-user-add.component.html',
  styleUrls: ['./groups-user-add.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent,
    RouterLink,
    UsersComponent,
  ],
})
export class GroupsUserAddComponent implements OnInit {
  idGroup: number = 0
  invites: GetGroupInviteResponse[] = []
  isReady: boolean = true
  private subscription: Subscription = new Subscription()
  numberOfGroups: number = 0
  modalOpened: boolean = false
  groupUsers: GetGroupsUsersResponse[] = []

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupInvites: GroupInvitesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupsUsers: GroupsUsersApi,
    private userService: UserService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'invite') {
          this.reload()
        }
      })
    )
    this.reload()
  }

  reload() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.invites = []
    this.isReady = false
    forkJoin({
      groupInvites: this.groupInvites.getGroupInviteByIdUser({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_ADD',
        sortMode: 'DESC',
        idGroup: this.idGroup,
      }),
      groupsUsers: this.groupsUsers.getAllGroupsFromUser({
        onPage: -1,
        page: 0,
        isAvatar: false,
        idUser: this.userService.loggedUser.ID_USER,
      }),
    }).subscribe({
      next: (responses) => {
        const currentDate = new Date()
        const twentyFourHoursAgo = new Date(
          currentDate.getTime() - 24 * 60 * 60 * 1000
        )
        this.invites = responses.groupInvites.filter((invite) => {
          if (invite.IdUser == null) {
            const dateAdd = new Date(String(invite.DateAdd))
            return dateAdd > twentyFourHoursAgo
          } else {
            return true
          }
        })
        this.numberOfGroups = responses.groupsUsers.filter(
          (t) => t.AccountType == 1 || t.IsModerated == false
        ).length
        this.groupUsers = responses.groupsUsers.filter(
          (t) => t.AccountType == 1 || t.IsModerated == false
        )
        this.isReady = true
      },
      error: (error) => {
        this.invites = []
        this.alert.handleError(error)
        this.isReady = true
      },
    })
  }

  cancel() {
    this.router.navigate(['/groups', this.idGroup])
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }

  async openModalAddUserFromGroup() {
    const modal = await this.modalCtrl.create({
      component: AddUserFromGroupComponent,
      componentProps: {
        idGroup: this.idGroup,
        isOpened: true,
        groupUsers: this.groupUsers,
      },
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?modalOpened=true')
    this.modalOpened = true
    modal.present()
    await modal.onWillDismiss()
  }
}
