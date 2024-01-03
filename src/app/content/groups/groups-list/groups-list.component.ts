import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GROUPS,
  GetGroupsUsersResponse,
  GroupsApi,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { GroupsComponent } from '../../form/groups/groups.component'
import { Observable, Subscription, forkJoin, mergeMap } from 'rxjs'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Alert } from 'src/app/helper/alert'
import { NotificationService } from 'src/app/service/notification/notification.service'

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class GroupsListComponent implements OnInit {
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  idUser: number = 0
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  loggedUser!: USERS

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    public notificationService: NotificationService,
    private userApi: UsersApi,
    private groupApi: GroupsApi
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'groups-list') {
          this.reload()
        }
      })
    )
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getGroups()
  }

  getGroups() {
    this.groupsUsers = []

    this.userApi.getUserById({ userId: this.idUser }).subscribe({
      next: (response) => {
        this.loggedUser = response
        this.loggedUser.IS_ADMIN
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
                  this.isReady = true
                },
                error: () => {
                  this.alert.alertNotOk()
                  this.isReady = true
                },
              })
          : this.groupsUsersApi
              .getAllGroupsFromUserAsync({
                page: 0,
                onPage: -1,
                sortColumn: 'NAME',
                sortMode: 'ASC',
                idUser: this.idUser,
              })
              .subscribe({
                next: (groupResponse) => {
                  this.groupsUsers = groupResponse
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
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: GroupsComponent,
    })
    modal.present()
    await modal.onWillDismiss()
  }

  reload() {
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getGroups()
  }
}
