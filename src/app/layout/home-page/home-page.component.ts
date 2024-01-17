import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { HomeContentComponent } from '../../content/home/home-content/home-content.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GaduGaduComponent } from "../../helper/gadu-gadu/gadu-gadu.component";

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, HomeContentComponent, TranslateModule, GaduGaduComponent]
})
export class HomePageComponent {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('home')
  }

  ionViewWillLeave() {
    this.refreshDataService.refresh('home-leave')
  }
}
