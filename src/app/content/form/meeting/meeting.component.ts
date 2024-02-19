import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupsUsersResponse,
  GroupsUsersApi,
  MeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Observable } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from 'src/app/service/user/user.service'

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class MeetingComponent implements OnInit {
  idGroup: number = 0
  groupsUsers: GetGroupsUsersResponse[] = []
  meetingForm: FormGroup
  displayDate: any
  meetingNotifications!: Observable<number>
  delay: number = 0
  isReady: boolean = true
  groups: GetGroupsUsersResponse[] = []
  isHome: boolean = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private meetingsApi: MeetingsApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupsUsersApi: GroupsUsersApi,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required],
      place: ['', Validators.required],
      quantity: ['', Validators.required],
      description: [''],
      presence: [true],
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.isHome = false
      } else {
        this.getPermission()
        this.isHome = true
        this.meetingForm.addControl(
          'group',
          this.fb.control('', Validators.required)
        )
      }
    })
    this.displayDate = moment().add(this.delay, 'hours').format()
    this.meetingForm
      .get('dateMeeting')
      ?.setValue(moment().add(this.delay, 'hours').format())
  }

  getPermission() {
    this.groupsUsersApi
      .getAllGroupsFromUserAsync({
        page: 0,
        onPage: -1,
        idUser: this.userService.loggedUser.ID_USER,
        isAvatar: false,
      })
      .subscribe({
        next: (response) => {
          if (this.userService.loggedUser.IS_ADMIN) {
            this.groups = response
          } else {
            this.groups = response.filter((obj) => obj.AccountType === 1)
          }
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  onSubmit() {
    this.meetingForm.markAllAsTouched()
    if (this.meetingForm.valid) {
      this.isReady = false
      this.meetingsApi
        .addMeeting({
          getUsersMeetingsRequest: {
            Meeting: {
              DateMeeting: this.meetingForm.value.dateMeeting,
              Place: this.meetingForm.value.place,
              Quantity: this.meetingForm.value.quantity,
              Description: this.meetingForm.value.description,
              IdGroup: this.isHome
                ? this.meetingForm.value.group.IdGroup
                : this.idGroup,
            },
            Message: {
              IdUser: this.userService.loggedUser.ID_USER,
              Answer: this.meetingForm.value.presence ? 'yes' : 'no',
            },
          },
        })
        .subscribe({
          next: () => {
            this.alert.alertOk()
            this.meetingForm.reset()
            this.refreshDataService.refresh('groups-content')
            this.cancel()
          },
          error: (error) => {
            this.alert.handleError(error)
            this.cancel()
            this.isReady = true
          },
        })
    }
  }

  async cancel() {
    if (this.isHome) {
      this.router.navigate(['/home'])
    } else {
      this.router.navigate(['/groups', this.idGroup])
    }
  }
}
