import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  ngOnInit() {}

  cancel() {
    window.history.back()
  }
}
