import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AlertController, IonicModule } from '@ionic/angular';
import { TokenApi, UsersApi } from 'libs/api-client';
import { forkJoin } from 'rxjs';
import { AppConfig } from 'src/app/service/app-config';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  providers: [JwtHelperService]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private tokenApi: TokenApi
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
      forkJoin({
        users: this.usersApi.getUserByLoginAndPassword({
          login: this.loginForm.value.login,
          password: this.loginForm.value.password,
        }),
        token: this.tokenApi.generateToken({
          grantType: 'password',
          clientId: AppConfig.settings.clientId,
          clientSecret: AppConfig.settings.clientSecretPublic,
          username: this.loginForm.value.login,
          password: this.loginForm.value.password
        })
      }).subscribe({
        next: async (responses) => {
          let success = false
          if (responses.token.access_token != null && responses.token.refresh_token != null) {
            success = this.authService.setLoggedIn(responses.token.access_token, responses.token.refresh_token)
          }
          if (success) {
            this.authService.login()
            this.navigate()
          }
          else {
            const alert = await this.alertController.create({
              header: 'Błąd',
              buttons: ['Ok'],
            })
          }
        },
        error: async (error) => {
          let errorMessage = ''
          if (String(error.error).includes('User is null')) {
            errorMessage = 'Dany użytkownik nie istnieje.'
          } else if (String(error.error).includes('Password is not correct')) {
            errorMessage = 'Podane hasło jest niepoprawne. '
          }
          const alert = await this.alertController.create({
            header: 'Błąd',
            message: errorMessage,
            buttons: ['Ok'],
          })
          await alert.present()
        }
      })
    }
  }

  private navigate() {
    this.router.navigate(["/logged/home"])
  }
}
