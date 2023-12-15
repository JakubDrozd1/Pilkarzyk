import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProfileDetailsComponent } from "../../content/profile/profile-details/profile-details.component";

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, ProfileDetailsComponent]
})
export class ProfilePageComponent {
}
