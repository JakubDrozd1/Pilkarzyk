import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, of, throwError } from 'rxjs'
import { JwtHelperService } from '@auth0/angular-jwt'
import { TokenApi } from 'libs/api-client'
import { AppConfig } from '../app-config'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private jwt: JwtHelperService, private tokenApi: TokenApi) {}

  setLoggedIn(token: string, refreshToken: string): boolean {
    try {
      let decodedToken = this.jwt.decodeToken(token)
      if (decodedToken.idUser > 0) {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  login() {
    if (this.jwt.isTokenExpired()) {
      return false
    }
    return true
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
    return false
  }

  refreshAccesToken(errorThrow: boolean = true): Observable<any> {
    const refreshToken: string | null = localStorage.getItem('refresh_token')
    if (refreshToken) {
      return this.tokenApi.generateToken({
        grantType: 'refresh_token',
        clientId: AppConfig.settings.clientId,
        clientSecret: AppConfig.settings.clientSecretPublic,
        refreshToken: refreshToken,
      })
    }
    if (errorThrow) {
      let error = new Error('refresh_token_missing')
      return throwError(() => error)
    }
    return of(false)
  }

  getAccessToken() {
    return localStorage.getItem('access_token')
  }
}
