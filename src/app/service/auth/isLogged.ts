import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router"
import { AuthService } from "./auth.service"
import { Injectable } from "@angular/core"
import { Observable, map, of, take } from "rxjs"

@Injectable({
    providedIn: 'root',
})
export class IsLogged {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.authService.isLoggedIn.pipe(
            take(1),
            map((isLoggedIn) => {
                if (isLoggedIn) {
                    return true;
                } else {
                    this.router.navigate(['/login']);
                    return false;
                }
            })
        );
    }
}