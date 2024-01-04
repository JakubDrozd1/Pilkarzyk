import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthService } from '../service/auth/auth.service'

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private oauthService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.oauthService.getAccessToken()
    if (token) {
      const headers = req.headers.set('Authorization', 'Bearer ' + token)
      req = req.clone({ headers })
    }
    return next.handle(req)
  }
}
