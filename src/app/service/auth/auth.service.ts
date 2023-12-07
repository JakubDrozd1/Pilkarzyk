import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt'
import { TokenApi } from 'libs/api-client';
import { AppConfig } from '../app-config';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false)

  constructor(
    private jwt: JwtHelperService,
    private tokenApi: TokenApi,
  ) { }

  get isLoggedIn() {
    if (this.jwt.isTokenExpired() || localStorage.getItem('refresh_token') == null || localStorage.getItem('access_token') == null) {
      this.loggedIn.next(false)
    }
    else {
      this.loggedIn.next(true)
    }
    return this.loggedIn.getValue()
  }

  setLoggedIn(token: string, refreshToken: string): boolean {
    try {
      let decodedToken = this.jwt.decodeToken(token)
      if (decodedToken.idUser > 0) {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_id', decodedToken.idUser)
        return true
      }

      return false
    }
    catch (error) {
      return false
    }
  }

  login() {
    if (this.jwt.isTokenExpired()) {
      this.loggedIn.next(false)
    }
    this.loggedIn.next(true)
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    this.loggedIn.next(false)
  }

  refreshAccesToken(errorThrow: boolean = true): Observable<any> {
    const refreshToken: string | null = localStorage.getItem('refresh_token')
    if (refreshToken) {
      return this.tokenApi.generateToken({
        grantType: 'refresh_token',
        clientId: AppConfig.settings.clientId,
        clientSecret: AppConfig.settings.clientSecretPublic,
        refreshToken: refreshToken
      })
    }
    if (errorThrow) {
      let error = new Error('refresh_token_missing')

      return throwError(() => error)
    }

    return of(false)
  }
}
