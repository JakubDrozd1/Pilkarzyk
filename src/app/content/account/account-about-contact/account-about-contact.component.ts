import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { GaduGaduComponent } from "../../../helper/gadu-gadu/gadu-gadu.component";

@Component({
    selector: 'app-account-about-contact',
    templateUrl: './account-about-contact.component.html',
    styleUrls: ['./account-about-contact.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, TranslateModule, RouterLink, GaduGaduComponent]
})
export class AccountAboutContactComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  cancel() {
    this.router.navigate(['/account/about'])
  }
}
