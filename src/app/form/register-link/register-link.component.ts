import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { RegisterComponent } from '../register/register.component'
import {
  GROUPINVITE,
  GetGroupInviteResponse,
  GroupInvitesApi,
  GroupsUsersApi,
  TokenApi,
} from 'libs/api-client'
import { ActivatedRoute } from '@angular/router'
import { Alert } from 'src/app/helper/alert'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { AppConfig } from 'src/app/service/app-config'
import { JwtHelperService } from '@auth0/angular-jwt'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'

@Component({
  selector: 'app-register-link',
  templateUrl: './register-link.component.html',
  styleUrls: ['./register-link.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RegisterComponent,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class RegisterLinkComponent implements OnInit {
  idGroupInvite: number | undefined
  groupInvite!: GROUPINVITE
  isReady: boolean = true
  isExpired: boolean = false

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private route: ActivatedRoute,
    private alert: Alert,
    public translate: TranslateService,
    private tokenApi: TokenApi,
    private jwt: JwtHelperService,
    private groupInvitesApi: GroupInvitesApi
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroupInvite']) {
        const decodedBytes = new Uint8Array(
          atob(params?.['idGroupInvite'])
            .split('')
            .map((char) => char.charCodeAt(0))
        )
        this.idGroupInvite = new DataView(decodedBytes.buffer).getInt32(0, true)
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.isReady = false
    this.groupInvitesApi
      .getGroupInviteById({
        groupInviteId: this.idGroupInvite ?? 0,
      })
      .subscribe({
        next: (response) => {
          this.groupInvite = response
          let dateAdd = new Date(String(this.groupInvite.DATE_ADD))
          let dateExpire = new Date(
            dateAdd.getTime() + 24 * 60 * 60 * 1000
          ).toISOString()
          let currentDate = new Date().toISOString()
          if (dateExpire < currentDate) {
            this.isExpired = true
          } else {
            this.isExpired = false
          }
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
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
          let decodedToken = this.jwt.decodeToken(response.access_token ?? '')
          if (decodedToken.idUser > 0) {
            localStorage.setItem('access_token', response.access_token ?? '')
            localStorage.setItem('refresh_token', response.refresh_token ?? '')
          }
          this.groupsUsersApi
            .addUserToGroup({
              idGroup: this.groupInvite.IDGROUP,
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
