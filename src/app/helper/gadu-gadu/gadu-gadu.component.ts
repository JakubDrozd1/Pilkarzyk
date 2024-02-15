import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-gadu-gadu',
  templateUrl: './gadu-gadu.component.html',
  styleUrls: ['./gadu-gadu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class GaduGaduComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  ngOnInit() {}
}
