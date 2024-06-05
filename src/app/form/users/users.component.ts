import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { IonicModule, ModalController } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GroupInvitesApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import { AddUserFromContactComponent } from 'src/app/modal/add-user-from-contact/add-user-from-contact.component'
import { Capacitor } from '@capacitor/core'

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
    SpinnerComponent,
  ],
})
export class UsersComponent implements OnInit {
  @Input() idGroup: number = 0
  addNewUserForm: FormGroup
  isReadyNewUser: boolean = true
  isReadyExistingUser: boolean = false

  intNumber: number = 0
  modalOpened: boolean = false
  isMobile: boolean = false

  label = `${this.translate.instant('Email')} / ${this.translate.instant(
    'Phone number'
  )}`

  constructor(
    private fb: FormBuilder,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupInviteApi: GroupInvitesApi,
    private userService: UserService,
    public translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.addNewUserForm = this.fb.group({
      emailOrPhoneNumber: [
        '',
        [
          Validators.pattern(
            '^(?:\\d{9}|\\w+@\\w+\\.\\w{2,3}|\\w+.\\w+@\\w+\\.\\w{2,3}\\.\\w{2,3}|\\w+.\\w+@\\w+\\.\\w{2,3})'
          ),
        ],
      ],
    })
  }

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      this.isMobile = true
    }
  }

  onSubmitNew() {
    this.addNewUserForm.markAllAsTouched()
    if (this.addNewUserForm.valid) {
      if (this.addNewUserForm.value.emailOrPhoneNumber) {
        this.isReadyNewUser = false
        this.groupInviteApi
          .addGroupInvite({
            getGroupInviteWithEmailOrPhoneRequest: {
              GroupInvite: {
                IdGroup: this.idGroup,
                IdAuthor: this.userService.loggedUser.ID_USER,
              },
              EmailOrPhoneNumber: this.addNewUserForm.value.emailOrPhoneNumber
                ?.toLowerCase()
                .trim(),
            },
          })
          .subscribe({
            next: () => {
              this.isReadyNewUser = true
              this.alert.presentToast(
                this.translate.instant('Invited successfully')
              )
              this.addNewUserForm.reset()
              this.refreshDataService.refresh('invite')
            },
            error: (error) => {
              this.alert.handleError(error)
              this.isReadyNewUser = true
            },
          })
      }
    }
  }

  async openModalAddUserFromContact() {
    const modal = await this.modalCtrl.create({
      component: AddUserFromContactComponent,
      componentProps: {
        idGroup: this.idGroup,
        isOpened: true,
      },
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?modalOpened=true')
    this.modalOpened = true
    modal.present()
    await modal.onWillDismiss()
  }
}
