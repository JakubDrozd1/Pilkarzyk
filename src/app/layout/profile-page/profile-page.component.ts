import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LogoutComponent } from "../../content/logout/logout.component";

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, LogoutComponent]
})
export class ProfilePageComponent {
}
