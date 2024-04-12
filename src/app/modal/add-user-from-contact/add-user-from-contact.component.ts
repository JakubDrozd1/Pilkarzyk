import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ContactPayload, Contacts } from '@capacitor-community/contacts'
import { Capacitor } from '@capacitor/core'
import {
  CheckboxChangeEventDetail,
  IonicModule,
  ModalController,
} from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupInviteResponse,
  GroupInvitesApi,
  USERS,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import { IonCheckboxCustomEvent } from '@ionic/core'
import { forkJoin } from 'rxjs'

@Component({
  selector: 'app-add-user-from-contact',
  templateUrl: './add-user-from-contact.component.html',
  styleUrls: ['./add-user-from-contact.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class AddUserFromContactComponent implements OnInit {
  @Input() idGroup: number = 0
  @Input() isOpened: boolean = false

  contacts: ContactPayload[] = []
  intNumber: number = 0
  isContact: boolean = true
  users: USERS[] = []
  isNumber: boolean = false
  numberArray: number[] = []
  groupsInvite: GetGroupInviteResponse[] = []

  constructor(
    private groupInviteApi: GroupInvitesApi,
    private userService: UserService,
    private translate: TranslateService,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private router: Router,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private usersApi: UsersApi
  ) {}

  ngOnInit() {
    window.addEventListener('popstate', async () => {
      if (this.isOpened) {
        this.cancel()
      }
    })
    this.getDetails()
  }

  getContactsData = async () => {
    this.isContact = false
    const result = await Contacts.getContacts({
      projection: {
        name: true,
        phones: true,
      },
    })
    this.contacts = result.contacts
    this.contacts.forEach((contact) => {
      if (contact.phones) {
        if (contact.phones[0].number) {
          contact.phones[0].number = this.formatPhoneNumber(
            contact.phones[0].number
          )
        }
      }
    })
    this.isContact = true
  }

  formatPhoneNumber(phoneNumber: string) {
    let formattedNumber = phoneNumber
    if (formattedNumber.startsWith('+48')) {
      formattedNumber = formattedNumber.slice(3)
    }
    formattedNumber = formattedNumber.replace(/\D/g, '')
    const foundInUsers = this.users.some(
      (user) => user.PHONE_NUMBER === Number(formattedNumber)
    )
    const foundInUsersInvites = this.groupsInvite.some(
      (groupInvite) => groupInvite.PhoneNumber === Number(formattedNumber)
    )
    formattedNumber = formattedNumber.replace(
      /(\d{3})(\d{3})(\d{3})/,
      '$1-$2-$3'
    )
    if (foundInUsers && !foundInUsersInvites) {
      this.isNumber = true
    }

    if (formattedNumber.length === 11 && foundInUsers && !foundInUsersInvites) {
      return formattedNumber
    } else {
      return ''
    }
  }

  getDetails() {
    this.isContact = false
    forkJoin({
      users: this.usersApi.getAllUsersWithoutGroup({
        page: 0,
        onPage: -1,
        idGroup: this.idGroup,
      }),
      invites: this.groupInviteApi.getGroupInviteByIdUser({
        page: 0,
        onPage: -1,
        idGroup: this.idGroup,
      }),
    }).subscribe({
      next: (responses) => {
        this.users = responses.users
        this.groupsInvite = responses.invites
        if (Capacitor.isNativePlatform()) {
          this.getContactsData()
        }
        this.isContact = true
      },
      error: (error) => {
        this.alert.handleError(error)
        this.isContact = true
      },
    })
  }

  cancel() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modalOpened: null },
      replaceUrl: true,
    })
    this.isOpened = false
    this.modalCtrl.dismiss(null, 'cancel')
  }

  sendInvites() {
    if (this.numberArray.length > 0) {
      this.isContact = false
      this.groupInviteApi
        .addMultipleGroupInvite({
          getMultipleGroupInviteRequest: {
            IdGroup: this.idGroup,
            IdAuthor: this.userService.loggedUser.ID_USER,
            PhoneNumbers: this.numberArray,
          },
        })
        .subscribe({
          next: () => {
            this.isContact = true
            this.isNumber = false
            this.numberArray = []
            this.alert.presentToast(
              this.translate.instant('Invited successfully')
            )
            this.getDetails()
            this.refreshDataService.refresh('invite')
          },
          error: (error) => {
            this.isContact = true
            this.isNumber = false
            this.numberArray = []
            this.alert.handleError(error)
          },
        })
    }
  }

  changeContact(
    $event: IonCheckboxCustomEvent<CheckboxChangeEventDetail<any>>
  ) {
    if ($event.detail.checked) {
      this.numberArray.push(
        parseInt($event.detail.value.replace(/\D/g, ''), 10)
      )
    } else {
      const indexToRemove = this.numberArray.indexOf(
        parseInt($event.detail.value.replace(/\D/g, ''), 10)
      )
      if (indexToRemove !== -1) {
        this.numberArray.splice(indexToRemove, 1)
      }
    }
  }
}
