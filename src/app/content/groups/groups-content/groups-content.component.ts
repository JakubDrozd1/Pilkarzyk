import { CommonModule } from '@angular/common'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import {
  GROUPS,
  GetGroupsUsersResponse,
  GetMeetingGroupsResponse,
  GroupsApi,
  GroupsUsersApi,
  MeetingsApi,
} from 'libs/api-client'
import { Subscription, forkJoin } from 'rxjs'
import { MeetingComponent } from '../../../form/meeting/meeting.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { MeetingContentComponent } from '../../meeting/meeting-content/meeting-content.component'
import { Alert } from 'src/app/helper/alert'
import { FormsModule } from '@angular/forms'
import * as moment from 'moment'
import { GroupsUserListComponent } from '../groups-user-list/groups-user-list.component'
import { UserService } from 'src/app/service/user/user.service'
import { SwiperContainer } from 'swiper/element'
import { IonRefresherCustomEvent, RefresherEventDetail } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { NotificationService } from 'src/app/service/notification/notification.service'
import { GroupsDetailComponent } from '../groups-detail/groups-detail.component'

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
    TranslateModule,
    SpinnerComponent,
    RouterLink,
    GroupsDetailComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GroupsContentComponent implements OnInit {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  idGroup: number = 0
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  meetings: GetMeetingGroupsResponse[] = []
  add: boolean = false
  private subscription: Subscription = new Subscription()
  groupUser!: GetGroupsUsersResponse
  segmentList: Array<string> = ['details', 'meetings', 'ranking']
  selectedSegment: string = this.segmentList[0]
  permission: boolean = false
  showMenuItem: boolean = true
  group!: GROUPS

  constructor(
    private route: ActivatedRoute,
    private groupsUsersApi: GroupsUsersApi,
    private meetingsApi: MeetingsApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupsApi: GroupsApi,
    public userService: UserService,
    public translate: TranslateService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'groups-content') {
          this.reload()
        }
      })
    )
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.reload()
      }
    })
  }

  getDetails() {
    this.isReady = false
    forkJoin({
      group: this.groupsApi.getGroupById({
        groupId: this.idGroup ?? 0,
      }),
      groupUser: this.groupsUsersApi.getUserWithGroup({
        userId: Number(this.userService.loggedUser.ID_USER),
        groupId: this.idGroup ?? 0,
      }),
    }).subscribe({
      next: (responses) => {
        this.group = responses.group
        this.groupUser = responses.groupUser
        if (this.groupUser != null) {
          if (!this.groupUser.IsModerated) {
            this.permission = true
          } else {
            if (this.groupUser) {
              this.permission = Boolean(this.groupUser.AccountType)
            }
          }
        } else if (this.userService.loggedUser.IS_ADMIN) {
          this.permission = true
        } else {
          this.router.navigate(['/home'])
        }
        this.isReady = true
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isReady = true
      },
    })
  }

  getSegmentDetails() {
    if (this.selectedSegment == 'meetings') {
      this.isReady = false
      this.isReady = false//???????
      this.meetings = []
      this.meetingsApi
        .getAllMeetings({
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          idGroup: this.idGroup,
          dateFrom: moment().format(),
          idUser: this.userService.loggedUser.ID_USER,
          withMessages: true,
        })
        .subscribe({
          next: (response) => {
            this.meetings = response
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.groupsUsers = []
            this.meetings = []
            this.isReady = true
          },
        })
    } else if (this.selectedSegment == 'details') {
      this.groupsUsers = []
      this.isReady = false
      this.groupsUsersApi
        .getAllGroupsFromUser({
          page: 0,
          onPage: -1,
          sortColumn: 'SURNAME',
          sortMode: 'ASC',
          idGroup: this.idGroup,
          isAvatar: true,
        })
        .subscribe({
          next: (response) => {
            this.groupsUsers = response
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.groupsUsers = []
            this.meetings = []
            this.isReady = true
          },
        })
    }
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.getSegmentDetails()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
      this.getSegmentDetails()
    }
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }

  reload() {
    this.getDetails()
    this.getSegmentDetails()
  }

  showMenuItems() {
    this.showMenuItem = !this.showMenuItem
  }

  cancel() {
    this.router.navigate(['/groups'])
  }
}
