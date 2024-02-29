import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { GaduGaduComponent } from '../gadu-gadu/gadu-gadu.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-delete-account-info',
  templateUrl: './delete-account-info.component.html',
  styleUrls: ['./delete-account-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, GaduGaduComponent, TranslateModule],
})
export class DeleteAccountInfoComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  ngOnInit() {}
}
