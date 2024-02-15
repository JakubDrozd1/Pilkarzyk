import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ComparePasswordValidator } from 'src/app/helper/customValidators'
import { Router } from '@angular/router'

@Component({
  selector: 'app-profile-password',
  templateUrl: './profile-password.component.html',
  styleUrls: ['./profile-password.component.scss'],
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
export class ProfilePasswordComponent implements OnInit {
  profilePasswordForm: FormGroup
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alert: Alert,
    private userService: UserService,
    public translate: TranslateService,
    private router: Router
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

  ngOnInit() {}

  cancel() {
    this.router.navigate(['/profile'])
  }

  onSubmit() {
    this.profilePasswordForm.markAllAsTouched()
    if (this.profilePasswordForm.valid) {
      this.isReady = false
      this.usersApi
        .updateColumnUser({
          userId: Number(this.userService.loggedUser.ID_USER),
          getUpdateUserRequest: {
            Column: ['USER_PASSWORD'],
            UserPassword: this.profilePasswordForm.value.password,
          },
        })
        .subscribe({
          next: () => {
            this.alert.alertOk(
              this.translate.instant('Password changed successfully')
            )
            this.cancel()
          },
          error: (error) => {
            this.alert.handleError(error)
            this.cancel()
            this.isReady = true
          },
        })
    }
  }
}
