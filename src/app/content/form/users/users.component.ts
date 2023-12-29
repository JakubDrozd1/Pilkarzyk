import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { RouterLink } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { IonicModule, ModalController } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core'
import {
  GroupInvitesApi,
  GroupsApi,
  GroupsUsersApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    MaskitoModule,
    RouterLink,
  ],
})
export class UsersComponent implements OnInit {
  @Input() idGroup: number = 0

  results: USERS[] = []
  users: USERS[] = []
  user: USERS | undefined
  addExistingUserForm: FormGroup
  idUser: number = 0
  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  addNewUserForm: FormGroup

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupsApi: GroupsApi,
    private groupInviteApi: GroupInvitesApi
  ) {
    this.addExistingUserForm = this.fb.group({
      user: ['', Validators.required],
    })
    this.addNewUserForm = this.fb.group({
      email: [''],
      phoneNumber: [''],
    })
  }

  ngOnInit() {
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getUsers()
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }

  handleInput() {
    let query = ''
    query = this.addExistingUserForm.get('user')?.value.toLowerCase().trim()
    if (query != '') {
      this.results = this.users.filter((d) => {
        const firstNameLowerCase = d.FIRSTNAME ? d.FIRSTNAME.toLowerCase() : ''
        const surnameLowerCase = d.SURNAME ? d.SURNAME.toLowerCase() : ''
        return (
          firstNameLowerCase.indexOf(query) > -1 ||
          surnameLowerCase.indexOf(query) > -1
        )
      })
    } else {
      this.results = []
    }
  }

  removeFocus() {
    if (Capacitor.isNativePlatform()) {
      Keyboard.hide()
    }
  }

  add(item: USERS) {
    this.addExistingUserForm
      .get('user')
      ?.setValue(item.FIRSTNAME + ' ' + item.SURNAME)
    this.user = item
    this.results = []
  }

  getUsers() {
    this.users = []
    this.usersApi
      .getAllUsersWithoutGroupAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'SURNAME',
        sortMode: 'ASC',
        idGroup: this.idGroup,
      })
      .subscribe({
        next: (response) => {
          this.users = response
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }

  onSubmitExisting() {
    this.addExistingUserForm.markAllAsTouched()
    if (this.addExistingUserForm.valid) {
      this.groupInviteApi
        .addGroupInviteAsync({
          getGroupInviteRequest: {
            IdGroup: this.idGroup,
            IdUser: this.user?.ID_USER,
            IdAuthor: this.idUser,
          },
        })
        .subscribe({
          next: () => {
            this.alert.alertOk('Zaproszono pomyślnie')
            this.refreshDataService.refresh('groups-content')
            this.cancel()
          },
          error: () => {
            this.alert.alertNotOk()
            this.cancel()
          },
        })
    }
  }

  onSubmitNew() {
    this.addExistingUserForm.markAllAsTouched()
    if (this.addNewUserForm.valid) {
      if (this.addNewUserForm.value.email) {
        forkJoin({
          user: this.usersApi.getUserById({
            userId: this.idUser,
          }),
          group: this.groupsApi.getGroupById({
            groupId: this.idGroup,
          }),
        }).subscribe({
          next: (responses) => {
            this.usersApi
              .sendInvitationEmail({
                getEmailSenderRequest: {
                  To: this.addNewUserForm.value.email,
                  Name: responses.user.FIRSTNAME,
                  Surname: responses.user.SURNAME,
                  GroupName: responses.group.NAME,
                  IdGroup: this.idGroup,
                },
              })
              .subscribe({
                next: () => {
                  this.alert.alertOk('Wysłano emaila z zaproszeniem')
                },
                error: () => {
                  this.alert.alertNotOk()
                },
              })
          },
          error: () => {
            this.alert.alertNotOk()
          },
        })
      }
    }
  }
}
