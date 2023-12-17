import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tab',
    templateUrl: './tab.component.html',
    styleUrl: './tab.component.scss',
    standalone: true,
    imports: [IonicModule, RouterLink]
})
export class TabComponent {
}
