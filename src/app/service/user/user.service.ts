import { Injectable } from '@angular/core'
import { JwtHelperService } from '@auth0/angular-jwt'
import { USERS, UsersApi } from 'libs/api-client'
import { AuthService } from '../auth/auth.service'
import { firstValueFrom } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedUser!: USERS
  constructor(
    private usersApi: UsersApi,
    private jwt: JwtHelperService,
    private authService: AuthService
  ) {}

  async getDetails(): Promise<boolean> {
    try {
      if (
        !this.jwt.isTokenExpired() &&
        localStorage.getItem('refresh_token') !== null &&
        localStorage.getItem('access_token') !== null
      ) {
        const token = String(localStorage.getItem('access_token'))
        const decodedToken: any = this.jwt.decodeToken(token)

        if (decodedToken.idUser > 0) {
          const response = await firstValueFrom(
            this.usersApi.getUserById({ userId: decodedToken.idUser })
          )
          this.loggedUser = response
          if (this.loggedUser == null) {
            this.authService.logout()
            return false
          } else {
            return true
          }
        } else {
          this.authService.logout()
          return false
        }
      }
      return false
    } catch (error) {
      console.error('Error while fetching user details:', error)
      this.authService.logout()
      return false
    }
  }
}
