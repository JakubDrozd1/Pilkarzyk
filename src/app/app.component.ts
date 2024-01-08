import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BackgroundRunner } from '@capacitor/background-runner'
import { Capacitor } from '@capacitor/core'
import { IonicModule } from '@ionic/angular'
import { HttpClientModule } from '@angular/common/http'
import { register } from 'swiper/element/bundle'

register()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, HttpClientModule],
})
export class AppComponent {
  title = 'pilkarzyk'
  constructor() {
    this.init()
    this.testSave()
  }

  async init() {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissions = await BackgroundRunner.requestPermissions({
          apis: ['notifications'],
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
  async testSave() {
    if (Capacitor.isNativePlatform()) {
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.proman.pilkarzyk.notification',
        event: 'push-notification',
        details: {},
      })
    }
  }
}
