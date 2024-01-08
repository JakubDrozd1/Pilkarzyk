import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GetGroupsUsersResponse,
  GroupsApi,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { GroupsComponent } from '../../form/groups/groups.component'
import { Observable, Subscription } from 'rxjs'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Alert } from 'src/app/helper/alert'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { UserService } from 'src/app/service/user/user.service'
import { FormsModule } from '@angular/forms'
import { GroupsUserListComponent } from '../groups-user-list/groups-user-list.component'

function convertUsersToGetGroupsUsersResponse(
  users: USERS[]
): GetGroupsUsersResponse[] {
  return users.map((user) => ({
    Name: user.FIRSTNAME,
    Login: user.LOGIN,
    Email: user.EMAIL,
    Firstname: user.FIRSTNAME,
    Surname: user.SURNAME,
    PhoneNumber: user.PHONE_NUMBER,
    IsAdmin: user.IS_ADMIN,
    IdUser: user.ID_USER,
    Avatar: user.AVATAR,
  }))
}

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    FormsModule,
    GroupsUserListComponent,
  ],
})
export class GroupsListComponent implements OnInit {
  groupsUsers: GetGroupsUsersResponse[] = []
  isReadyGroups: boolean = false
  isReadyMembers: boolean = false
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  selectedSegment: string = 'groups'
  users: GetGroupsUsersResponse[] = []

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    public notificationService: NotificationService,
    private groupApi: GroupsApi,
    public userService: UserService,
    private usersApi: UsersApi
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'groups-list') {
          this.reload()
        }
      })
    )
    this.getGroups()
  }

  getGroups() {
    if (this.selectedSegment == 'groups') {
      this.groupsUsers = []
      this.isReadyGroups = false
      this.isReadyMembers = true
      this.userService.loggedUser.IS_ADMIN
        ? this.groupApi
            .getAllGroups({
              page: 0,
              onPage: -1,
              sortColumn: 'NAME',
              sortMode: 'ASC',
            })
            .subscribe({
              next: (groupResponse) => {
                this.groupsUsers = groupResponse.map((item) => ({
                  Name: item.NAME,
                  IdGroup: item.ID_GROUP,
                }))
                this.isReadyGroups = true
              },
              error: () => {
                this.alert.alertNotOk()
                this.isReadyGroups = true
              },
            })
        : this.groupsUsersApi
            .getAllGroupsFromUserAsync({
              page: 0,
              onPage: -1,
              sortColumn: 'NAME',
              sortMode: 'ASC',
              idUser: this.userService.loggedUser.ID_USER,
            })
            .subscribe({
              next: (groupResponse) => {
                this.groupsUsers = groupResponse
                this.isReadyGroups = true
              },
              error: () => {
                this.alert.alertNotOk()
                this.isReadyGroups = true
              },
            })
    } else if (this.selectedSegment == 'members') {
      this.isReadyMembers = false
      this.isReadyGroups = true
      this.users = []
      this.usersApi
        .getAllUsers({
          page: 0,
          onPage: -1,
          sortColumn: 'SURNAME',
          sortMode: 'ASC',
        })
        .subscribe({
          next: (response) => {
            this.users = convertUsersToGetGroupsUsersResponse(response)
            this.isReadyMembers = true
          },
          error: () => {
            this.alert.alertNotOk()
            this.isReadyMembers = true
          },
        })
    }
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: GroupsComponent,
    })
    modal.present()
    await modal.onWillDismiss()
  }

  reload() {
    this.isReadyMembers = false
    this.isReadyGroups = false
    this.getGroups()
  }

  onSegmentChange(select: string) {
    this.selectedSegment = select
    this.reload()
  }
}
