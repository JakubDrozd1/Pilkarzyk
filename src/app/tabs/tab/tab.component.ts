import { Component, OnDestroy, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DataService } from 'src/app/service/data/data.service'

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  standalone: true,
  imports: [IonicModule, RouterLink, TranslateModule],
})
export class TabComponent implements OnInit, OnDestroy {
  receivedData: number = 0
  private subscription: Subscription = new Subscription()

  constructor(
    private dataService: DataService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subscription = this.dataService.data$.subscribe((data) => {
      this.receivedData = data
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
