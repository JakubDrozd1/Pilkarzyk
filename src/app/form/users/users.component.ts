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
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core'
import { AddUserFromContactComponent } from 'src/app/modal/add-user-from-contact/add-user-from-contact.component'

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
  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  intNumber: number = 0
  modalOpened: boolean = false

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
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.minLength(11)]],
    })
  }

  ngOnInit() {}

  onSubmitNew() {
    this.addNewUserForm.markAllAsTouched()
    if (this.addNewUserForm.valid) {
      if (
        this.addNewUserForm.value.phoneNumber ||
        this.addNewUserForm.value.email
      ) {
        this.isReadyNewUser = false
        if (this.addNewUserForm.value.phoneNumber) {
          let str: string = this.addNewUserForm.value.phoneNumber
          this.intNumber = parseInt(str.replace(/-/g, ''), 10)
        }
        this.groupInviteApi
          .addGroupInvite({
            getGroupInviteRequest: {
              IdGroup: this.idGroup,
              IdAuthor: this.userService.loggedUser.ID_USER,
              Email: this.addNewUserForm.value.email?.toLowerCase().trim(),
              PhoneNumber: this.intNumber,
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
