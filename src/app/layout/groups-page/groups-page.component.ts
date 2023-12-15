import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GroupsListComponent } from 'src/app/content/groups/groups-list/groups-list.component';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';

@Component({
    selector: 'app-groups-page',
    templateUrl: './groups-page.component.html',
    styleUrl: './groups-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, GroupsListComponent]
})
export class GroupsPageComponent {
    
    constructor(
        private refreshDataService: RefreshDataService
    ){
    }

    ionViewWillEnter() {
        this.refreshDataService.refresh('groups-list')
    }
}
