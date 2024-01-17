import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { ProfileDetailsComponent } from '../../content/profile/profile-details/profile-details.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GaduGaduComponent } from "../../helper/gadu-gadu/gadu-gadu.component";

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        ProfileDetailsComponent,
        TranslateModule,
        GaduGaduComponent
    ]
})
export class ProfilePageComponent {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {
  }

  ionViewWillEnter() {
    this.refreshDataService.refresh('profile-details')
  }
}
