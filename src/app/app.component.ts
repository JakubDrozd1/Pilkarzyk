import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BackgroundRunner } from '@capacitor/background-runner'
import { Capacitor } from '@capacitor/core'
import { IonicModule } from '@ionic/angular'
import { HttpClientModule } from '@angular/common/http'
import { register } from 'swiper/element/bundle'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

register()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HttpClientModule,
    TranslateModule,
  ],
})
export class AppComponent {
  title = 'pilkarzyk'
  constructor(public translate: TranslateService) {
    this.setLanguage()
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

  setLanguage() {
    const userLang = navigator.language.split('-')[0]
    const defaultLang = this.translate.getBrowserLang()
    let langToUse = this.translate.getLangs().includes(userLang)
      ? userLang
      : defaultLang
    if (langToUse == 'pl' || langToUse == 'en') {
      this.translate.setDefaultLang(langToUse)
      this.translate.use(langToUse)
    } else {
      langToUse = 'en'
      this.translate.setDefaultLang(langToUse)
      this.translate.use(langToUse)
    }
  }
}
