import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { compareValidator } from 'src/app/helper/validateConfirmPasswd'
import { UserService } from 'src/app/service/user/user.service'

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
  ],
})
export class ProfilePasswordComponent implements OnInit {
  profilePasswordForm: FormGroup
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private usersApi: UsersApi,
    private alert: Alert,
    private userService: UserService
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
        [Validators.required, compareValidator('password')],
      ],
    })
  }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
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
            this.alert.alertOk('Pomyślnie zmieniono hasło')
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
}
