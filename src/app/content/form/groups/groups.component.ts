import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GroupsApi, GroupsUsersApi, USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { UserValidator } from 'src/app/helper/customValidators'
import { UserService } from 'src/app/service/user/user.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
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
export class GroupsComponent implements OnInit {
  groupForm!: FormGroup
  users: USERS[] = []
  isReady: boolean = false
  results: USERS[] = []
  user: USERS | undefined

  constructor(
    private fb: FormBuilder,
    private groupsApi: GroupsApi,
    private usersApi: UsersApi,
    private groupsUsersApi: GroupsUsersApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert,
    public translate: TranslateService,
    public userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDetails()
  }

  onSubmit() {
    this.groupForm.markAllAsTouched()
    if (this.groupForm.valid) {
      this.isReady = true
      this.groupsApi
        .addGroup({
          getCreateGroupRequest: {
            GroupRequest: {
              Name: this.groupForm.value.name,
            },
            User: this.userService.loggedUser,
          },
        })
        .subscribe({
          next: (response) => {
            if (this.groupForm.value.organizer != null && this.user?.ID_USER) {
              this.groupsUsersApi
                .addUserToGroupAsync({
                  idUser: this.user.ID_USER,
                  idGroup: response.ID_GROUP,
                  accountType: 1,
                })
                .subscribe({
                  next: () => {
                    this.alert.presentToast(
                      this.translate.instant(
                        'Successully added user to group'
                      ) + response.NAME
                    )
                    this.cancel()
                    this.isReady = false
                    this.refreshDataService.refresh('groups-list')
                  },
                  error: (error) => {
                    this.isReady = false
                    this.alert.handleError(error)
                    this.cancel()
                  },
                })
            } else {
              this.isReady = false
              this.alert.presentToast(
                this.translate.instant('Successully added group') +
                  response.NAME
              )
              this.cancel()
              this.refreshDataService.refresh('groups-list')
            }
          },
          error: (error) => {
            this.alert.handleError(error)
            this.cancel()
            this.isReady = false
          },
        })
    }
  }

  getDetails() {
    this.usersApi
      .getAllUsers({
        page: 0,
        onPage: -1,
        sortColumn: 'SURNAME',
        sortMode: 'ASC',
        isAvatar: false,
      })
      .subscribe({
        next: (response) => {
          this.users = response
          this.groupForm = this.fb.group({
            name: ['', Validators.required],
            organizer: ['', UserValidator(this.users)],
          })
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  cancel() {
    this.router.navigate(['/groups'])
  }

  handleInput() {
    let query = ''
    query = this.groupForm.get('organizer')?.value.toLowerCase().trim()
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
    this.groupForm
      .get('organizer')
      ?.setValue(item.FIRSTNAME + ' ' + item.SURNAME)
    this.user = item
    this.results = []
  }
}
