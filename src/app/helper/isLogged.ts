import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { AuthService } from '../service/auth/auth.service'
import { Injectable } from '@angular/core'
import { Observable, catchError, map, of } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class IsLogged {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.login()) {
      return of(true)
    }
    return this.authService.refreshAccesToken(false).pipe(
      catchError(() => {
        return of(false)
      }),
      map((token) => {
        if (!token) {
          this.router.navigate(['/form/login'])
          return false
        }
        this.authService.setLoggedIn(token.access_token, token.refresh_token)
        window.location.reload()
        return true
      })
    )
  }
}
