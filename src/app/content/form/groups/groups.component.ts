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
import { IonicModule, ModalController } from '@ionic/angular'
import { GroupsApi, GroupsUsersApi, USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
})
export class GroupsComponent implements OnInit {
  groupForm: FormGroup
  users: USERS[] = []
  isReady: boolean = false
  results: USERS[] = []
  user: USERS | undefined

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private groupsApi: GroupsApi,
    private usersApi: UsersApi,
    private groupsUsersApi: GroupsUsersApi,
    private refreshDataService: RefreshDataService,
    private alert: Alert
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      organizer: [''],
    })
  }

  ngOnInit() {
    this.getDetails()
  }

  onSubmit() {
    this.groupForm.markAllAsTouched()
    if (this.groupForm.valid) {
      this.groupsApi
        .addGroup({
          getGroupRequest: {
            Name: this.groupForm.value.name,
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
                    this.alert.alertOk()
                    this.cancel()
                    this.groupForm.reset()
                    this.refreshDataService.refresh('groups-list')
                  },
                  error: () => {
                    this.alert.alertNotOk()
                    this.cancel()
                  },
                })
            }
            this.refreshDataService.refresh('groups-list')
          },
          error: (error) => {
            let errorMessage = ''
            if (
              String(error.error.message).includes(
                'Group with this name already exists'
              )
            ) {
              errorMessage = 'Grupa z taką nazwą już istnieje.'
            }
            this.alert.alertNotOk(errorMessage)
            this.cancel()
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
      })
      .subscribe({
        next: (response) => {
          this.users = response
          this.isReady = true
        },
        error: () => {
          this.alert.alertNotOk()
        },
      })
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
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
