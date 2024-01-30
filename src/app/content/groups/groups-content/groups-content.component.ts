import { CommonModule } from '@angular/common'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import {
  GetGroupsUsersResponse,
  GetMeetingGroupsResponse,
  GroupsApi,
  GroupsUsersApi,
  MeetingsApi,
} from 'libs/api-client'
import { Subscription, forkJoin } from 'rxjs'
import { MeetingComponent } from '../../form/meeting/meeting.component'
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GroupsContentComponent implements OnInit {
  @ViewChild('swiperContainer', { read: ElementRef, static: false })
  swiperContainer!: ElementRef<SwiperContainer>

  idGroup: number | undefined
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  meetings: GetMeetingGroupsResponse[] = []
  nameGroup: string | undefined | null
  add: boolean = false
  private subscription: Subscription = new Subscription()
  groupUser!: GetGroupsUsersResponse
  segmentList: Array<string> = ['meetings', 'members', 'ranking']
  selectedSegment: string = this.segmentList[0]
  visitedMeetings: boolean = true
  visitedMembers: boolean = true
  visitedRanking: boolean = true
  permission: boolean = false

  constructor(
    private route: ActivatedRoute,
    private groupsUsersApi: GroupsUsersApi,
    private meetingsApi: MeetingsApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupsApi: GroupsApi,
    public userService: UserService,
    public translate: TranslateService
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
        this.getDetails()
      }
    })
  }

  getDetails() {
    if (this.selectedSegment == 'meetings' && this.visitedMeetings) {
      this.isReady = false
      this.meetings = []
      forkJoin({
        meetings: this.meetingsApi.getAllMeetings({
          page: 0,
          onPage: -1,
          sortColumn: 'DATE_MEETING',
          sortMode: 'ASC',
          idGroup: this.idGroup,
          dateFrom: moment().format(),
          idUser: this.userService.loggedUser.ID_USER,
        }),
        group: this.groupsApi.getGroupById({
          groupId: this.idGroup ?? 0,
        }),
        groupUser: this.groupsUsersApi.getUserWithGroup({
          userId: Number(this.userService.loggedUser.ID_USER),
          groupId: this.idGroup ?? 0,
        }),
      }).subscribe({
        next: (responses) => {
          this.meetings = responses.meetings
          this.nameGroup = responses.group.NAME
          this.groupUser = responses.groupUser
          if (this.groupUser) {
            this.permission = Boolean(this.groupUser.AccountType)
          }
          if (!this.permission) {
            this.permission = Boolean(this.userService.loggedUser.IS_ADMIN)
          }
          this.isReady = true
          this.visitedMeetings = false
        },
        error: () => {
          this.alert.alertNotOk()
          this.groupsUsers = []
          this.meetings = []
          this.nameGroup = ''
          this.isReady = true
          this.visitedMeetings = false
        },
      })
    } else if (this.selectedSegment == 'members' && this.visitedMembers) {
      this.groupsUsers = []
      this.isReady = false
      this.groupsUsersApi
        .getAllGroupsFromUserAsync({
          page: 0,
          onPage: -1,
          sortColumn: 'SURNAME',
          sortMode: 'ASC',
          idGroup: this.idGroup,
        })
        .subscribe({
          next: (response) => {
            this.groupsUsers = response
            this.isReady = true
            this.visitedMembers = false
          },
          error: () => {
            this.alert.alertNotOk()
            this.groupsUsers = []
            this.meetings = []
            this.nameGroup = ''
            this.isReady = true
            this.visitedMembers = false
          },
        })
    }
  }

  onSegmentChange(select: string) {
    this.swiperContainer.nativeElement.swiper.slideTo(
      this.segmentList.indexOf(select)
    )
    this.selectedSegment = select
    this.getDetails()
  }

  swiperSlideChange() {
    if (this.swiperContainer.nativeElement.swiper.activeIndex != null) {
      this.selectedSegment =
        this.segmentList[this.swiperContainer.nativeElement.swiper.activeIndex]
      this.getDetails()
    }
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.reload()
      $event.target.complete()
    }, 2000)
  }

  reload() {
    this.isReady = false
    this.visitedMeetings = true
    this.visitedMembers = true
    this.visitedRanking = true
    this.getDetails()
  }
}
