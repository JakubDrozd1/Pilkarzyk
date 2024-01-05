import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import {
  GetGroupsUsersResponse,
  GetMeetingGroupsResponse,
  GroupsApi,
  GroupsUsersApi,
  MeetingsApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Subscription, forkJoin } from 'rxjs'
import { MeetingComponent } from '../../form/meeting/meeting.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { UsersComponent } from '../../form/users/users.component'
import { Alert } from 'src/app/helper/alert'
import { FormsModule } from '@angular/forms'
import * as moment from 'moment'
import { GroupsOrganizerComponent } from '../groups-organizer/groups-organizer.component'
import { GroupsUserListComponent } from '../groups-user-list/groups-user-list.component'
import { UserService } from 'src/app/service/user/user.service'

@Component({
  selector: 'app-groups-content',
  templateUrl: './groups-content.component.html',
  styleUrls: ['./groups-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MeetingComponent,
    MeetingContentComponent,
    FormsModule,
    GroupsUserListComponent,
  ],
})
export class GroupsContentComponent implements OnInit {
  idGroup: number | undefined
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  meetings: GetMeetingGroupsResponse[] = []
  nameGroup: string | undefined | null
  add: boolean = false
  private subscription: Subscription = new Subscription()
  selectedSegment: string = 'meetings'
  groupUser!: GetGroupsUsersResponse

  constructor(
    private route: ActivatedRoute,
    private groupsUsersApi: GroupsUsersApi,
    private meetingsApi: MeetingsApi,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupsApi: GroupsApi,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'groups-content') {
          this.isReady = false
          this.getDetails()
        }
      })
    )
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.groupsUsers = []
    this.meetings = []

    forkJoin({
      groupsUsers: this.groupsUsersApi.getAllGroupsFromUserAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'SURNAME',
        sortMode: 'ASC',
        idGroup: this.idGroup,
      }),
      meetings: this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        idGroup: this.idGroup,
        dateFrom: moment().format(),
        idUser: this.userService.loggedUser.ID_USER,
      }),
      groupUser: this.groupsUsersApi.getUserWithGroup({
        userId: Number(this.userService.loggedUser.ID_USER),
        groupId: this.idGroup ?? 0,
      }),
      group: this.groupsApi.getGroupById({
        groupId: this.idGroup ?? 0,
      }),
    }).subscribe({
      next: (responses) => {
        this.groupsUsers = responses.groupsUsers
        this.meetings = responses.meetings
        this.nameGroup = responses.group.NAME
        this.groupUser = responses.groupUser
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.groupsUsers = []
        this.meetings = []
        this.nameGroup = ''
        this.isReady = true
      },
    })
  }

  async openModalAddMeeting() {
    const modal = await this.modalCtrl.create({
      component: MeetingComponent,
      componentProps: {
        idGroup: this.idGroup,
        groupsUsers: this.groupsUsers,
      },
    })
    modal.present()
    await modal.onWillDismiss()
  }

  async openModalAddUser() {
    const modal = await this.modalCtrl.create({
      component: UsersComponent,
      componentProps: {
        idGroup: this.idGroup,
      },
    })
    modal.present()
    await modal.onWillDismiss()
  }

  async openModalAddOrganizer() {
    const modal = await this.modalCtrl.create({
      component: GroupsOrganizerComponent,
      componentProps: {
        idGroup: this.idGroup,
      },
    })
    modal.present()
    await modal.onWillDismiss()
  }
}
