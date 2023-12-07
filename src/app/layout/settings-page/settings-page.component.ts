import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LogoutComponent } from "../../content/logout/logout.component";

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, LogoutComponent]
})
export class SettingsPageComponent {
}
