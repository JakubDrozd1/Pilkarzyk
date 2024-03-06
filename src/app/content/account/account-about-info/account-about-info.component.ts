import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-account-about-info',
  templateUrl: './account-about-info.component.html',
  styleUrls: ['./account-about-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, RouterLink],
})
export class AccountAboutInfoComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  cancel() {
    this.router.navigate(['/account/about'])
  }
}
