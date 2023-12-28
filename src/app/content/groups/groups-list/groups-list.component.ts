import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GetGroupsUsersResponse,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { GroupsComponent } from '../../form/groups/groups.component'
import { Observable, Subscription, forkJoin } from 'rxjs'
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
    private userApi: UsersApi
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
    forkJoin([
      this.groupsUsersApi.getAllGroupsFromUserAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'NAME',
        sortMode: 'ASC',
        idUser: this.idUser,
      }),
      this.userApi.getUserById({
        userId: this.idUser,
      }),
    ]).subscribe({
      next: ([groupResponse, userResponse]) => {
        this.loggedUser = userResponse
        this.groupsUsers = groupResponse
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
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
