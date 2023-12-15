import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProfileDetailsComponent } from "../../content/profile/profile-details/profile-details.component";
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, ProfileDetailsComponent]
})
export class ProfilePageComponent {
    
    constructor(
        private refreshDataService: RefreshDataService
    ){
    }

    ionViewWillEnter() {
        this.refreshDataService.refresh('profile-details')
    }
}
