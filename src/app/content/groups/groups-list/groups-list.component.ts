import { CommonModule } from '@angular/common'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import {
  GetGroupsUsersResponse,
  GroupsApi,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Observable, Subscription } from 'rxjs'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Alert } from 'src/app/helper/alert'
import { UserService } from 'src/app/service/user/user.service'
import { FormsModule } from '@angular/forms'
import { GroupsUserListComponent } from '../groups-user-list/groups-user-list.component'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { NotificationService } from 'src/app/service/notification/notification.service'

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
    TranslateModule,
    SpinnerComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GroupsListComponent implements OnInit {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  groupsUsers: GetGroupsUsersResponse[] = []
  isReadyGroups: boolean = false
  isReadyMembers: boolean = false
  private subscription: Subscription = new Subscription()
  meetingNotifications!: Observable<number>
  users: GetGroupsUsersResponse[] = []
  segmentList: Array<string> = ['groups', 'members']
  selectedSegment: string = this.segmentList[0]
  visitedGroups: boolean = true
  visitedMembers: boolean = true

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupApi: GroupsApi,
    public userService: UserService,
    private usersApi: UsersApi,
    public translate: TranslateService,
    public notificationService: NotificationService
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
    if (this.selectedSegment == 'groups' && this.visitedGroups) {
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
                this.visitedGroups = false
              },
              error: (error) => {
                this.alert.handleError(error)
                this.isReadyGroups = true
                this.visitedGroups = false
              },
            })
        : this.groupsUsersApi
            .getAllGroupsFromUserAsync({
              page: 0,
              onPage: -1,
              sortColumn: 'NAME',
              sortMode: 'ASC',
              idUser: this.userService.loggedUser.ID_USER,
              isAvatar: false,
            })
            .subscribe({
              next: (groupResponse) => {
                this.groupsUsers = groupResponse
                this.isReadyGroups = true
                this.visitedGroups = false
              },
              error: (error) => {
                this.alert.handleError(error)
                this.isReadyGroups = true
                this.visitedGroups = false
              },
            })
    } else if (this.selectedSegment == 'members' && this.visitedMembers) {
      this.isReadyMembers = false
      this.isReadyGroups = true
      this.users = []
      this.usersApi
        .getAllUsers({
          page: 0,
          onPage: -1,
          sortColumn: 'SURNAME',
          sortMode: 'ASC',
          isAvatar: true,
        })
        .subscribe({
          next: (response) => {
            this.users = convertUsersToGetGroupsUsersResponse(response)
            this.isReadyMembers = true
            this.visitedMembers = false
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReadyMembers = true
            this.visitedMembers = false
          },
        })
    }
  }

  reload() {
    this.isReadyMembers = false
    this.isReadyGroups = false
    this.visitedGroups = true
    this.visitedMembers = true
    this.userService.getDetails()
    this.getGroups()
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.getGroups()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
      this.getGroups()
    }
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }
}
