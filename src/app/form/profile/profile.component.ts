import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { USERS, UpdateColumnUserRequestParams, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import { ActivatedRoute, Router } from '@angular/router'
import { customValidator } from 'src/app/helper/customValidators'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MaskitoModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class ProfileComponent implements OnInit {
  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  profileForm!: FormGroup
  isReady: boolean = true
  inputEdit: string = ''
  user: USERS | undefined
  message: string = ''

  constructor(
    private fb: FormBuilder,
    private alert: Alert,
    private usersApi: UsersApi,
    private refreshDataService: RefreshDataService,
    private userService: UserService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.inputEdit = params?.['mode']
      this.getDetails()
    })
  }

  getDetails() {
    this.isReady = false
    this.usersApi
      .getUserById({
        userId: Number(this.userService.loggedUser.ID_USER),
      })
      .subscribe({
        next: (response) => {
          this.user = response
          this.inicializeForm()
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  inicializeForm() {
    switch (this.inputEdit) {
      case 'mail':
        {
          this.profileForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
          })
          this.profileForm.get('email')?.setValue(this.user?.EMAIL)
        }
        break
      case 'phone':
        {
          this.profileForm = this.fb.group({
            phoneNumber: ['', [Validators.required, Validators.minLength(11)]],
          })
          let phone = String(this.user?.PHONE_NUMBER)
          this.profileForm
            .get('phoneNumber')
            ?.setValue(
              phone.slice(0, 3) + '-' + phone.slice(3, 6) + '-' + phone.slice(6)
            )
        }
        break
      case 'login':
        {
          this.profileForm = this.fb.group({
            login: [
              '',
              [
                Validators.required,
                customValidator(),
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s0-9_-]*$/),
              ],
            ],
          })
          this.profileForm.get('login')?.setValue(this.user?.LOGIN)
        }
        break
      case 'name':
        {
          this.profileForm = this.fb.group({
            firstname: [
              '',
              [
                Validators.required,
                Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]*$/),
                customValidator(),
                Validators.maxLength(50),
              ],
            ],
            surname: [
              '',
              [
                Validators.required,
                Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]*$/),
                customValidator(),
                Validators.maxLength(50),
              ],
            ],
          })
          this.profileForm.get('firstname')?.setValue(this.user?.FIRSTNAME)
          this.profileForm.get('surname')?.setValue(this.user?.SURNAME)
        }
        break
      default: {
        this.profileForm = this.fb.group({})
        this.alert.alertNotOk()
      }
    }
  }

  onSubmit() {
    this.profileForm.markAllAsTouched()
    if (this.profileForm.valid) {
      this.isReady = false

      let updateColumnUserRequest: UpdateColumnUserRequestParams = {
        userId: this.userService.loggedUser.ID_USER ?? 0,
      }
      switch (this.inputEdit) {
        case 'mail':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['EMAIL'],
              Email: this.profileForm.value.email.trim().toLowerCase(),
            }
            this.message = this.translate.instant('Mail successfully updated')
          }
          break
        case 'phone':
          {
            let str: string = this.profileForm.value.phoneNumber
            let intNumber: number = parseInt(str.replace(/-/g, ''), 10)
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['PHONE_NUMBER'],
              PhoneNumber: intNumber,
            }
            this.message = this.translate.instant('Phone successfully updated')
          }
          break
        case 'login':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['LOGIN'],
              Login: this.profileForm.value.login.trim().toLowerCase(),
            }
            this.message = this.translate.instant('Login successfully updated')
          }
          break
        case 'name':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['FIRSTNAME', 'SURNAME'],
              Firstname: this.profileForm.value.firstname.trim(),
              Surname: this.profileForm.value.surname.trim(),
            }
            this.message = this.translate.instant(
              'Full name successfully updated'
            )
          }
          break
      }

      this.usersApi.updateColumnUser(updateColumnUserRequest).subscribe({
        next: () => {
          this.userService.getDetails()
          this.refreshDataService.refresh('profile-edit')
          this.cancel()
          this.alert.presentToast(this.message)
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
    }
  }

  cancel() {
    this.router.navigate(['/account/edit'])
  }
}
