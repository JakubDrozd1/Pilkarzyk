import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root',
})
export class Alert {
  constructor(
    private alertController: AlertController,
    public translate: TranslateService
  ) {}

  public async alertNotOk(message?: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('Error'),
      message: message ?? this.translate.instant('An error occured'),
      buttons: ['Ok'],
    })
    await alert.present()
  }

  public async alertOk(message?: string) {
    const alert = await this.alertController.create({
      header: 'OK',
      message: message ?? this.translate.instant('Successfully added'),
      buttons: ['Ok'],
    })
    await alert.present()
  }
}
