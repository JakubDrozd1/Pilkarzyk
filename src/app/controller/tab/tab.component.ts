import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/service/data/data.service';

@Component({
    selector: 'app-tab',
    templateUrl: './tab.component.html',
    styleUrl: './tab.component.scss',
    standalone: true,
    imports: [IonicModule, RouterLink]
})

export class TabComponent implements OnInit, OnDestroy {

    receivedData: number = 0
    private subscription: Subscription = new Subscription

    constructor(
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.subscription = this.dataService.data$.subscribe((data) => {
            this.receivedData = data
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }
}
