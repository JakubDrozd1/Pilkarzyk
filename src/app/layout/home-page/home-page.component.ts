import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HomeContentComponent } from "../../content/home/home-content/home-content.component";

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    standalone: true,
    imports: [CommonModule, IonicModule, HomeContentComponent]
})
export class HomePageComponent {
}
