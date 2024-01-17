import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GroupsListComponent } from 'src/app/content/groups/groups-list/groups-list.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { GaduGaduComponent } from "../../helper/gadu-gadu/gadu-gadu.component";

@Component({
    selector: 'app-groups-page',
    templateUrl: './groups-page.component.html',
    styleUrl: './groups-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, GroupsListComponent, TranslateModule, GaduGaduComponent]
})
export class GroupsPageComponent {
  constructor(
    private refreshDataService: RefreshDataService,
    public translate: TranslateService
  ) {}

  ionViewWillEnter() {
    this.refreshDataService.refresh('groups-list')
  }
}
