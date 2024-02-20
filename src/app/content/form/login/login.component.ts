import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NotificationTokensApi, TokenApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { AppConfig } from 'src/app/service/app-config'
import { AuthService } from 'src/app/service/auth/auth.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  providers: [JwtHelperService],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  errorMessage: string = ''
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private tokenApi: TokenApi,
    private alert: Alert,
    public translate: TranslateService,
    private notificationTokensApi: NotificationTokensApi,
    private jwt: JwtHelperService
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  ngOnInit() {
    if (this.authService.login()) {
      this.navigate()
    }
  }

  onSubmit() {
    this.loginForm.markAllAsTouched()
    if (this.loginForm.valid) {
      this.isReady = false
      this.tokenApi
        .generateToken({
          grantType: 'password',
          clientId: AppConfig.settings.clientId,
          clientSecret: AppConfig.settings.clientSecretPublic,
          username: this.loginForm.value.login,
          password: this.loginForm.value.password,
        })
        .subscribe({
          next: async (response) => {
            let success = false
            if (
              response.access_token != null &&
              response.refresh_token != null
            ) {
              success = this.authService.setLoggedIn(
                response.access_token,
                response.refresh_token
              )
            }
            if (success) {
              this.loginForm.reset()
              this.authService.login()
              this.navigate()
              if (response.access_token && Capacitor.isNativePlatform()) {
                this.addListeners(response.access_token)
                await PushNotifications.register()
              }
            } else {
              this.alert.alertNotOk()
              this.isReady = true
            }
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }

  private navigate() {
    this.router.navigate(['/home'])
  }

  addListeners = async (accessToken: string) => {
    await PushNotifications.addListener('registration', (token) => {
      let decodedToken = this.jwt.decodeToken(accessToken)
      this.notificationTokensApi
        .addNotificationToken({
          getNotificationTokenRequest: {
            Token: token.value,
            IdUser: decodedToken.idUser,
          },
        })
        .subscribe({
          next: () => {
            console.log('OK')
          },
          error: (error) => {
            console.error(error.error)
          },
        })
    })
    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error)
    })
  }
}
