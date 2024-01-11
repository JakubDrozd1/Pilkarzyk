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
import { TokenApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { AppConfig } from 'src/app/service/app-config'
import { AuthService } from 'src/app/service/auth/auth.service'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'

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
    public translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  ngOnInit() {
    if (this.authService.isLoggedIn) {
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
          next: (response) => {
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
            } else {
              this.alert.alertNotOk()
              this.isReady = true
            }
          },
          error: (error) => {
            if (String(error.error).includes('User is null')) {
              this.errorMessage = this.translate.instant(
                'The given user does not exist.'
              )
              this.alert.alertNotOk(this.errorMessage)
            } else if (
              String(error.error).includes('Password is not correct')
            ) {
              this.errorMessage = this.translate.instant(
                'Password is not correct.'
              )
              this.alert.alertNotOk(this.errorMessage)
            } else {
              this.alert.alertNotOk()
            }
            this.isReady = true
          },
        })
    }
  }

  private navigate() {
    this.router.navigate(['/logged/home'])
  }
}
