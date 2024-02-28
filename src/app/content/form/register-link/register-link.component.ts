import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { RegisterComponent } from '../register/register.component'
import { GroupsUsersApi, TokenApi } from 'libs/api-client'
import { ActivatedRoute } from '@angular/router'
import { Alert } from 'src/app/helper/alert'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { AppConfig } from 'src/app/service/app-config'
import { JwtHelperService } from '@auth0/angular-jwt'

@Component({
  selector: 'app-register-link',
  templateUrl: './register-link.component.html',
  styleUrls: ['./register-link.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RegisterComponent, TranslateModule],
})
export class RegisterLinkComponent implements OnInit {
  idGroup: number | undefined

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private route: ActivatedRoute,
    private alert: Alert,
    public translate: TranslateService,
    private tokenApi: TokenApi,
    private jwt: JwtHelperService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup']) {
        const decodedBytes = new Uint8Array(
          atob(params?.['idGroup'])
            .split('')
            .map((char) => char.charCodeAt(0))
        )
        this.idGroup = new DataView(decodedBytes.buffer).getInt32(0, true)
      }
    })
  }

  onUserRegistered(user: any) {
    this.tokenApi
      .generateToken({
        grantType: 'password',
        clientId: AppConfig.settings.clientId,
        clientSecret: AppConfig.settings.clientSecretPublic,
        username: user.Login,
        password: user.Password,
      })
      .subscribe({
        next: (response) => {
          console.log(response)
          let decodedToken = this.jwt.decodeToken(response.access_token ?? '')
          if (decodedToken.idUser > 0) {
            localStorage.setItem('access_token', response.access_token ?? '')
            localStorage.setItem('refresh_token', response.refresh_token ?? '')
          }
          this.groupsUsersApi
            .addUserToGroup({
              idGroup: this.idGroup,
              idUser: decodedToken.idUser,
              accountType: 0,
            })
            .subscribe({
              next: () => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
              },
              error: (error) => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                this.alert.handleError(error)
              },
            })
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }
}
