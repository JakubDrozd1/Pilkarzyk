import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GROUPS } from 'libs/api-client'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

@Component({
  selector: 'app-groups-detail',
  templateUrl: './groups-detail.component.html',
  styleUrls: ['./groups-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    SpinnerComponent,
    RouterLink,
  ],
})
export class GroupsDetailComponent implements OnInit {
  @Input() group!: GROUPS

  idGroup: number = 0
  isReady: boolean = true

  constructor(public translate: TranslateService) {}

  ngOnInit() {}
}
