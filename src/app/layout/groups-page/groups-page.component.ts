import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-groups-page',
    templateUrl: './groups-page.component.html',
    styleUrl: './groups-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class GroupsPageComponent {
}
