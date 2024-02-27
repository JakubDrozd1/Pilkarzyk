import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetResetPasswordResponse,
  ResetPasswordsApi,
  UsersApi,
} from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { ComparePasswordValidator } from 'src/app/helper/customValidators'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
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
export class PasswordResetComponent implements OnInit {
  profilePasswordForm: FormGroup
  isReady: boolean = true
  idResetPassword: number = 0
  resetPassword!: GetResetPasswordResponse
  isExpired: boolean = false

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alert: Alert,
    public translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private resetPasswordApi: ResetPasswordsApi
  ) {
    this.profilePasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, ComparePasswordValidator('password')],
      ],
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idResetPassword']) {
        const decodedBytes = new Uint8Array(
          atob(params?.['idResetPassword'])
            .split('')
            .map((char) => char.charCodeAt(0))
        )
        this.idResetPassword = new DataView(decodedBytes.buffer).getInt32(
          0,
          true
        )
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.resetPasswordApi
      .getResetPasswordById({
        resetPasswordId: this.idResetPassword,
      })
      .subscribe({
        next: (response) => {
          this.resetPassword = response
          this.isReady = true
          let dateAdd = new Date(String(this.resetPassword.DateAdd))
          let dateExpire = new Date(
            dateAdd.getTime() + 10 * 60000
          ).toISOString()
          let currentDate = new Date().toISOString()
          if (dateExpire < currentDate) {
            this.isExpired = true
          } else {
            this.isExpired = false
          }
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
          this.isExpired = true
        },
      })
  }

  cancel() {
    this.router.navigate(['/form/login'])
  }

  onSubmit() {
    this.profilePasswordForm.markAllAsTouched()
    if (this.profilePasswordForm.valid) {
      this.isReady = false
      this.usersApi
        .updateColumnUser({
          userId: this.resetPassword.IdUser ?? 0,
          getUpdateUserRequest: {
            Column: ['USER_PASSWORD'],
            UserPassword: this.profilePasswordForm.value.password,
          },
        })
        .subscribe({
          next: () => {
            this.alert.presentToast(
              this.translate.instant('Password changed successfully')
            )
            this.isReady = true
            this.cancel()
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }
}
