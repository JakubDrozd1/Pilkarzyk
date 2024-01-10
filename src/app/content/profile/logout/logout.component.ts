import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { AuthService } from 'src/app/service/auth/auth.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class LogoutComponent implements OnInit {
  public alertButtons = [
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.logout()
      },
    },
  ]

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit() {}

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
    window.location.reload()
  }
}
