import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http'
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs'
import { AuthService } from '../service/auth/auth.service'
import { environment } from 'src/environments/environment'

export interface Token {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private refreshTokenProgress = false
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  )

  constructor(private oauthService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: string | null = localStorage.getItem('access_token')
    const lang: string | null = localStorage.getItem('lang')

    if (
      !request.headers.has('Not-Include-Token') &&
      token &&
      token !== 'undefined'
    ) {
      request = this.addAuthenticationToken(request)
    }

    request = request.clone({
      headers: request.headers.set('Accept', 'application/json'),
    })

    return next.handle(request).pipe(
      catchError((err) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          err.url?.startsWith(environment.apiEndpoint) &&
          token
        ) {
          return this.handle401Error(request, next)
        } else if (err instanceof HttpErrorResponse && err.status === 423) {
          return throwError(() => err)
        } else {
          return throwError(() => err)
        }
      })
    )
  }

  private addAuthenticationToken(request: HttpRequest<any>) {
    return request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + this.oauthService.getAccessToken(),
      },
    })
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.refreshTokenProgress) {
      this.refreshTokenProgress = true
      this.refreshTokenSubject.next(null)

      return this.oauthService.refreshAccesToken().pipe(
        switchMap((token: Token) => {
          this.refreshTokenProgress = false
          this.refreshTokenSubject.next(token.access_token)
          this.oauthService.setLoggedIn(token.access_token, token.refresh_token)

          return next.handle(this.addToken(request, token.access_token))
        }),
        catchError((err: any) => {
          this.refreshTokenProgress = false
          this.oauthService.logout()

          return throwError(() => err)
        })
      )
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => next.handle(this.addToken(request, jwt)))
      )
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}
