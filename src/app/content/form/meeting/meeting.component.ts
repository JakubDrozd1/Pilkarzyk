import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { IonicModule, ModalController, NavParams } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupsUsersResponse,
  GroupsUsersApi,
  MeetingsApi,
  UsersMeetingsApi,
} from 'libs/api-client'
import * as moment from 'moment'
import { Observable } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'

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
  @Input() idGroup: number = 0
  @Input() groupsUsers: GetGroupsUsersResponse[] = []

  meetingForm: FormGroup
  displayDate: any
  idUsers: number[] = []
  meetingNotifications!: Observable<number>
  delay: number = 3
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private meetingsApi: MeetingsApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private usersMeetingsApi: UsersMeetingsApi,
    private groupsUsersApi: GroupsUsersApi,
    public translate: TranslateService
  ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required],
      place: ['', Validators.required],
      quantity: ['', Validators.required],
      description: [''],
    })
  }

  ngOnInit() {
    this.displayDate = moment().add(this.delay, 'hours').format()
    this.meetingForm
      .get('dateMeeting')
      ?.setValue(moment().add(this.delay, 'hours').format())
    if (this.groupsUsers.length <= 0) {
      this.getGroupUsers()
    }
  }

  getGroupUsers() {
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
        },
        error: () => {
          this.alert.alertNotOk()
          this.groupsUsers = []
          this.isReady = true
        },
      })
  }

  onSubmit() {
    this.meetingForm.markAllAsTouched()
    if (this.meetingForm.valid) {
      this.isReady = false
      this.meetingsApi
        .addMeeting({
          getMeetingRequest: {
            DateMeeting: this.meetingForm.value.dateMeeting,
            Place: this.meetingForm.value.place,
            Quantity: this.meetingForm.value.quantity,
            Description: this.meetingForm.value.description,
            IdGroup: this.idGroup,
          },
        })
        .subscribe({
          next: (meetingResponse) => {
            const meetingId = meetingResponse.ID_MEETING
            for (let user of this.groupsUsers) {
              this.idUsers.push(Number(user.IdUser))
            }
            this.usersMeetingsApi
              .addUsersToMeetingAsync({
                idUsers: this.idUsers,
                idMeeting: meetingId,
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
          },
          error: (error) => {
            this.alert.handleError(error)
            this.cancel()
            this.isReady = true
          },
        })
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }
}
