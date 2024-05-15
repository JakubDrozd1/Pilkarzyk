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
import {
  AlertController,
  IonicModule,
  SelectChangeEventDetail,
} from '@ionic/angular'
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
import { Observable } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from 'src/app/service/user/user.service'
import { IonSelectCustomEvent } from '@ionic/core'
import { TeamGeneratorComponent } from '../team-generator/team-generator.component'
import { OneToTenValidator } from 'src/app/helper/customValidators'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'
import { EditTeamGeneratorModalComponent } from 'src/app/modal/edit-team-generator-modal/edit-team-generator-modal.component'

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
    EditTeamGeneratorModalComponent,
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
  lang: string | null = ''
  teams: TEAMS[] = []
  public alertButtons = [
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.deleteMeeting()
      },
    },
  ]
  alertOpened: boolean = false

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
    private teamsApi: TeamsApi,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required],
      place: ['', Validators.required],
      quantity: ['', Validators.required],
      description: [''],
      presence: [true],
      teams: [false],
      isIndependent: [false],
      quantityTeams: [],
    })
  }

  ngOnInit() {
    this.setLanguage()
    this.color.sort(() => Math.random() - 0.5)
    this.route.params.subscribe((params) => {
      if (window.location.pathname.includes('edit')) {
        this.idMeeting = parseInt(params?.['idMeeting'])
        this.isEdit = true
        this.isHome = false
        this.getMeeting()
        if (params?.['idGroup'] > 0) {
          this.idGroup = parseInt(params?.['idGroup'])
        }
      } else {
        if (params?.['idGroup'] > 0) {
          this.isEdit = false
          this.isHome = false
          this.idGroup = parseInt(params?.['idGroup'])
          this.getLastMeeting(this.idGroup)
        } else {
          this.getPermission()
          this.isHome = true
          this.isEdit = false
          this.meetingForm.addControl(
            'group',
            this.fb.control('', Validators.required)
          )
        }
      }
    })
    this.displayDate = moment().add(this.delay, 'hours').format()
    this.meetingForm
      .get('dateMeeting')
      ?.setValue(moment().add(this.delay, 'hours').format())
    this.meetingForm.get('quantityTeams')?.valueChanges.subscribe(() => {
      this.collectedData = []
    })

    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss(null, 'cancel')
          this.cancelAlert()
        }
      }
    })
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
                  Place: this.meetingForm.value.place.trim(),
                  Quantity: this.meetingForm.value.quantity,
                  Description: this.meetingForm.value.description
                    ? this.meetingForm.value.description.trim()
                    : null,
                  IdGroup: this.isHome
                    ? this.meetingForm.value.group.IdGroup
                    : this.idGroup,
                  IdAuthor: this.userService.loggedUser.ID_USER,
                  IsIndependent: this.meetingForm.value.isIndependent,
                },
                Message: {
                  IdUser: this.userService.loggedUser.ID_USER,
                  Answer: this.meetingForm.value.presence ? 'yes' : 'no',
                },
                Team: this.collectedData.map((item) => ({
                  Name: item.name.trim(),
                  Color: item.color.trim(),
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
                this.isReady = true
                this.cancel()
              },
              error: (error) => {
                this.alert.handleError(error)
                this.isReady = true
                this.cancel()
              },
            })
        } else {
          this.meetingsApi
            .addMeeting({
              getUsersMeetingsRequest: {
                Meeting: {
                  DateMeeting: this.meetingForm.value.dateMeeting,
                  Place: this.meetingForm.value.place.trim(),
                  Quantity: this.meetingForm.value.quantity,
                  Description: this.meetingForm.value.description
                    ? this.meetingForm.value.description.trim()
                    : null,
                  IdGroup: this.isHome
                    ? this.meetingForm.value.group.IdGroup
                    : this.idGroup,
                  IdAuthor: this.userService.loggedUser.ID_USER,
                  IsIndependent: this.meetingForm.value.isIndependent,
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
                this.isReady = true
                this.cancel()
              },
              error: (error) => {
                this.alert.handleError(error)
                this.isReady = true
                this.cancel()
              },
            })
        }
      } else {
        this.meetingsApi
          .updateColumnMeeting({
            meetingId: this.idMeeting,
            getUpdateMeetingRequest: {
              DateMeeting: this.meetingForm.value.dateMeeting,
              Place: this.meetingForm.value.place.trim(),
              Quantity: this.meetingForm.value.quantity,
              Description: this.meetingForm.value.description
                ? this.meetingForm.value.description.trim()
                : null,
              IsIndependent: this.meetingForm.value.isIndependent,
              Message: {
                IdMeeting: this.idMeeting,
                IdUser: this.userService.loggedUser.ID_USER,
                Answer: this.meetingForm.value.presence ? 'yes' : 'no',
              },
              Column: [
                'DATE_MEETING',
                'PLACE',
                'QUANTITY',
                'DESCRIPTION',
                'IS_INDEPENDENT',
              ],
            },
          })
          .subscribe({
            next: () => {
              this.alert.presentToast(
                this.translate.instant('Successully update meeting')
              )
              this.meetingForm.reset()
              this.refreshDataService.refresh('meeting-details')
              this.isReady = true
              this.cancel()
            },
            error: (error) => {
              this.alert.handleError(error)
              this.isReady = true
              this.cancel()
            },
          })
      }
    }
  }

  getMeeting() {
    if (this.idMeeting > 0) {
      this.isReady = false
      this.messagesApi
        .getAllMessages({
          idMeeting: this.idMeeting,
          idUser: this.userService.loggedUser.ID_USER,
          page: 0,
          onPage: -1,
        })
        .subscribe({
          next: (response) => {
            this.meeting = response[0]
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
            this.meetingForm
              .get('isIndependent')
              ?.setValue(this.meeting.IsIndependent)
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
      this.collectedData = []
      this.meetingForm.get('teams')?.reset()
      this.meetingForm.get('quantityTeams')?.reset()
      this.meetingForm.get('place')?.reset()
      this.meetingForm.get('quantity')?.reset()
      this.meetingForm.get('description')?.reset()
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
              this.teamsApi
                .getAllTeamsFromMeeting({
                  meetingId: this.meeting.IdMeeting ?? 0,
                })
                .subscribe({
                  next: (response) => {
                    if (this.meeting) {
                      this.meetingForm
                        .get('place')
                        ?.setValue(this.meeting.Place)
                      this.meetingForm
                        .get('quantity')
                        ?.setValue(this.meeting.Quantity)
                      this.meetingForm
                        .get('description')
                        ?.setValue(this.meeting.Description)
                      this.meetingForm
                        .get('isIndependent')
                        ?.setValue(this.meeting.IsIndependent)
                    }
                    this.teams = response
                    if (this.teams.length > 0) {
                      this.meetingForm.get('teams')?.setValue(true)
                      this.meetingForm.addControl(
                        'quantityTeams',
                        this.fb.control('', OneToTenValidator())
                      )
                      this.meetingForm
                        .get('quantityTeams')
                        ?.valueChanges.subscribe(() => {
                          this.collectedData = []
                        })
                      this.meetingForm
                        .get('quantityTeams')
                        ?.setValue(this.teams.length)
                    }

                    this.isReady = true
                  },
                  error: (error) => {
                    this.alert.handleError(error)
                    this.isReady = true
                  },
                })
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
    if (!this.isEdit) {
      if (window.location.pathname.includes('home')) {
        this.router.navigate(['/home'])
      }
      if (window.location.pathname.includes('groups')) {
        this.router.navigate(['/groups/' + this.idGroup])
      }
    } else {
      var meetingPath = '/meeting/' + this.idMeeting
      if (window.location.pathname.includes('home')) {
        this.router.navigate(['/home' + meetingPath])
      }
      if (window.location.pathname.includes('groups')) {
        this.router.navigate(['/groups/' + this.idGroup + meetingPath])
      }
      if (window.location.pathname.includes('notification')) {
        this.router.navigate(['/notification' + meetingPath])
      }
      if (window.location.pathname.includes('calendar')) {
        this.router.navigate(['/calendar' + meetingPath])
      }
    }
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
      this.meetingForm.get('quantityTeams')?.valueChanges.subscribe(() => {
        this.collectedData = []
      })
    } else {
      this.meetingForm.removeControl('quantityTeams')
      this.collectedData = []
    }
  }

  async setLanguage() {
    this.lang = localStorage.getItem('langUser')
    if (this.lang == null) {
      if (Capacitor.isNativePlatform()) {
        this.lang = (await Device.getLanguageCode()).value
      } else {
        this.lang = window.navigator.language
      }
      if (this.lang == 'pl' || this.lang == 'en') {
        this.translate.setDefaultLang(this.lang)
        this.translate.use(this.lang)
      } else {
        this.lang = 'en'
        this.translate.setDefaultLang(this.lang)
        this.translate.use(this.lang)
      }
    } else {
      this.translate.setDefaultLang(this.lang)
      this.translate.use(this.lang)
    }
  }

  cancelMeeting() {
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    this.alertOpened = true
  }

  deleteMeeting() {
    this.isReady = false
    this.meetingsApi
      .deleteMeeting({
        meetingId: this.idMeeting,
      })
      .subscribe({
        next: () => {
          if (window.location.pathname.includes('home')) {
            this.router.navigate(['/home'])
          }
          if (window.location.pathname.includes('groups')) {
            this.router.navigate(['/groups/' + this.idGroup])
          }
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  cancelAlert() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { alertOpened: null },
      replaceUrl: true,
    })
    this.alertOpened = false
  }
}
