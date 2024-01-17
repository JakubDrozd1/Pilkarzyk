import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from "../../../helper/spinner/spinner.component";

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
        SpinnerComponent
    ]
})
export class ProfileComponent implements OnInit {
  @Input() inputEdit: string = ''
  @Input() data: string = ''

  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  profileForm!: FormGroup
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private alert: Alert,
    private usersApi: UsersApi,
    private refreshDataService: RefreshDataService,
    private userService: UserService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.inicializeForm()
  }

  inicializeForm() {
    switch (this.inputEdit) {
      case 'mail':
        {
          this.profileForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
          })
          this.profileForm.get('email')?.setValue(this.data)
        }
        break
      case 'phone':
        {
          this.profileForm = this.fb.group({
            phoneNumber: ['', [Validators.required, Validators.minLength(11)]],
          })
          this.profileForm
            .get('phoneNumber')
            ?.setValue(
              this.data.slice(0, 3) +
                '-' +
                this.data.slice(3, 6) +
                '-' +
                this.data.slice(6)
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
                Validators.minLength(3),
                Validators.maxLength(25),
              ],
            ],
          })
          this.profileForm.get('login')?.setValue(this.data)
        }
        break
      case 'name':
        {
          this.profileForm = this.fb.group({
            firstname: [
              '',
              [
                Validators.required,
                Validators.pattern('^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+$'),
                Validators.minLength(3),
                Validators.maxLength(25),
              ],
            ],
            surname: [
              '',
              [
                Validators.required,
                Validators.pattern('^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+$'),
                Validators.minLength(3),
                Validators.maxLength(25),
              ],
            ],
          })
          const [firstName, lastName] = this.data.split(' ')
          this.profileForm.get('firstname')?.setValue(firstName)
          this.profileForm.get('surname')?.setValue(lastName)
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

      let updateColumnUserRequest: any = {
        userId: this.userService.loggedUser.ID_USER,
      }
      switch (this.inputEdit) {
        case 'mail':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['EMAIL'],
              EMAIL: this.profileForm.value.email,
            }
          }
          break
        case 'phone':
          {
            let str: string = this.profileForm.value.phoneNumber
            let intNumber: number = parseInt(str.replace(/-/g, ''), 10)
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['PHONE_NUMBER'],
              PHONE_NUMBER: intNumber,
            }
          }
          break
        case 'login':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['LOGIN'],
              LOGIN: this.profileForm.value.login,
            }
          }
          break
        case 'name':
          {
            updateColumnUserRequest.getUpdateUserRequest = {
              Column: ['FIRSTNAME', 'SURNAME'],
              FIRSTNAME: this.profileForm.value.firstname,
              SURNAME: this.profileForm.value.surname,
            }
          }
          break
      }

      this.usersApi.updateColumnUser(updateColumnUserRequest).subscribe({
        next: () => {
          this.refreshDataService.refresh('profile-details')
          this.cancel()
          this.alert.alertOk(this.translate.instant('Updated successfully'))
        },
        error: () => {
          this.alert.alertNotOk()
          this.isReady = true
        },
      })
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }
}
