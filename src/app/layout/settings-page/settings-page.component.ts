import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class SettingsPageComponent {
}
