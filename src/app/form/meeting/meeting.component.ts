import { TeamsApi } from './../../../../libs/api-client/api/teams.api'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { IonicModule, SelectChangeEventDetail } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupsUsersResponse,
  GetMessagesUsersMeetingsResponse,
  GroupsUsersApi,
  MeetingsApi,
  MessagesApi,
  TEAMS,
} from 'libs/api-client'
import * as moment from 'moment'
import { Observable, forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import { ActivatedRoute } from '@angular/router'
import { UserService } from 'src/app/service/user/user.service'
import { IonSelectCustomEvent } from '@ionic/core'
import { TeamGeneratorComponent } from '../team-generator/team-generator.component'
import { OneToTenValidator } from 'src/app/helper/customValidators'

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
    TeamGeneratorComponent,
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
  idMeeting: number = 0
  meeting!: GetMessagesUsersMeetingsResponse
  isEdit: boolean = true
  numbers: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  color: string[] = [
    '#ff0000',
    '#0000ff',
    '#008000',
    '#ffffff',
    '#000000',
    '#ff84fe',
    '#ffff00',
    '#800080',
    '#ffa500',
    '#808080',
  ]
  collectedData: {
    number: number
    name: string
    color: string
  }[] = []
  lang: string = ''
  teams: TEAMS[] = []

  constructor(
    private fb: FormBuilder,
    private meetingsApi: MeetingsApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    private groupsUsersApi: GroupsUsersApi,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private userService: UserService,
    private messagesApi: MessagesApi,
    private teamsApi: TeamsApi
  ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required],
      place: ['', Validators.required],
      quantity: ['', Validators.required],
      description: [''],
      presence: [true],
      teams: [false],
      quantityTeams: [],
    })
  }

  ngOnInit() {
    this.lang = localStorage.getItem('langUser') ?? 'en'
    this.color.sort(() => Math.random() - 0.5)
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.isEdit = false
        this.isHome = false
        this.idGroup = parseInt(params?.['idGroup'])
        this.getLastMeeting(this.idGroup)
      } else if (params?.['idMeeting'] > 0) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.isEdit = true
        this.isHome = false
        this.getMeeting()
      } else {
        this.getPermission()
        this.isHome = true
        this.isEdit = false
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
      .getAllGroupsFromUser({
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
            if (this.groups.length == 1) {
              this.meetingForm.get('group')?.setValue(this.groups[0])
              this.getLastMeeting(this.groups[0].IdGroup ?? 0)
            }
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
      if (!this.isEdit) {
        if (this.collectedData.length > 0) {
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
                  IdAuthor: this.userService.loggedUser.ID_USER,
                },
                Message: {
                  IdUser: this.userService.loggedUser.ID_USER,
                  Answer: this.meetingForm.value.presence ? 'yes' : 'no',
                },
                Team: this.collectedData.map((item) => ({
                  Name: item.name,
                  Color: item.color,
                })),
              },
            })
            .subscribe({
              next: () => {
                this.alert.presentToast(
                  this.translate.instant('Successully added meeting')
                )
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
        } else {
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
                  IdAuthor: this.userService.loggedUser.ID_USER,
                },
                Message: {
                  IdUser: this.userService.loggedUser.ID_USER,
                  Answer: this.meetingForm.value.presence ? 'yes' : 'no',
                },
              },
            })
            .subscribe({
              next: () => {
                this.alert.presentToast(
                  this.translate.instant('Successully added meeting')
                )
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
      } else {
        this.meetingsApi
          .updateColumnMeeting({
            meetingId: this.idMeeting,
            getUpdateMeetingRequest: {
              DateMeeting: this.meetingForm.value.dateMeeting,
              Place: this.meetingForm.value.place,
              Quantity: this.meetingForm.value.quantity,
              Description: this.meetingForm.value.description,
              Message: {
                IdMeeting: this.idMeeting,
                IdUser: this.userService.loggedUser.ID_USER,
                Answer: this.meetingForm.value.presence ? 'yes' : 'no',
              },
              Column: ['DATE_MEETING', 'PLACE', 'QUANTITY', 'DESCRIPTION'],
            },
          })
          .subscribe({
            next: () => {
              this.alert.presentToast(
                this.translate.instant('Successully update meeting')
              )
              this.meetingForm.reset()
              this.refreshDataService.refresh('meeting-details')
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
  }

  getMeeting() {
    if (this.idMeeting > 0) {
      this.isReady = false
      forkJoin({
        meeting: this.messagesApi.getAllMessages({
          idMeeting: this.idMeeting,
          idUser: this.userService.loggedUser.ID_USER,
          page: 0,
          onPage: -1,
        }),
        teams: this.teamsApi.getAllTeamsFromMeeting({
          meetingId: this.idMeeting,
        }),
      }).subscribe({
        next: (responses) => {
          this.meeting = responses.meeting[0]
          this.teams = responses.teams
          this.meetingForm
            .get('dateMeeting')
            ?.setValue(this.meeting.DateMeeting)
          this.meetingForm.get('place')?.setValue(this.meeting.Place)
          this.meetingForm.get('quantity')?.setValue(this.meeting.Quantity)
          this.meetingForm
            .get('description')
            ?.setValue(this.meeting.Description)
          this.meetingForm
            .get('presence')
            ?.setValue(this.meeting.Answer == 'yes')
          if (responses.teams.length > 0) {
            this.meetingForm.get('teams')?.setValue('true')
            this.meetingForm
              .get('quantityTeams')
              ?.setValue(responses.teams.length)
          }

          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
    }
  }

  getLastMeeting(idGroup: number) {
    if (idGroup > 0) {
      this.isReady = false
      this.meetingsApi
        .getAllMeetings({
          idGroup: idGroup,
          page: 0,
          onPage: 1,
          sortColumn: 'ID_MEETING',
          sortMode: 'DESC',
          idAuthor: this.userService.loggedUser.ID_USER,
        })
        .subscribe({
          next: (response) => {
            this.meeting = response[0]
            if (this.meeting) {
              this.meetingForm.get('place')?.setValue(this.meeting.Place)
              this.meetingForm.get('quantity')?.setValue(this.meeting.Quantity)
              this.meetingForm
                .get('description')
                ?.setValue(this.meeting.Description)
            }
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }

  cancel() {
    window.history.back()
  }

  triggerEvent($event: IonSelectCustomEvent<SelectChangeEventDetail<any>>) {
    this.getLastMeeting($event.detail.value.IdGroup)
  }

  getNumberArray(endNumber: number): number[] {
    return Array.from({ length: endNumber }, (_, index) => index)
  }

  checkInputQuantityTeams(event: KeyboardEvent): void {
    const charCode = event.key
    if (!this.numbers.includes(charCode)) {
      event.preventDefault()
    } else {
      let newValue
      if (this.meetingForm.value.quantityTeams) {
        newValue = this.meetingForm.value.quantityTeams + charCode
      } else {
        newValue = charCode
      }
      if (newValue.length > 1 && newValue !== '10') {
        event.preventDefault()
      }
    }
  }

  checkInputQuantity(event: KeyboardEvent): void {
    const charCode = event.key
    if (!this.numbers.includes(charCode)) {
      event.preventDefault()
    } else {
      let newValue
      if (this.meetingForm.value.quantity) {
        newValue = this.meetingForm.value.quantity + charCode
      } else {
        newValue = charCode
      }
      if (newValue.length > 2 && newValue !== '100') {
        event.preventDefault()
      }
    }
  }

  collectData($event: { number: number; name: string; color: string }) {
    const existingIndex = this.collectedData.findIndex(
      (data) => data.number === $event.number
    )
    if (existingIndex !== -1) {
      this.collectedData[existingIndex] = $event
    } else {
      this.collectedData.push($event)
    }
  }

  changeTeam($event: any) {
    if ($event) {
      this.meetingForm.addControl(
        'quantityTeams',
        this.fb.control('', OneToTenValidator())
      )
    } else {
      this.meetingForm.removeControl('quantityTeams')
    }
  }
}
