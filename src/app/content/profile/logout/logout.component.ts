import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { AuthService } from 'src/app/service/auth/auth.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LogoutComponent implements OnInit {
  public alertButtons = [
    {
      text: 'Anuluj',
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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}

  logout() {
    this.authService.logout()
    this.router.navigate([''])
    window.location.reload()
  }
}
