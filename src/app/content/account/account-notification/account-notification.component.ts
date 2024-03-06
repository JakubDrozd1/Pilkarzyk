import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

@Component({
  selector: 'app-account-notification',
  templateUrl: './account-notification.component.html',
  styleUrls: ['./account-notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SpinnerComponent,
    TranslateModule,
    RouterLink,
  ],
})
export class AccountNotificationComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  cancel() {
    this.router.navigate(['/account'])
  }
}
