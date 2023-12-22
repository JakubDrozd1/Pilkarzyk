import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'

@Injectable({
  providedIn: 'root',
})
export class Alert {
  constructor(private alertController: AlertController) {}

  public async alertNotOk(message?: string) {
    const alert = await this.alertController.create({
      header: 'Błąd',
      message: message ?? 'Wystąpił błąd',
      buttons: ['Ok'],
    })
    await alert.present()
  }

  public async alertOk(message?: string) {
    const alert = await this.alertController.create({
      header: 'OK',
      message: message ?? 'Pomyślnie dodano',
      buttons: ['Ok'],
    })
    await alert.present()
  }
}
