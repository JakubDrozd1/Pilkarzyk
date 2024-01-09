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
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GroupInvitesApi, GroupsApi, USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'

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
    TranslateModule,
  ],
})
export class UsersComponent implements OnInit {
  @Input() idGroup: number = 0

  results: USERS[] = []
  users: USERS[] = []
  user: USERS | undefined
  addExistingUserForm: FormGroup
  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  addNewUserForm: FormGroup
  isReady: boolean = true

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupsApi: GroupsApi,
    private groupInviteApi: GroupInvitesApi,
    private userService: UserService,
    public translate: TranslateService
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
      this.isReady = false
      this.groupInviteApi
        .addGroupInviteAsync({
          getGroupInviteRequest: {
            IdGroup: this.idGroup,
            IdUser: this.user?.ID_USER,
            IdAuthor: this.userService.loggedUser.ID_USER,
          },
        })
        .subscribe({
          next: () => {
            this.alert.alertOk(this.translate.instant('Successfully joined'))
            this.refreshDataService.refresh('groups-content')
            this.cancel()
          },
          error: () => {
            this.alert.alertNotOk()
            this.cancel()
            this.isReady = true
          },
        })
    }
  }

  onSubmitNew() {
    this.addExistingUserForm.markAllAsTouched()
    if (this.addNewUserForm.valid) {
      this.isReady = false
      if (this.addNewUserForm.value.email) {
        this.groupsApi
          .getGroupById({
            groupId: this.idGroup,
          })
          .subscribe({
            next: (response) => {
              this.usersApi
                .sendInvitationEmail({
                  getEmailSenderRequest: {
                    To: this.addNewUserForm.value.email,
                    Name: this.userService.loggedUser.FIRSTNAME,
                    Surname: this.userService.loggedUser.SURNAME,
                    GroupName: response.NAME,
                    IdGroup: this.idGroup,
                  },
                })
                .subscribe({
                  next: () => {
                    this.alert.alertOk(
                      this.translate.instant(
                        'An invitation email has been sent'
                      )
                    )
                    this.cancel()
                  },
                  error: () => {
                    this.cancel()
                    this.alert.alertNotOk()
                    this.isReady = true
                  },
                })
            },
            error: () => {
              this.cancel()
              this.alert.alertNotOk()
              this.isReady = true
            },
          })
      }
    }
  }
}
